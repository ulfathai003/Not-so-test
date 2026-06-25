import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="news-paper border-t-[3px] border-double border-foreground">
      <div className="container mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h3 className="font-headline text-3xl">JoinOnline Education</h3>
          <p className="news-byline mt-1">Published Daily · Bengaluru · Est. 2016</p>
        </div>
        <div className="news-divider-double pt-6 grid gap-8 md:grid-cols-4 font-serif-news text-sm">
          <div>
            <h4 className="news-kicker mb-3">The Paper</h4>
            <p className="leading-relaxed">
              Distance learning, faithfully reported. UGC-DEB recognised programs from India's
              most respected universities, brought to your doorstep.
            </p>
          </div>
          <div>
            <h4 className="news-kicker mb-3">Programs</h4>
            <ul className="space-y-1.5">
              <li><Link to="/programs" className="news-link">Online MBA</Link></li>
              <li><Link to="/programs" className="news-link">Online BBA</Link></li>
              <li><Link to="/programs" className="news-link">Specializations</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="news-kicker mb-3">Universities</h4>
            <ul className="space-y-1.5">
              <li>Jain (Deemed-to-be) University</li>
              <li>Manipal University</li>
              <li>Amity · NMIMS · IGNOU · LPU</li>
            </ul>
          </div>
          <div>
            <h4 className="news-kicker mb-3">Desk</h4>
            <ul className="space-y-1.5">
              <li><Link to="/about" className="news-link">About</Link></li>
              <li><Link to="/contact" className="news-link">Contact</Link></li>
              <li><Link to="/login" className="news-link">Subscriber Login</Link></li>
            </ul>
          </div>
        </div>
        <div className="news-divider mt-8 pt-4 text-center text-xs font-serif-news uppercase tracking-widest">
          © {new Date().getFullYear()} JoinOnline Education · All Rights Reserved
        </div>
      </div>
    </footer>
  );
}
