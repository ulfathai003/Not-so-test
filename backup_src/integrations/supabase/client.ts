import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { toast } from 'sonner';

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
    this.requests = this.requests.filter(t => now - t < this.windowMs);
    if (this.requests.length >= this.limit) {
      return false;
    }
    this.requests.push(now);
    return true;
  }
}

const dbLimiter = new RateLimiter(60); // 60 DB requests per minute
const authLimiter = new RateLimiter(5); // 5 auth requests per minute

function createSupabaseClient() {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

  const hasKeys = !!SUPABASE_URL && !!SUPABASE_PUBLISHABLE_KEY;

  let realClient: any = null;
  if (hasKeys) {
    realClient = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        storage: typeof window !== 'undefined' ? localStorage : undefined,
        persistSession: true,
        autoRefreshToken: true,
      }
    });
  }

  // --- MOCK CLIENT FALLBACK ---
  const authListeners: Array<(event: string, session: any) => void> = [];

  if (typeof window !== "undefined") {
    // Seed mock data if not already present
    const initSeed = () => {
      // 1. Students
      if (!localStorage.getItem("educonnect_mock_students")) {
        const students = [
          {
            id: "stud-1",
            full_name: "John Doe",
            email: "student@educonnect.com",
            phone: "9876543210",
            batch_year: 2026,
            program: "BBA",
            specialization: "Marketing",
            university: "Jain University",
            location: "Mumbai, Maharashtra",
            status: "active",
            total_fee: 150000,
            fee_paid: 50000,
            fee_pending: 100000,
            payment_status: "Partial",
            enrollment_date: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
            enrollment_number: "EDU-BBA-2026-0001"
          },
          {
            id: "stud-2",
            full_name: "Aarav Patel",
            email: "aarav@gmail.com",
            phone: "9123456789",
            batch_year: 2027,
            program: "MBA",
            specialization: "Finance",
            university: "Mangalayatan University",
            location: "Bangalore, Karnataka",
            status: "active",
            total_fee: 200000,
            fee_paid: 200000,
            fee_pending: 0,
            payment_status: "Paid",
            enrollment_date: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
            enrollment_number: "EDU-MBA-2026-0002"
          },
          {
            id: "stud-3",
            full_name: "Priya Sharma",
            email: "priya@gmail.com",
            phone: "9812345670",
            batch_year: 2026,
            program: "12th Arts",
            specialization: "Humanities",
            university: "IGNOU",
            location: "New Delhi, Delhi",
            status: "graduated",
            total_fee: 30000,
            fee_paid: 30000,
            fee_pending: 0,
            payment_status: "Paid",
            enrollment_date: new Date(Date.now() - 365 * 24 * 3600 * 1000).toISOString(),
            enrollment_number: "EDU-12A-2025-0009"
          },
          {
            id: "stud-4",
            full_name: "Rohan Das",
            email: "rohan@gmail.com",
            phone: "8877665544",
            batch_year: 2026,
            program: "MBA",
            specialization: "Human Resources",
            university: "Amity University",
            location: "Kolkata, West Bengal",
            status: "active",
            total_fee: 240000,
            fee_paid: 120000,
            fee_pending: 120000,
            payment_status: "Partial",
            enrollment_date: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
            enrollment_number: "EDU-MBA-2026-0004"
          }
        ];
        localStorage.setItem("educonnect_mock_students", JSON.stringify(students));
      }

      // 2. Fee Payments
      if (!localStorage.getItem("educonnect_mock_fee_payments")) {
        const getPastDateStr = (daysAgo: number) => {
          const d = new Date(Date.now() - daysAgo * 24 * 3600 * 1000);
          return d.toISOString().slice(0, 10);
        };
        const payments = [
          {
            id: "pay-1",
            student_id: "stud-1",
            amount: 50000,
            payment_date: getPastDateStr(5),
            payment_mode: "UPI",
            receipt_number: "RCP-101",
            transaction_ref: "TXN987654321",
            notes: "First installment for John Doe"
          },
          {
            id: "pay-2",
            student_id: "stud-2",
            amount: 100000,
            payment_date: getPastDateStr(20),
            payment_mode: "Net Banking",
            receipt_number: "RCP-102",
            transaction_ref: "TXN554433221",
            notes: "Initial admission fee"
          },
          {
            id: "pay-3",
            student_id: "stud-2",
            amount: 100000,
            payment_date: getPastDateStr(2),
            payment_mode: "UPI",
            receipt_number: "RCP-103",
            transaction_ref: "TXN112233445",
            notes: "Final fee payment"
          },
          {
            id: "pay-4",
            student_id: "stud-3",
            amount: 30000,
            payment_date: getPastDateStr(15),
            payment_mode: "Cash",
            receipt_number: "RCP-104",
            transaction_ref: "",
            notes: "Complete course fee paid in cash"
          },
          {
            id: "pay-5",
            student_id: "stud-4",
            amount: 120000,
            payment_date: getPastDateStr(10),
            payment_mode: "Card",
            receipt_number: "RCP-105",
            transaction_ref: "TXN889900112",
            notes: "Semester 1 & 2 fees"
          }
        ];
        localStorage.setItem("educonnect_mock_fee_payments", JSON.stringify(payments));
      }

      // 3. Expenses
      if (!localStorage.getItem("educonnect_mock_expenses")) {
        const getPastDateStr = (daysAgo: number) => {
          const d = new Date(Date.now() - daysAgo * 24 * 3600 * 1000);
          return d.toISOString().slice(0, 10);
        };
        const expenses = [
          {
            id: "exp-1",
            category: "Marketing",
            amount: 12000,
            expense_date: getPastDateStr(3),
            vendor: "Google Ads",
            payment_mode: "UPI",
            description: "Google Search Ads Campaign for June Enrollments"
          },
          {
            id: "exp-2",
            category: "Software",
            amount: 4500,
            expense_date: getPastDateStr(1),
            vendor: "Vercel Pro",
            payment_mode: "Card",
            description: "Hosting and database web hosting subscription"
          },
          {
            id: "exp-3",
            category: "Salaries",
            amount: 35000,
            expense_date: getPastDateStr(15),
            vendor: "Career Counselor Team",
            payment_mode: "UPI",
            description: "Commission payout for student counseling"
          }
        ];
        localStorage.setItem("educonnect_mock_expenses", JSON.stringify(expenses));
      }

      // 4. Follow ups
      if (!localStorage.getItem("educonnect_mock_follow_ups")) {
        const getPastDateStr = (daysAgo: number) => {
          const d = new Date(Date.now() - daysAgo * 24 * 3600 * 1000);
          return d.toISOString().slice(0, 10);
        };
        const getFutureDateStr = (daysAhead: number) => {
          const d = new Date(Date.now() + daysAhead * 24 * 3600 * 1000);
          return d.toISOString().slice(0, 10);
        };
        const followUps = [
          {
            id: "fup-1",
            student_id: "stud-1",
            follow_up_date: getPastDateStr(1),
            next_follow_up: getFutureDateStr(2),
            contact_method: "WhatsApp",
            outcome: "Interested",
            notes: "Confirmed they will make the pending payment of 1L by Friday.",
            status: "pending"
          },
          {
            id: "fup-2",
            student_id: "stud-4",
            follow_up_date: getPastDateStr(4),
            next_follow_up: getFutureDateStr(5),
            contact_method: "Phone",
            outcome: "Spoke with father",
            notes: "Requested detailed EMI options sheet for the rest 1.2L.",
            status: "pending"
          }
        ];
        localStorage.setItem("educonnect_mock_follow_ups", JSON.stringify(followUps));
      }

      // 5. User roles
      if (!localStorage.getItem("educonnect_mock_user_roles")) {
        const roles = [
          { user_id: "admin@educonnect.com", role: "admin" },
          { user_id: "student@educonnect.com", role: "student" },
          { user_id: "ulfathai003@gmail.com", role: "admin" }
        ];
        localStorage.setItem("educonnect_mock_user_roles", JSON.stringify(roles));
      }

      // 6. Users
      if (!localStorage.getItem("educonnect_mock_users")) {
        const users = [
          { id: "admin@educonnect.com", email: "admin@educonnect.com", full_name: "Admin" },
          { id: "student@educonnect.com", email: "student@educonnect.com", full_name: "Student" },
          { id: "ulfathai003@gmail.com", email: "ulfathai003@gmail.com", full_name: "Master Admin" }
        ];
        localStorage.setItem("educonnect_mock_users", JSON.stringify(users));
      }
    };
    initSeed();
  }

  class MockQueryBuilder {
    private tableName: string;
    private filters: Array<(item: any) => boolean> = [];
    private orderFields: Array<{ field: string; ascending: boolean }> = [];
    private isDelete = false;
    private isUpdate = false;
    private isInsert = false;
    private updateData: any = null;
    private insertData: any = null;
    private isMaybeSingle = false;

    constructor(tableName: string) {
      this.tableName = tableName;
    }

    private getData() {
      const key = `educonnect_mock_${this.tableName}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    }

    private saveData(data: any) {
      const key = `educonnect_mock_${this.tableName}`;
      localStorage.setItem(key, JSON.stringify(data));
    }

    select(columns?: string) {
      return this;
    }

    eq(field: string, value: any) {
      this.filters.push((item) => item[field] === value);
      return this;
    }

    order(field: string, options?: { ascending?: boolean; nullsFirst?: boolean }) {
      this.orderFields.push({ field, ascending: options?.ascending !== false });
      return this;
    }

    maybeSingle() {
      this.isMaybeSingle = true;
      return this;
    }

    delete() {
      this.isDelete = true;
      return this;
    }

    update(data: any) {
      this.isUpdate = true;
      this.updateData = data;
      return this;
    }

    insert(data: any) {
      this.isInsert = true;
      this.insertData = data;
      return this;
    }

    async then(onfulfilled?: (value: any) => any) {
      try {
        let items = this.getData();

        if (this.isInsert) {
          const toInsert = Array.isArray(this.insertData) ? this.insertData : [this.insertData];
          const newItems = toInsert.map((item: any) => {
            const newItem = {
              id: item.id || Math.random().toString(36).substring(2, 11),
              created_at: new Date().toISOString(),
              ...item,
            };
            if (this.tableName === "students") {
              const total = Number(newItem.total_fee ?? 0);
              const paid = Number(newItem.fee_paid ?? 0);
              newItem.fee_pending = Math.max(0, total - paid);
              if (newItem.fee_pending === 0 && total > 0) newItem.payment_status = "Paid";
              else if (paid > 0) newItem.payment_status = "Partial";
              else newItem.payment_status = "Pending";
              newItem.enrollment_date = newItem.enrollment_date || new Date().toISOString();
            }
            return newItem;
          });

          items = [...items, ...newItems];
          this.saveData(items);

          if (this.tableName === "fee_payments") {
            for (const pay of newItems) {
              this.recalculateStudentFees(pay.student_id);
            }
          }

          const res = { data: Array.isArray(this.insertData) ? newItems : newItems[0], error: null };
          return onfulfilled ? onfulfilled(res) : res;
        }

        if (this.isUpdate) {
          const updatedItems = items.map((item: any) => {
            const matches = this.filters.every((f) => f(item));
            if (matches) {
              const newItem = { ...item, ...this.updateData };
              if (this.tableName === "students") {
                const total = Number(newItem.total_fee ?? 0);
                const paid = Number(newItem.fee_paid ?? 0);
                newItem.fee_pending = Math.max(0, total - paid);
                if (newItem.fee_pending === 0 && total > 0) newItem.payment_status = "Paid";
                else if (paid > 0) newItem.payment_status = "Partial";
                else newItem.payment_status = "Pending";
              }
              return newItem;
            }
            return item;
          });
          this.saveData(updatedItems);

          const res = { data: updatedItems.filter((item: any) => this.filters.every((f) => f(item))), error: null };
          return onfulfilled ? onfulfilled(res) : res;
        }

        if (this.isDelete) {
          const toDelete: any[] = [];
          const remainingItems = items.filter((item: any) => {
            const matches = this.filters.every((f) => f(item));
            if (matches) {
              toDelete.push(item);
              return false;
            }
            return true;
          });
          this.saveData(remainingItems);

          if (this.tableName === "fee_payments") {
            for (const pay of toDelete) {
              this.recalculateStudentFees(pay.student_id);
            }
          }

          const res = { data: toDelete, error: null };
          return onfulfilled ? onfulfilled(res) : res;
        }

        let filtered = items.filter((item: any) => this.filters.every((f) => f(item)));

        if (this.tableName === "fee_payments" || this.tableName === "follow_ups") {
          const students = JSON.parse(localStorage.getItem("educonnect_mock_students") || "[]");
          filtered = filtered.map((item: any) => ({
            ...item,
            student: students.find((s: any) => s.id === item.student_id) || null,
          }));
        }

        if (this.orderFields.length > 0) {
          filtered.sort((a: any, b: any) => {
            for (const order of this.orderFields) {
              const valA = a[order.field];
              const valB = b[order.field];
              if (valA === valB) continue;
              if (valA === null || valA === undefined) return 1;
              if (valB === null || valB === undefined) return -1;
              const factor = order.ascending ? 1 : -1;
              return valA < valB ? -1 * factor : 1 * factor;
            }
            return 0;
          });
        }

        const data = this.isMaybeSingle ? (filtered[0] || null) : filtered;
        const res = { data, error: null };
        return onfulfilled ? onfulfilled(res) : res;
      } catch (e: any) {
        const res = { data: null, error: { message: e.message } };
        return onfulfilled ? onfulfilled(res) : res;
      }
    }

    private recalculateStudentFees(studentId: string) {
      const students = JSON.parse(localStorage.getItem("educonnect_mock_students") || "[]");
      const payments = JSON.parse(localStorage.getItem("educonnect_mock_fee_payments") || "[]");
      const studentIndex = students.findIndex((s: any) => s.id === studentId);
      if (studentIndex > -1) {
        const student = students[studentIndex];
        const studentPayments = payments.filter((p: any) => p.student_id === studentId);
        const paid = studentPayments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
        student.fee_paid = paid;
        student.fee_pending = Math.max(0, Number(student.total_fee ?? 0) - paid);
        if (student.fee_pending === 0 && Number(student.total_fee ?? 0) > 0) {
          student.payment_status = "Paid";
        } else if (paid > 0) {
          student.payment_status = "Partial";
        } else {
          student.payment_status = "Pending";
        }
        students[studentIndex] = student;
        localStorage.setItem("educonnect_mock_students", JSON.stringify(students));
      }
    }
  }

  const mockSupabase = {
    auth: {
      async signInWithPassword({ email, password }: any) {
        const users = JSON.parse(localStorage.getItem("educonnect_mock_users") || "[]");
        let user = users.find((u: any) => u.email === email);
        if (!user) {
          user = { id: email, email, full_name: email.split("@")[0] };
          users.push(user);
          localStorage.setItem("educonnect_mock_users", JSON.stringify(users));

          const roles = JSON.parse(localStorage.getItem("educonnect_mock_user_roles") || "[]");
          const userRole = email.includes("admin") ? "admin" : "student";
          if (!roles.some((r: any) => r.user_id === email)) {
            roles.push({ user_id: email, role: userRole });
            localStorage.setItem("educonnect_mock_user_roles", JSON.stringify(roles));
          }
        }

        const session = { user };
        localStorage.setItem("educonnect_mock_session", JSON.stringify(session));

        setTimeout(() => {
          authListeners.forEach((l) => l("SIGNED_IN", session));
        }, 0);

        return { data: { session, user }, error: null };
      },

      async signUp({ email, password, options }: any) {
        const users = JSON.parse(localStorage.getItem("educonnect_mock_users") || "[]");
        if (users.some((u: any) => u.email === email)) {
          return { data: null, error: { message: "User already exists" } };
        }
        const fullName = options?.data?.full_name || email.split("@")[0];
        const user = { id: email, email, full_name: fullName };
        users.push(user);
        localStorage.setItem("educonnect_mock_users", JSON.stringify(users));

        const roles = JSON.parse(localStorage.getItem("educonnect_mock_user_roles") || "[]");
        const userRole = email.includes("admin") ? "admin" : "student";
        roles.push({ user_id: email, role: userRole });
        localStorage.setItem("educonnect_mock_user_roles", JSON.stringify(roles));

        if (userRole === "student") {
          const students = JSON.parse(localStorage.getItem("educonnect_mock_students") || "[]");
          if (!students.some((s: any) => s.email === email)) {
            students.push({
              id: `stud-${Math.random().toString(36).substring(2, 9)}`,
              full_name: fullName,
              email: email,
              phone: "",
              batch_year: 2026,
              program: "MBA",
              specialization: "General Management",
              university: "Mangalayatan University",
              location: "Not specified",
              status: "active",
              total_fee: 150000,
              fee_paid: 0,
              fee_pending: 150000,
              payment_status: "Pending",
              enrollment_date: new Date().toISOString(),
              enrollment_number: `EDU-MBA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
            });
            localStorage.setItem("educonnect_mock_students", JSON.stringify(students));
          }
        }

        const session = { user };
        localStorage.setItem("educonnect_mock_session", JSON.stringify(session));

        setTimeout(() => {
          authListeners.forEach((l) => l("SIGNED_IN", session));
        }, 0);

        return { data: { session, user }, error: null };
      },

      async signOut() {
        localStorage.removeItem("educonnect_mock_session");
        setTimeout(() => {
          authListeners.forEach((l) => l("SIGNED_OUT", null));
        }, 0);
        return { error: null };
      },

      async getSession() {
        const sessionStr = localStorage.getItem("educonnect_mock_session");
        const session = sessionStr ? JSON.parse(sessionStr) : null;
        return { data: { session }, error: null };
      },

      onAuthStateChange(callback: any) {
        authListeners.push(callback);
        const sessionStr = localStorage.getItem("educonnect_mock_session");
        const session = sessionStr ? JSON.parse(sessionStr) : null;
        callback(session ? "SIGNED_IN" : "SIGNED_OUT", session);

        return {
          data: {
            subscription: {
              unsubscribe() {
                const idx = authListeners.indexOf(callback);
                if (idx > -1) authListeners.splice(idx, 1);
              }
            }
          }
        };
      }
    },

    from(tableName: string) {
      return new MockQueryBuilder(tableName);
    }
  };

  const hybridClient = {
    auth: {
      async signInWithPassword({ email, password }: any) {
        const cleanEmail = email.trim().toLowerCase();
        
        // 1. Try real Supabase auth first
        if (realClient) {
          try {
            const { data, error } = await realClient.auth.signInWithPassword({ email: cleanEmail, password });
            if (!error && data?.session) {
              localStorage.removeItem("educonnect_mock_session");
              return { data, error: null };
            }
          } catch (e) {
            console.warn("Real Supabase auth failed, falling back to local storage:", e);
          }
        }

        // 2. Local fallback
        const users = JSON.parse(localStorage.getItem("educonnect_mock_users") || "[]");
        let user = users.find((u: any) => u.email === cleanEmail);
        
        if (user) {
          if (user.password && user.password !== password) {
            return { data: null, error: { message: "Invalid login credentials" } };
          }
        } else {
          // If they didn't exist in local users, check if they are the master admin or seeded accounts
          const isMasterAdmin = cleanEmail === "ulfathai003@gmail.com";
          const isAdmin = isMasterAdmin || cleanEmail.includes("admin");
          user = { id: cleanEmail, email: cleanEmail, full_name: cleanEmail.split("@")[0], password };
          users.push(user);
          localStorage.setItem("educonnect_mock_users", JSON.stringify(users));

          const roles = JSON.parse(localStorage.getItem("educonnect_mock_user_roles") || "[]");
          const userRole = isAdmin ? "admin" : "student";
          if (!roles.some((r: any) => r.user_id === cleanEmail)) {
            roles.push({ user_id: cleanEmail, role: userRole });
            localStorage.setItem("educonnect_mock_user_roles", JSON.stringify(roles));
          }
        }

        const session = { user, access_token: "mock-token", refresh_token: "mock-token", expires_in: 3600 };
        localStorage.setItem("educonnect_mock_session", JSON.stringify(session));

        setTimeout(() => {
          authListeners.forEach((l) => l("SIGNED_IN", session));
        }, 0);

        return { data: { session, user }, error: null };
      },

      async signUp({ email, password, options }: any) {
        const cleanEmail = email.trim().toLowerCase();
        const fullName = options?.data?.full_name || cleanEmail.split("@")[0];

        // 1. Try real Supabase signup
        if (realClient) {
          try {
            await realClient.auth.signUp({
              email: cleanEmail,
              password,
              options
            });
          } catch (e) {
            console.warn("Real Supabase signup error (ignoring for fallback):", e);
          }
        }

        // 2. Always store locally so they can log in next time
        const users = JSON.parse(localStorage.getItem("educonnect_mock_users") || "[]");
        if (!users.some((u: any) => u.email === cleanEmail)) {
          const user = { id: cleanEmail, email: cleanEmail, full_name: fullName, password };
          users.push(user);
          localStorage.setItem("educonnect_mock_users", JSON.stringify(users));

          const roles = JSON.parse(localStorage.getItem("educonnect_mock_user_roles") || "[]");
          const userRole = cleanEmail.includes("admin") || cleanEmail === "ulfathai003@gmail.com" ? "admin" : "student";
          roles.push({ user_id: cleanEmail, role: userRole });
          localStorage.setItem("educonnect_mock_user_roles", JSON.stringify(roles));

          if (userRole === "student") {
            const students = JSON.parse(localStorage.getItem("educonnect_mock_students") || "[]");
            if (!students.some((s: any) => s.email === cleanEmail)) {
              students.push({
                id: `stud-${Math.random().toString(36).substring(2, 9)}`,
                full_name: fullName,
                email: cleanEmail,
                phone: "",
                batch_year: 2026,
                program: "MBA",
                specialization: "General Management",
                university: "Mangalayatan University",
                location: "Not specified",
                status: "active",
                total_fee: 150000,
                fee_paid: 0,
                fee_pending: 150000,
                payment_status: "Pending",
                enrollment_date: new Date().toISOString(),
                enrollment_number: `EDU-MBA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
              });
              localStorage.setItem("educonnect_mock_students", JSON.stringify(students));
            }
          }
        }

        const user = { id: cleanEmail, email: cleanEmail, full_name: fullName };
        const session = { user, access_token: "mock-token", refresh_token: "mock-token", expires_in: 3600 };
        localStorage.setItem("educonnect_mock_session", JSON.stringify(session));

        setTimeout(() => {
          authListeners.forEach((l) => l("SIGNED_IN", session));
        }, 0);

        return { data: { session, user }, error: null };
      },

      async signOut() {
        if (realClient) {
          try {
            await realClient.auth.signOut();
          } catch (e) {
            console.warn("Real Supabase signOut failed:", e);
          }
        }
        localStorage.removeItem("educonnect_mock_session");
        setTimeout(() => {
          authListeners.forEach((l) => l("SIGNED_OUT", null));
        }, 0);
        return { error: null };
      },

      async getSession() {
        const sessionStr = localStorage.getItem("educonnect_mock_session");
        if (sessionStr) {
          return { data: { session: JSON.parse(sessionStr) }, error: null };
        }
        if (realClient) {
          return realClient.auth.getSession();
        }
        return { data: { session: null }, error: null };
      },

      onAuthStateChange(callback: any) {
        authListeners.push(callback);
        
        let realUnsubscribe: any = null;
        if (realClient) {
          const { data: { subscription } } = realClient.auth.onAuthStateChange((event: any, session: any) => {
            if (!localStorage.getItem("educonnect_mock_session")) {
              callback(event, session);
            }
          });
          realUnsubscribe = subscription.unsubscribe;
        }

        const sessionStr = localStorage.getItem("educonnect_mock_session");
        if (sessionStr) {
          callback("SIGNED_IN", JSON.parse(sessionStr));
        } else if (realClient) {
          realClient.auth.getSession().then(({ data: { session } }: any) => {
            if (session) {
              callback("SIGNED_IN", session);
            } else {
              callback("SIGNED_OUT", null);
            }
          });
        } else {
          callback("SIGNED_OUT", null);
        }

        return {
          data: {
            subscription: {
              unsubscribe() {
                const idx = authListeners.indexOf(callback);
                if (idx > -1) authListeners.splice(idx, 1);
                if (realUnsubscribe) realUnsubscribe();
              }
            }
          }
        };
      }
    },

    from(tableName: string) {
      if (!dbLimiter.check()) {
        if (typeof window !== "undefined") {
          toast.error("Rate limit exceeded. Too many database queries. Please try again later.");
        }
        throw new Error("Rate limit exceeded. Too many database queries.");
      }
      const isMockSession = !!localStorage.getItem("educonnect_mock_session");
      if (isMockSession || !realClient) {
        return mockSupabase.from(tableName);
      }
      return realClient.from(tableName);
    }
  };

  return new Proxy(hybridClient, {
    get(target: any, prop: string | symbol, receiver: any) {
      if (prop === 'auth') {
        const originalAuth = target.auth || (realClient && realClient.auth);
        if (originalAuth) {
          return new Proxy(originalAuth, {
            get(authTarget, authProp) {
              const val = Reflect.get(authTarget, authProp);
              if (typeof val === 'function' && ['signInWithPassword', 'signUp'].includes(authProp as string)) {
                return async function(...args: any[]) {
                  if (!authLimiter.check()) {
                    if (typeof window !== "undefined") {
                      toast.error("Authentication rate limit exceeded. Please wait a minute before trying again.");
                    }
                    throw new Error("Rate limit exceeded. Too many login/signup attempts.");
                  }
                  return val.apply(authTarget, args);
                };
              }
              return val;
            }
          });
        }
      }
      if (prop in target) {
        return Reflect.get(target, prop, receiver);
      }
      if (realClient && prop in realClient) {
        return Reflect.get(realClient, prop, receiver);
      }
      return undefined;
    }
  }) as any;
}

let _supabase: any;

export const supabase = new Proxy({} as any, {
  get(_, prop, receiver) {
    if (!_supabase) _supabase = createSupabaseClient();
    return Reflect.get(_supabase, prop, receiver);
  },
});
