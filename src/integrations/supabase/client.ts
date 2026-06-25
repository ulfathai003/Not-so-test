import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { toast } from "sonner";

/**
 * In-memory rate limiter (per browser tab / per server instance).
 * Prevents runaway loops and abusive request bursts.
 */
class RateLimiter {
  private limit: number;
  private windowMs: number;
  private requests: number[] = [];

  constructor(limit: number, windowMs: number = 60000) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  check(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter((t) => now - t < this.windowMs);
    if (this.requests.length >= this.limit) return false;
    this.requests.push(now);
    return true;
  }
}

// Rate limiting thresholds
const dbLimiter = new RateLimiter(60); // 60 DB requests per minute
const authLimiter = new RateLimiter(10); // 10 login/signup attempts per minute

function resolveConfig() {
  const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || process.env.SUPABASE_URL;
  const key =
    (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
    process.env.SUPABASE_PUBLISHABLE_KEY;
  return { url, key };
}

/**
 * Build the real Supabase client. Per the product spec the system must NEVER
 * fall back to mock data or local state — so if configuration is missing we
 * fail loudly instead of silently serving fake/localStorage data.
 */
function createRealClient(): SupabaseClient<Database> {
  const { url, key } = resolveConfig();

  if (!url || !key) {
    const message =
      "Supabase is not configured: missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY. " +
      "Set these in your .env file and in the Vercel project environment variables.";
    if (typeof window !== "undefined") {
      // eslint-disable-next-line no-console
      console.error(message);
    }
    throw new Error(message);
  }

  return createClient<Database>(url, key, {
    auth: {
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

/**
 * Wrap the real client with rate limiting on database queries and auth calls,
 * binding every other method to the real client so `this` stays correct.
 */
function withRateLimits(client: SupabaseClient<Database>): SupabaseClient<Database> {
  return new Proxy(client, {
    get(target: any, prop: string | symbol, receiver: any) {
      if (prop === "from") {
        return (table: string) => {
          if (!dbLimiter.check()) {
            if (typeof window !== "undefined") {
              toast.error("Too many database requests. Please wait a moment and try again.");
            }
            throw new Error("Rate limit exceeded: too many database queries.");
          }
          return target.from(table);
        };
      }

      if (prop === "auth") {
        const auth = target.auth;
        return new Proxy(auth, {
          get(authTarget: any, authProp: string | symbol) {
            const val = Reflect.get(authTarget, authProp);
            if (
              typeof val === "function" &&
              (authProp === "signInWithPassword" || authProp === "signUp")
            ) {
              return async (...args: any[]) => {
                if (!authLimiter.check()) {
                  if (typeof window !== "undefined") {
                    toast.error("Too many login attempts. Please wait a minute and try again.");
                  }
                  throw new Error("Rate limit exceeded: too many authentication attempts.");
                }
                return val.apply(authTarget, args);
              };
            }
            return typeof val === "function" ? val.bind(authTarget) : val;
          },
        });
      }

      const val = Reflect.get(target, prop, receiver);
      return typeof val === "function" ? val.bind(target) : val;
    },
  }) as SupabaseClient<Database>;
}

let _supabase: SupabaseClient<Database> | null = null;

function getClient(): SupabaseClient<Database> {
  if (!_supabase) {
    _supabase = withRateLimits(createRealClient());
  }
  return _supabase;
}

// Lazy proxy: the real client is constructed on first use.
// Exported as `any` to match the rest of the codebase, which queries tables
// (universities, centers, employees, documents) not yet in the generated types.
export const supabase: any = new Proxy({} as any, {
  get(_target, prop, receiver) {
    return Reflect.get(getClient() as any, prop, receiver);
  },
});
