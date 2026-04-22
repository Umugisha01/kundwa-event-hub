import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, X, LogIn } from "lucide-react";
import { Link } from "react-router-dom";

export function LiveChat() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !open) return;
    loadMessages();
    const channel = supabase
      .channel("user-chat")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, () => loadMessages())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, open]);

  const loadMessages = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at");
    setMessages(data || []);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const send = async () => {
    if (!text.trim() || !user) return;
    await supabase.from("chat_messages").insert({ sender_id: user.id, message: text.trim() });
    setText("");
    loadMessages();
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-secondary text-secondary-foreground shadow-lg flex items-center justify-center hover:brightness-110 transition-all"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 card-premium overflow-hidden animate-scale-in">
          <div className="bg-primary text-primary-foreground p-4">
            <h3 className="font-semibold">Live Chat</h3>
            <p className="text-xs opacity-80">We typically reply within minutes</p>
          </div>

          {!user ? (
            <div className="p-6 text-center">
              <p className="text-muted-foreground text-sm mb-3">Please log in to start chatting</p>
              <Link to="/login">
                <Button className="btn-gold gap-1"><LogIn className="h-4 w-4" /> Login</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="h-64 overflow-y-auto p-3 space-y-2">
                {messages.length === 0 && <p className="text-xs text-muted-foreground text-center mt-8">Send a message to start the conversation</p>}
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.sender_id === user.id ? "justify-end" : "justify-start"}`}>
                    <div className={`px-3 py-2 rounded-xl max-w-[75%] text-sm ${m.sender_id === user.id ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      {m.message}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <div className="p-3 border-t border-border flex gap-2">
                <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message..." onKeyDown={(e) => e.key === "Enter" && send()} />
                <Button size="icon" className="btn-gold shrink-0" onClick={send}><Send className="h-4 w-4" /></Button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}