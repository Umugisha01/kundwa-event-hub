import { Link } from "react-router-dom";
import { Ticket, Wrench, Calendar, ChevronDown, Sparkles, Zap } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-[100svh] flex items-center overflow-hidden">

      {/* ── Video backgrounds ── */}
      <div className="absolute inset-0">
        {/* Desktop */}
        <video
          className="hidden md:block absolute inset-0 w-full h-full object-cover"
          src="/main_01.mp4"
          autoPlay muted loop playsInline
        />
        {/* Mobile */}
        <video
          className="block md:hidden absolute inset-0 w-full h-full object-cover"
          src="/main_02.mp4"
          autoPlay muted loop playsInline
        />

        {/* Cinematic gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(220,50%,6%)]/95 via-[hsl(220,55%,10%)]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(220,50%,4%)]/90 via-transparent to-[hsl(220,50%,4%)]/30" />
        {/* Gold shimmer accent at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary/60 to-transparent" />
      </div>

      {/* ── Floating ambient orbs ── */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none animate-float" />
      <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" style={{ animationDelay: "1.5s" }} />

      {/* ── Main content ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-28 pb-24 md:pt-36 md:pb-28">
        <div className="max-w-3xl">

          {/* Live badge */}
          <div className="inline-flex items-center gap-2.5 bg-secondary/10 backdrop-blur-md border border-secondary/25 rounded-full px-5 py-2 mb-8 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
            </span>
            <span className="text-secondary text-sm font-semibold tracking-wide">
              Africa's Premier Event Company
            </span>
          </div>

          {/* Headline */}
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-white leading-[1.05] tracking-tight mb-6 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            Creating{" "}
            <span className="relative inline-block">
              <span className="text-secondary drop-shadow-[0_0_30px_hsl(44,87%,62%,0.5)]">
                Unforgettable
              </span>
              {/* underline accent */}
              <svg className="absolute -bottom-2 left-0 w-full" height="6" viewBox="0 0 200 6" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M0 3 Q50 6 100 3 Q150 0 200 3" stroke="hsl(44,87%,62%)" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
              </svg>
            </span>
            <br />
            Experiences
          </h1>

          {/* Sub-text */}
          <p
            className="text-lg sm:text-xl text-white/70 mb-10 leading-relaxed max-w-xl animate-fade-in font-light"
            style={{ animationDelay: "0.2s" }}
          >
            From world-class sound systems to breathtaking stage designs — we bring your vision to life. Event production, management, and equipment rental all in one place.
          </p>

          {/* CTA buttons */}
          <div
            className="flex flex-wrap gap-4 animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            {/* Primary gold CTA */}
            <Link to="/services">
              <button className="relative group px-7 py-3.5 rounded-2xl font-bold text-base text-[hsl(204,80%,10%)] overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-secondary/30 flex items-center gap-2">
                <span className="absolute inset-0 bg-secondary transition-all duration-300 group-hover:brightness-110" />
                <span className="absolute inset-0 opacity-0 group-hover:opacity-30 bg-white blur-xl transition-opacity" />
                <Calendar className="relative h-5 w-5" />
                <span className="relative">Book a Service</span>
              </button>
            </Link>

            {/* Ticket outline CTA */}
            <Link to="/events">
              <button className="px-7 py-3.5 rounded-2xl font-bold text-base text-white border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-secondary/50 hover:text-secondary transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                Buy Ticket
              </button>
            </Link>

            {/* Rent equipment */}
            <Link to="/rentals">
              <button className="px-7 py-3.5 rounded-2xl font-bold text-base text-white border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/30 transition-all duration-300 hover:scale-105 flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Rent Equipment
              </button>
            </Link>
          </div>

          {/* Floating feature pills */}
          <div
            className="flex flex-wrap gap-3 mt-10 animate-fade-in"
            style={{ animationDelay: "0.45s" }}
          >
            {[
              { icon: Zap, text: "Professional Sound" },
              { icon: Sparkles, text: "Stage Lighting" },
              { icon: Calendar, text: "Full Event Management" },
            ].map(({ icon: Icon, text }) => (
              <span
                key={text}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/6 backdrop-blur-sm border border-white/10 text-white/60 text-xs font-medium hover:border-secondary/30 hover:text-secondary/80 transition-all duration-300"
              >
                <Icon className="h-3.5 w-3.5 text-secondary" />
                {text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 animate-bounce">
        <span className="text-white/30 text-[10px] tracking-[0.2em] uppercase font-medium">Scroll</span>
        <ChevronDown className="h-5 w-5 text-secondary/50" />
      </div>
    </section>
  );
}
