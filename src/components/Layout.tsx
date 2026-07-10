import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { LiveChat } from "./LiveChat";

export function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <LiveChat />
    </div>
  );
}
