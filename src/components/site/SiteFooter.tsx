import { Link } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-gradient-soft">
      <div className="container mx-auto px-4 py-12 grid gap-8 md:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2 font-display font-bold">
            <span className="grid place-items-center w-8 h-8 rounded-lg bg-gradient-hero">
              <GraduationCap className="w-4 h-4 text-primary-foreground" />
            </span>
            EduConnect
          </Link>
          <p className="text-sm text-muted-foreground mt-3 max-w-xs">
            Distance learning, redefined. UGC-DEB recognised programs from India's top universities.
          </p>
        </div>
        <div>
          <h4 className="font-display font-semibold text-sm mb-3">Programs</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/programs">Online MBA</Link></li>
            <li><Link to="/programs">Online BBA</Link></li>
            <li><Link to="/programs">Specializations</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-semibold text-sm mb-3">Universities</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Jain (Deemed-to-be) University</li>
            <li>Manipal University</li>
            <li>Amity, NMIMS, IGNOU, LPU</li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-semibold text-sm mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/login">Student / Admin login</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} EduConnect Distance Learning. All rights reserved.
      </div>
    </footer>
  );
}
