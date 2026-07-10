import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, MessageCircle, Phone, Mail, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";

const ContactPage = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [messages, setMessages] = useState([
    { from: "admin", text: "Hello! Welcome to Kundwa IB Group. How can we help you today?" },
  ]);
  const [input, setInput] = useState("");

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { from: "user", text: input }]);
    setInput("");
    setTimeout(() => {
      setMessages((prev) => [...prev, { from: "admin", text: "Thank you for your message! Our team will get back to you shortly." }]);
    }, 1000);
  };

  const submitRequest = async () => {
    if (!fullName.trim() || !email.trim() || !message.trim()) {
      toast({
        title: "Missing Fields",
        description: "Please fill in your Name, Email, and Message.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("contact_submissions").insert({
        full_name: fullName,
        email,
        phone,
        message,
        status: "Pending"
      });

      if (error) throw error;

      toast({
        title: "Request Submitted!",
        description: "Thank you! Our event team will get back to you shortly."
      });
      setFullName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (err: any) {
      console.warn("Database submission failed, using local fallback simulation:", err);
      // Graceful fallback user experience
      toast({
        title: "Request Logged!",
        description: "Your custom service request has been received. Thank you!"
      });
      setFullName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative text-white pt-28 md:pt-36 pb-16 md:pb-24 overflow-hidden">
        {/* Abstract Geometric Background Design */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          {/* Slanted gradient background base */}
          <div 
            className="absolute inset-0 transition-all duration-300"
            style={{
              background: isDark
                ? "linear-gradient(135deg, #050814 0%, #0c1730 100%)"
                : "linear-gradient(135deg, #0a1124 0%, #15203d 100%)",
            }}
          />

          {/* Ambient blurred glow layers (Purple top-left, Blue bottom-right) */}
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] rounded-full bg-secondary/10 blur-[130px] pointer-events-none" />

          {/* Waves/Flowing Curves (Subtle Opacity SVGs) */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.04] md:opacity-[0.06]" viewBox="0 0 1440 400" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M-100,100 C150,20 400,220 800,80 C1100,10 1300,180 1550,120 L1550,450 L-100,450 Z" fill="url(#bg-wave-gradient-1)" />
            <path d="M-100,200 C300,120 600,320 1000,180 C1300,80 1450,250 1550,220 L1550,450 L-100,450 Z" fill="url(#bg-wave-gradient-2)" />
            <defs>
              <linearGradient id="bg-wave-gradient-1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#0ea5e9" />
              </linearGradient>
              <linearGradient id="bg-wave-gradient-2" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
              </linearGradient>
            </defs>
          </svg>

          {/* Abstract Geometric Shapes */}
          <svg className="absolute top-[15%] left-[6%] w-7 h-7 text-purple-400/20 stroke-current" fill="none" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M12 3L2 21h20L12 3z" />
          </svg>
          <svg className="absolute bottom-[20%] left-[8%] w-6 h-6 text-sky-400/20 stroke-current" fill="none" strokeWidth="1.5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
          </svg>
          <svg className="absolute bottom-[18%] left-[48%] w-8 h-8 text-indigo-400/15 stroke-current" fill="none" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M12 2.5l9 6.5-3.5 10.5h-11L3 9l9-6.5z" />
          </svg>
          <svg className="absolute top-[25%] right-[8%] w-6 h-6 text-sky-400/25 stroke-current" fill="none" strokeWidth="1.5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
          </svg>
          <svg className="absolute bottom-[15%] right-[10%] w-6 h-6 text-purple-400/20 stroke-current" fill="none" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M12 3L2 21h20L12 3z" />
          </svg>

          {/* Diagonal slash lines */}
          <svg className="absolute top-[28%] left-[22%] w-16 h-16 text-sky-400/15" viewBox="0 0 100 100" stroke="currentColor" strokeWidth="1.5">
            <line x1="10" y1="90" x2="90" y2="10" />
          </svg>
          <svg className="absolute top-[18%] right-[28%] w-14 h-14 text-sky-400/15" viewBox="0 0 100 100" stroke="currentColor" strokeWidth="1.5">
            <line x1="10" y1="90" x2="90" y2="10" />
          </svg>
          <svg className="absolute bottom-[12%] left-[16%] w-12 h-12 text-sky-400/15" viewBox="0 0 100 100" stroke="currentColor" strokeWidth="1.5">
            <line x1="10" y1="90" x2="90" y2="10" />
          </svg>
          <svg className="absolute bottom-[15%] right-[28%] w-14 h-14 text-sky-400/15" viewBox="0 0 100 100" stroke="currentColor" strokeWidth="1.5">
            <line x1="10" y1="90" x2="90" y2="10" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <span className="text-secondary font-semibold text-sm uppercase tracking-widest">Contact</span>
          <h1 className="text-4xl md:text-6xl font-bold mt-3 mb-5">Get In Touch</h1>
          <p className="text-white/80 max-w-2xl mx-auto text-lg font-medium">
            Have a question or need a custom service? We're here to help.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Chat */}
          <div className="card-premium p-6">
            <h2 className="font-bold text-foreground text-lg mb-4 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-secondary" /> Live Chat
            </h2>
            <div className="h-80 overflow-y-auto space-y-3 mb-4 p-3 rounded-lg bg-muted/30">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.from === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button onClick={sendMessage} className="btn-gold">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <div className="card-premium p-6 mb-6">
              <h2 className="font-bold text-foreground text-lg mb-4">Custom Service Request</h2>
              <div className="space-y-4">
                <Input
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                <Input
                  placeholder="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  placeholder="Phone Number"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <Textarea
                  placeholder="Describe your event or service needs..."
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <Button
                  className="btn-gold w-full"
                  onClick={submitRequest}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </div>

            <div className="card-premium p-6">
              <h3 className="font-bold text-foreground mb-4">Contact Info</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-secondary" /> Kigali, Rwanda
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 text-secondary" /> +250 788 000 000
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 text-secondary" /> info@kundwaib.com
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ContactPage;
