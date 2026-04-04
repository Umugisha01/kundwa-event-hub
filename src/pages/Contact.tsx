import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, MessageCircle, Phone, Mail, MapPin } from "lucide-react";

const ContactPage = () => {
  const [messages, setMessages] = useState([
    { from: "admin", text: "Hello! Welcome to Kundwa IB Group. How can we help you today?" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { from: "user", text: input }]);
    setInput("");
    setTimeout(() => {
      setMessages((prev) => [...prev, { from: "admin", text: "Thank you for your message! Our team will get back to you shortly." }]);
    }, 1000);
  };

  return (
    <Layout>
      <section className="bg-primary text-primary-foreground section-padding">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-secondary font-semibold text-sm uppercase tracking-wider">Contact</span>
          <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-4">Get In Touch</h1>
          <p className="text-primary-foreground/70 max-w-2xl mx-auto">
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
                <Input placeholder="Full Name" />
                <Input placeholder="Email Address" type="email" />
                <Input placeholder="Phone Number" type="tel" />
                <Textarea placeholder="Describe your event or service needs..." rows={4} />
                <Button className="btn-gold w-full">Submit Request</Button>
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
