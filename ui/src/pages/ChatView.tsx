import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Message = { role: "user" | "model"; content: string };

export function ChatView() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);

  async function send() {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: "user", content: input }]);
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: JSON.stringify({ chat_id: chatId, message: input }),
    });
    const data = await res.json();
    setChatId(data.chat_id);
    setMessages((prev) => [...prev, { role: "model", content: data.response }]);
    setInput("");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 16 }}>
      <div style={{ flex: 1, overflowY: "auto", marginBottom: 12 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 10, textAlign: m.role === "user" ? "right" : "left" }}>
            <span style={{ background: m.role === "user" ? "#eef" : "#eee", padding: "6px 10px", borderRadius: 8, display: "inline-block" }}>
              {m.content}
            </span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Type a transaction..." />
        <Button onClick={send}>Send</Button>
      </div>
    </div>
  );
}