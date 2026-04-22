import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

export function AdminChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUsers();
    const channel = supabase
      .channel("admin-chat")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, () => {
        if (selectedUser) loadMessages(selectedUser);
        loadUsers();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedUser]);

  const loadUsers = async () => {
    const { data } = await supabase.from("chat_messages").select("sender_id, profiles!chat_messages_sender_id_fkey(full_name, email)").order("created_at", { ascending: false });
    const unique = new Map<string, any>();
    data?.forEach((m: any) => {
      if (m.sender_id !== user?.id && !unique.has(m.sender_id)) {
        unique.set(m.sender_id, { id: m.sender_id, name: m.profiles?.full_name || m.profiles?.email || "User" });
      }
    });
    setUsers(Array.from(unique.values()));
  };

  const loadMessages = async (userId: string) => {
    setSelectedUser(userId);
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order("created_at");
    setMessages(data || []);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const send = async () => {
    if (!text.trim() || !selectedUser) return;
    await supabase.from("chat_messages").insert({ sender_id: user!.id, receiver_id: selectedUser, message: text.trim() });
    setText("");
    loadMessages(selectedUser);
  };

  return (
    <div className="grid md:grid-cols-3 gap-4" style={{ minHeight: 400 }}>
      <div className="card-premium p-4 space-y-1 overflow-y-auto max-h-96">
        <h3 className="font-semibold text-foreground mb-2">Users</h3>
        {users.length === 0 && <p className="text-xs text-muted-foreground">No conversations yet</p>}
        {users.map((u) => (
          <button key={u.id} onClick={() => loadMessages(u.id)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedUser === u.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
            {u.name}
          </button>
        ))}
      </div>
      <div className="md:col-span-2 card-premium p-4 flex flex-col">
        {!selectedUser ? (
          <p className="text-muted-foreground text-sm m-auto">Select a user to view conversation</p>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-2 mb-3 max-h-72">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
                  <div className={`px-3 py-2 rounded-xl max-w-[70%] text-sm ${m.sender_id === user?.id ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    {m.message}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <div className="flex gap-2">
              <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message..." onKeyDown={(e) => e.key === "Enter" && send()} />
              <Button size="icon" className="btn-gold" onClick={send}><Send className="h-4 w-4" /></Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}