import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Layout } from "@/components/Layout";
import { toast } from "@/hooks/use-toast";
import { ShieldCheck, User, Lock, Eye, EyeOff, Sparkles, ArrowRight } from "lucide-react";

const LoginPage = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleFillAdmin = () => {
    setIdentifier("admin");
    setPassword("Admin@Kundwa2026!");
    toast({
      title: "Admin Credentials Filled",
      description: "Default administrator credentials have been pre-filled.",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      toast({ title: "Error", description: "Please enter your username/email and password", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await signIn(identifier, password);
    setLoading(false);
    if (error) {
      toast({ 
        title: "Login failed", 
        description: typeof error === "string" ? error : error?.message || "Invalid credentials. Please verify your password.", 
        variant: "destructive" 
      });
    } else {
      toast({ title: "Welcome back, Admin!", description: "Access granted to Kundwa Admin Dashboard" });
      navigate("/admin");
    }
  };

  return (
    <Layout>
      <section className="section-padding min-h-[85vh] flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md">
          <div className="card-premium p-8 rounded-2xl border border-border/60 shadow-2xl relative overflow-hidden bg-card/95 backdrop-blur-xl">
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />

            <div className="text-center mb-8 relative">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-4 shadow-inner">
                <ShieldCheck className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-2">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Kundwa Event Hub Portal</span>
              </div>
              <h1 className="text-2xl font-black text-foreground font-heading tracking-tight">Admin & Staff Login</h1>
              <p className="text-muted-foreground text-sm mt-1">Sign in with your administrator credentials</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 relative">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Username or Email
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    autoComplete="username"
                    placeholder="admin or admin@kundwaib.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="pl-10 h-11 rounded-xl bg-background/60 border-border/60 focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 rounded-xl bg-background/60 border-border/60 focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 btn-gold rounded-xl font-bold tracking-wide mt-2 shadow-lg shadow-primary/25"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Authenticating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Sign In to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>

            {/* Quick Fill Admin Box */}
            <div className="mt-6 pt-5 border-t border-border/60">
              <div className="rounded-xl p-3 bg-muted/40 border border-border/40 text-xs text-muted-foreground flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="font-semibold text-foreground">Admin Credentials:</p>
                  <p className="font-mono text-[11px]">User: <span className="text-primary font-bold">admin</span></p>
                  <p className="font-mono text-[11px]">Pass: <span className="text-primary font-bold">Admin@Kundwa2026!</span></p>
                </div>
                <button
                  type="button"
                  onClick={handleFillAdmin}
                  className="px-3 py-1.5 rounded-lg bg-primary/15 hover:bg-primary/25 text-primary text-[11px] font-bold transition-all hover:scale-105 active:scale-95 border border-primary/30"
                >
                  Autofill
                </button>
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground mt-5">
              Need access or lost your credentials?{" "}
              <Link to="/contact" className="text-secondary font-semibold hover:underline">
                Contact Technical Support
              </Link>
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default LoginPage;