import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Globe, LogIn, Sun, Moon, ShoppingBag } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useCart } from "@/contexts/CartContext";
import { CartDrawer } from "@/components/CartDrawer";

const publicLinks = [
  { to: "/", label: "Home", labelRw: "Ahabanza" },
  { to: "/services", label: "Services", labelRw: "Serivisi" },
  { to: "/portfolio", label: "Portfolio", labelRw: "Ibikorwa" },
  { to: "/rentals", label: "Rentals", labelRw: "Gukodesha" },
  { to: "/events", label: "Events", labelRw: "Ibirori" },
  { to: "/contact", label: "Contact", labelRw: "Twandikire" },
];

// Sophisticated Dark Blue palette
const BLUE = "hsl(220, 55%, 22%)";   // sophisticated dark off-blue
const BLUE_D = "hsl(220, 60%, 15%)";   // deeper pressed state

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState<"en" | "rw">("en");
  const [scrollY, setScrollY] = useState(0);
  const [mouseX, setMouseX] = useState(50);
  const navRef = useRef<HTMLElement>(null);
  const location = useLocation();
  const { user, role } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { cartCount } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const isDark = theme === "dark";

  const navLinks = [
    ...publicLinks,
    ...(user ? [{ to: "/dashboard", label: "Dashboard", labelRw: "Ikibaho" }] : []),
    ...(role === "admin" ? [{ to: "/admin", label: "Admin", labelRw: "Ubuyobozi" }] : []),
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

  /* ── Dynamic nav background (Floating Glass/Mirror Pill) ── */
  const navBg = isDark
    ? scrolled
      ? "rgba(6, 11, 19, 0.85)"
      : "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(10, 15, 30, 0.55) 100%)"
    : scrolled
      ? "rgba(243, 244, 246, 0.75)"
      : "linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.18) 100%)";

  const navBorder = isDark
    ? `1px solid rgba(255, 255, 255, 0.15)`
    : `1px solid rgba(255, 255, 255, 0.4)`; // Bright frosted edge for glassmorphic pop

  const navShadow = isDark
    ? scrolled
      ? `0 4px 30px rgba(0, 0, 0, 0.6)`
      : `inset 0 1px 0 0 rgba(255, 255, 255, 0.10), 0 4px 20px 0 rgba(0, 0, 0, 0.3)`
    : scrolled
      ? `0 4px 20px rgba(15, 23, 42, 0.08)`
      : `inset 0 1px 0 0 rgba(255, 255, 255, 0.40), 0 4px 16px 0 rgba(15, 23, 42, 0.06)`;

  /* ── Text colours ── */
  const textMain = isDark ? "rgba(240,245,255,0.95)" : "rgba(10,20,45,0.95)";
  const textMuted = isDark ? "rgba(240,245,255,0.65)" : "rgba(10,20,45,0.65)";
  const pillBorder = isDark ? "rgba(240,245,255,0.15)" : "rgba(10,20,45,0.15)";
  const pillBg = isDark ? "rgba(240,245,255,0.08)" : "rgba(10,20,45,0.08)";

  return (
    <>
      <div
        className={`fixed left-1/2 -translate-x-1/2 z-50 flex items-center justify-between pointer-events-auto transition-all duration-500 h-[56px] md:h-[64px] ${scrolled
            ? "top-0 w-full max-w-full rounded-none px-6 md:px-12"
            : "top-2 md:top-4 w-[92%] max-w-[1280px] rounded-full px-6"
          }`}
        style={{
          background: navBg,
          backdropFilter: "blur(40px) saturate(220%)",
          WebkitBackdropFilter: "blur(40px) saturate(220%)",
          boxShadow: navShadow,
          border: scrolled ? "none" : navBorder,
          borderBottom: scrolled ? (isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)") : undefined,
        }}
      >
        {/* ── Logo Container (Left) ── */}
        <Link to="/" className="flex items-center group flex-shrink-0">
          <div className="relative">
            <img
              src="/kundwa.png"
              alt="Kundwa Logo"
              className="relative h-[34px] md:h-[40px] w-auto object-contain transition-all duration-300"
              style={{
                filter: isDark ? "invert(1) brightness(1.5)" : "none",
                mixBlendMode: isDark ? "screen" : "multiply",
              }}
            />
          </div>
        </Link>

        {/* ── Navigation Pill (Right) ── */}
        <nav
          ref={navRef}
          className="flex items-center h-full"
        >
          {/* ── Desktop Links ── */}
          <div className="hidden md:flex items-center gap-0.5 pr-4">
            {navLinks.map((link) => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="relative px-3.5 py-2 rounded-xl text-sm font-bold font-heading tracking-wide transition-all duration-300 group overflow-hidden"
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
                      background: `linear-gradient(90deg, transparent, ${BLUE}, hsl(200,95%,65%), ${BLUE}, transparent)`,
                      boxShadow: active ? `0 0 8px ${BLUE}88` : "none",
                    }}
                  />
                </Link>
              );
            })}
          </div>

          {/* ── Divider & Actions (Far Right) ── */}
          <div className="hidden md:flex items-center gap-4">
            {/* Elegant thin divider */}
            <div className="h-4 w-px bg-current opacity-15" />

            {/* Actions: Theme Toggle & Language */}
            <div className="flex items-center gap-2">
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

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle dark/light mode"
                className="relative p-2 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 overflow-hidden group"
                style={{
                  background: pillBg,
                  border: `1px solid ${pillBorder}`,
                }}
              >
                <span
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `radial-gradient(circle at center, ${BLUE}22, transparent 70%)` }}
                />
                {isDark
                  ? <Sun className="relative h-4 w-4 transition-all duration-300" style={{ color: "hsl(200,90%,68%)" }} />
                  : <Moon className="relative h-4 w-4 transition-all duration-300" style={{ color: BLUE }} />
                }
              </button>

              {/* Shopping Cart Trigger */}
              <button
                onClick={() => setIsCartOpen(true)}
                aria-label="Open Shopping Cart"
                className="relative p-2 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 overflow-hidden group"
                style={{
                  background: pillBg,
                  border: `1px solid ${pillBorder}`,
                  color: textMain,
                }}
              >
                <ShoppingBag className="relative h-4 w-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[8px] font-black text-secondary-foreground animate-pulse">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
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
                ? <Sun className="h-4 w-4" style={{ color: "hsl(200,90%,68%)" }} />
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
            {/* Cart Mobile Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2 rounded-xl transition-all duration-200 relative"
              style={{ background: pillBg, border: `1px solid ${pillBorder}`, color: textMain }}
              aria-label="Open cart"
            >
              <ShoppingBag className="h-4 w-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-secondary text-[8px] font-black text-secondary-foreground">
                  {cartCount}
                </span>
              )}
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
        </nav>

        {/* ── Mobile Drawer (Floating Card) ── */}
        {isOpen && (
          <div
            className="absolute top-16 right-0 left-0 md:hidden rounded-2xl border shadow-xl overflow-hidden transition-all duration-300 z-40 pointer-events-auto"
            style={{
              background: isDark
                ? "linear-gradient(160deg, rgba(15,28,68,0.97) 0%, rgba(17,35,85,0.95) 100%)"
                : "linear-gradient(160deg, rgba(239,246,255,0.98) 0%, rgba(219,234,254,0.97) 100%)",
              backdropFilter: "blur(40px) saturate(200%)",
              WebkitBackdropFilter: "blur(40px) saturate(200%)",
              border: navBorder,
              boxShadow: navShadow,
            }}
          >
            <div className="px-4 py-4 space-y-1">
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
                    className="flex items-center justify-between px-4 py-3 rounded-xl text-base font-bold font-heading transition-all duration-300"
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
            </div>
          </div>
        )}
      </div>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <style>{`
        @keyframes btnShimmer {
          0%   { transform: translateX(-120%); }
          100% { transform: translateX(220%); }
        }
      `}</style>
    </>
  );
}
