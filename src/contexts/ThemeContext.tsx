import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Default to light mode unless the user explicitly toggles and saves a preference
    const stored = localStorage.getItem("kundwa-theme-v2") as Theme | null;
    if (stored === "light" || stored === "dark") return stored;
    return "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    const themeColorMeta = document.querySelectorAll('meta[name="theme-color"]');
    if (theme === "dark") {
      root.classList.add("dark");
      root.style.backgroundColor = "hsl(220, 60%, 6%)";
      themeColorMeta.forEach(meta => meta.setAttribute("content", "#060b13"));
    } else {
      root.classList.remove("dark");
      root.style.backgroundColor = "hsl(220, 20%, 96%)";
      themeColorMeta.forEach(meta => meta.setAttribute("content", "#f1f5f9"));
    }
    localStorage.setItem("kundwa-theme-v2", theme);
    localStorage.setItem("kundwa-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
