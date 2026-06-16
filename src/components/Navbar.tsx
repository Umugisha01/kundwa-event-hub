import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Globe, LogIn, Sun, Moon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

const publicLinks = [
  { to: "/",          label: "Home",      labelRw: "Ahabanza"   },
  { to: "/services",  label: "Services",  labelRw: "Serivisi"   },
  { to: "/portfolio", label: "Portfolio", labelRw: "Inzira"     },
  { to: "/rentals",   label: "Rentals",   labelRw: "Gukodesha"  },
  { to: "/events",    label: "Events",    labelRw: "Ibirori"    },
  { to: "/contact",   label: "Contact",   labelRw: "Twandikire" },
];

// Sophisticated Dark Blue palette
const BLUE   = "hsl(220, 55%, 22%)";   // sophisticated dark off-blue
const BLUE_D = "hsl(220, 60%, 15%)";   // deeper pressed state

export function Navbar() {
  const [isOpen,  setIsOpen]  = useState(false);
  const [lang,    setLang]    = useState<"en" | "rw">("en");
  const [scrollY, setScrollY] = useState(0);
  const [mouseX,  setMouseX]  = useState(50);
  const navRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const { user, role } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === "dark";

  const navLinks = [
    ...publicLinks,
    ...(user             ? [{ to: "/dashboard", label: "Dashboard", labelRw: "Ikibaho"   }] : []),
    ...(role === "admin" ? [{ to: "/admin",     label: "Admin",     labelRw: "Ubuyobozi" }] : []),
  ];

  /* scroll tracking */
  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* mouse X for shimmer */
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (!navRef.current) return;
      const r = navRef.current.getBoundingClientRect();
      setMouseX(((e.clientX - r.left) / r.width) * 100);
    };
    window.addEventListener("mousemove", fn, { passive: true });
    return () => window.removeEventListener("mousemove", fn);
  }, []);

  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  const scrolled = scrollY > 24;
  const alpha    = Math.min(0.65 + scrollY * 0.0015, 0.95);

  /* ── Dynamic nav background ── */
  // Dark mode: deep navy-blue glass (blurry mirror feel)
  // Light mode: off-white blue frosted glass
  const navBg = isDark
    ? `linear-gradient(120deg,
        rgba(10, 20, 45, ${alpha}) 0%,
        rgba(15, 30, 65, ${alpha * 0.88}) 50%,
        rgba(10, 20, 45, ${alpha}) 100%)`
    : `linear-gradient(120deg,
        rgba(240, 244, 250, ${alpha}) 0%,
        rgba(230, 235, 245, ${alpha * 0.9}) 50%,
        rgba(240, 244, 250, ${alpha}) 100%)`;

  const navBorder = isDark
    ? `1px solid rgba(99, 179, 237, 0.15)`
    : `1px solid rgba(59, 130, 246, 0.18)`;

  const navShadow = scrolled
    ? isDark
      ? `0 1px 0 rgba(200,220,255,0.10) inset, 0 8px 40px rgba(0,0,0,0.60), 0 2px 12px rgba(10,20,40,0.12)`
      : `0 1px 0 rgba(255,255,255,0.80) inset, 0 8px 32px rgba(10,20,40,0.14), 0 2px 8px rgba(0,0,0,0.08)`
    : isDark
      ? `0 4px 24px rgba(0,0,0,0.40)`
      : `0 4px 24px rgba(10,20,40,0.08)`;

  /* ── Text colours ── */
  const textMain   = isDark ? "rgba(240,245,255,0.95)" : "rgba(10,20,45,0.95)";
  const textMuted  = isDark ? "rgba(240,245,255,0.65)" : "rgba(10,20,45,0.65)";
  const pillBorder = isDark ? "rgba(240,245,255,0.15)" : "rgba(10,20,45,0.15)";
  const pillBg     = isDark ? "rgba(240,245,255,0.08)" : "rgba(10,20,45,0.08)";

  return (
    <>
      <nav
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background:        navBg,
          backdropFilter:    `blur(28px) saturate(200%) brightness(${isDark ? 0.92 : 1.06})`,
          WebkitBackdropFilter: `blur(28px) saturate(200%) brightness(${isDark ? 0.92 : 1.06})`,
          boxShadow:         navShadow,
          borderBottom:      navBorder,
        }}
      >
        {/* ── Mouse-tracking top shimmer line ── */}
        <div
          className="pointer-events-none absolute top-0 left-0 right-0 h-[1.5px]"
          style={{
            background: `linear-gradient(90deg,
              transparent ${mouseX - 35}%,
              ${BLUE}CC ${mouseX}%,
              rgba(255,215,80,0.5) ${mouseX + 8}%,
              transparent ${mouseX + 35}%
            )`,
            transition: "background 0.15s ease",
          }}
        />

        {/* ── Bottom accent line ── */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg,
              transparent 0%,
              ${BLUE}80 ${mouseX}%,
              rgba(255,215,80,0.35) ${mouseX + 12}%,
              transparent 100%
            )`,
            opacity: scrolled ? 0.9 : 0.45,
            transition: "all 0.2s ease",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[68px]">

            {/* ── Logo ── */}
            <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
              <div className="relative">
                <div
                  className="absolute -inset-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500"
                  style={{ background: `radial-gradient(circle, ${BLUE}55 0%, transparent 70%)`, filter: "blur(6px)" }}
                />
                <img
                  src="/kundwa.png"
                  alt="Kundwa IB Group"
                  className="relative h-12 md:h-14 w-auto object-contain transition-all duration-300"
                  style={{
                    filter: isDark ? "invert(1) brightness(1.5)" : "none",
                    mixBlendMode: isDark ? "screen" : "multiply",
                  }}
                />
              </div>
              <div className="hidden sm:flex flex-col leading-none">
                <span
                  className="font-heading font-black text-[17px] tracking-wide"
                  style={{ color: textMain }}
                >
                  Kundwa{" "}
                  <span style={{ color: BLUE, filter: `drop-shadow(0 0 8px ${BLUE}88)` }}>IB</span>
                </span>
                <span className="text-[9px] font-semibold tracking-[0.28em] uppercase" style={{ color: textMuted }}>
                  Group
                </span>
              </div>
            </Link>

            {/* ── Desktop links ── */}
            <div className="hidden md:flex items-center gap-0.5">
              {navLinks.map((link) => {
                const active = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="relative px-4 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 group overflow-hidden"
                    style={{ color: active ? textMain : textMuted }}
                  >
                    {/* Pill background */}
                    <span
                      className="absolute inset-0 rounded-xl transition-all duration-300"
                      style={{
                        opacity: active ? 1 : 0,
                        background: active
                          ? isDark
                            ? `linear-gradient(135deg, ${BLUE}44, ${BLUE}22)`
                            : `linear-gradient(135deg, ${BLUE}18, ${BLUE}08)`
                          : "transparent",
                        border: active
                          ? `1px solid ${BLUE}44`
                          : `1px solid transparent`,
                        boxShadow: active ? `inset 0 1px 0 rgba(255,255,255,0.15)` : "none",
                      }}
                    />
                    {/* hover pill */}
                    <span
                      className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200"
                      style={{
                        background: isDark ? "rgba(240,245,255,0.05)" : "rgba(10,20,45,0.05)",
                      }}
                    />

                    <span className="relative">{lang === "en" ? link.label : link.labelRw}</span>

                    {/* Electric blue underline */}
                    <span
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 h-[2px] rounded-full transition-all duration-300"
                      style={{
                        width: active ? "70%" : "0%",
                        opacity: active ? 1 : 0,
                        background: `linear-gradient(90deg, transparent, ${BLUE}, hsl(44,87%,65%), ${BLUE}, transparent)`,
                        boxShadow: active ? `0 0 8px ${BLUE}88` : "none",
                      }}
                    />
                  </Link>
                );
              })}
            </div>

            {/* ── Desktop actions ── */}
            <div className="hidden md:flex items-center gap-2">

              {/* Language pill */}
              <button
                onClick={() => setLang(l => l === "en" ? "rw" : "en")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 hover:scale-105"
                style={{
                  background: pillBg,
                  border: `1px solid ${pillBorder}`,
                  color: textMuted,
                }}
              >
                <Globe className="h-3.5 w-3.5" />
                {lang === "en" ? "RW" : "EN"}
              </button>

              {/* ── Dark / Light toggle ── */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle dark/light mode"
                className="relative p-2 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 overflow-hidden group"
                style={{
                  background: pillBg,
                  border: `1px solid ${pillBorder}`,
                }}
              >
                {/* glow ring on hover */}
                <span
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `radial-gradient(circle at center, ${BLUE}22, transparent 70%)` }}
                />
                {isDark
                  ? <Sun  className="relative h-4 w-4 transition-all duration-300" style={{ color: "hsl(44,90%,68%)" }} />
                  : <Moon className="relative h-4 w-4 transition-all duration-300" style={{ color: BLUE }} />
                }
              </button>

              {/* ── Buy Ticket — liquid electric-blue CTA ── */}
              <Link to="/events">
                <button
                  className="relative overflow-hidden px-5 py-2.5 rounded-full text-sm font-black tracking-wide transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{
                    background: `linear-gradient(135deg, ${BLUE_D}, ${BLUE}, hsl(217,91%,72%))`,
                    backgroundSize: "200% 100%",
                    color: "#fff",
                    boxShadow: `0 4px 20px ${BLUE}66, 0 1px 0 rgba(255,255,255,0.30) inset`,
                    border: `1px solid ${BLUE}88`,
                  }}
                >
                  {/* Shimmer sweep */}
                  <span
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.30) 50%, transparent 60%)",
                      animation: "btnShimmer 2.2s ease-in-out infinite",
                    }}
                  />
                  <span className="relative flex items-center gap-1.5">
                    🎟 {lang === "en" ? "Buy Ticket" : "Gura Itike"}
                  </span>
                </button>
              </Link>

              {/* Login */}
              {!user && (
                <Link to="/login">
                  <button
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
                    style={{
                      background: pillBg,
                      border: `1px solid ${pillBorder}`,
                      color: textMuted,
                    }}
                  >
                    <LogIn className="h-4 w-4" />
                    {lang === "en" ? "Login" : "Injira"}
                  </button>
                </Link>
              )}
            </div>

            {/* ── Mobile controls ── */}
            <div className="md:hidden flex items-center gap-2">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl transition-all duration-200"
                style={{ background: pillBg, border: `1px solid ${pillBorder}` }}
                aria-label="Toggle theme"
              >
                {isDark
                  ? <Sun  className="h-4 w-4" style={{ color: "hsl(44,90%,68%)" }} />
                  : <Moon className="h-4 w-4" style={{ color: BLUE }} />
                }
              </button>
              {/* Lang */}
              <button
                onClick={() => setLang(l => l === "en" ? "rw" : "en")}
                className="px-2.5 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase transition-all"
                style={{ background: pillBg, border: `1px solid ${pillBorder}`, color: textMuted }}
              >
                {lang === "en" ? "RW" : "EN"}
              </button>
              {/* Hamburger */}
              <button
                onClick={() => setIsOpen(o => !o)}
                className="p-2 rounded-xl transition-all duration-200"
                style={{ background: pillBg, border: `1px solid ${pillBorder}`, color: textMain }}
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Drawer ── */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
            isOpen ? "max-h-[640px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div
            className="px-4 pb-6 pt-3 space-y-1"
            style={{
              background: isDark
                ? "linear-gradient(160deg, rgba(15,28,68,0.97) 0%, rgba(17,35,85,0.95) 100%)"
                : "linear-gradient(160deg, rgba(239,246,255,0.98) 0%, rgba(219,234,254,0.97) 100%)",
              backdropFilter: "blur(40px) saturate(200%)",
              WebkitBackdropFilter: "blur(40px) saturate(200%)",
              borderTop: `1px solid ${pillBorder}`,
            }}
          >
            {navLinks.map((link, i) => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    transitionDelay: isOpen ? `${i * 35}ms` : "0ms",
                    ...(active ? {
                      background: isDark ? `${BLUE}22` : `${BLUE}12`,
                      border: `1px solid ${BLUE}44`,
                      color: BLUE,
                    } : {
                      color: textMuted,
                    }),
                  }}
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300"
                >
                  {lang === "en" ? link.label : link.labelRw}
                  {active && (
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: BLUE, boxShadow: `0 0 6px ${BLUE}` }}
                    />
                  )}
                </Link>
              );
            })}

            <div className="pt-3 flex flex-col gap-2">
              <Link to="/events">
                <button
                  className="w-full py-3 rounded-xl text-sm font-black tracking-wide transition-all duration-200 hover:brightness-110 active:scale-95"
                  style={{
                    background: `linear-gradient(135deg, ${BLUE_D}, ${BLUE})`,
                    color: "#fff",
                    boxShadow: `0 4px 20px ${BLUE}55, inset 0 1px 0 rgba(255,255,255,0.25)`,
                  }}
                >
                  🎟 {lang === "en" ? "Buy Ticket" : "Gura Itike"}
                </button>
              </Link>
              {!user && (
                <Link to="/login">
                  <button
                    className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200"
                    style={{
                      background: pillBg,
                      border: `1px solid ${pillBorder}`,
                      color: textMuted,
                    }}
                  >
                    <LogIn className="h-4 w-4" />
                    {lang === "en" ? "Login" : "Injira"}
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <style>{`
        @keyframes btnShimmer {
          0%   { transform: translateX(-120%); }
          100% { transform: translateX(220%); }
        }
      `}</style>
    </>
  );
}
