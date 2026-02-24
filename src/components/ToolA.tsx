"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ToolA() {
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send initial greeting on mount
  useEffect(() => {
    sendToAI([]);
  }, []);

  async function sendToAI(currentMessages: Message[]) {
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: currentMessages }),
      });

      const data = await res.json();

      if (data.error) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Błąd: ${data.error}` },
        ]);
      } else {
        const reply = data.reply;
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);

        // Check if topic was approved
        if (reply.includes("TEMAT_ZATWIERDZONY")) {
          await saveProject(reply);
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Błąd połączenia. Spróbuj ponownie." },
      ]);
    }
    setLoading(false);
  }

  async function handleSend() {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    await sendToAI(newMessages);
  }

  async function saveProject(reply: string) {
    if (!user) return;
    setSaving(true);

    // Parse title and description from AI response
    const titleMatch = reply.match(/Tytuł:\s*(.+)/);
    const descMatch = reply.match(/Opis:\s*([\s\S]+?)$/);

    const title = titleMatch?.[1]?.trim() || "Bez tytułu";
    const description = descMatch?.[1]?.trim() || "";

    // Create project
    const { error: projectError } = await supabase.from("projects").insert({
      user_id: user.id,
      topic_title: title,
      topic_description: description,
      status: "topic_defined",
    });

    if (projectError) {
      console.error("Project save error:", projectError);
      setSaving(false);
      return;
    }

    // Mark Tool A as completed
    await supabase
      .from("tool_sessions")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("tool_name", "A");

    setSaving(false);
    setSaved(true);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-73px)]">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-md"
                  : "bg-white border border-slate-200 text-slate-800 rounded-bl-md shadow-sm"
              }`}
            >
              {msg.content.replace("TEMAT_ZATWIERDZONY\n", "").replace("TEMAT_ZATWIERDZONY", "")}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Success banner */}
      {saved && (
        <div className="px-4 pb-2">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-green-800 font-medium">Temat zapisany!</p>
              <p className="text-green-600 text-sm">Możesz przejść do następnego narzędzia.</p>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
            >
              Wróć do panelu
            </button>
          </div>
        </div>
      )}

      {/* Input area */}
      {!saved && (
        <div className="border-t border-slate-200 bg-white px-4 py-3">
          <div className="max-w-3xl mx-auto flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Napisz wiadomość..."
              rows={1}
              disabled={loading || saving}
              className="flex-1 resize-none rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-slate-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading || saving}
              className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "..." : "Wyślij"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
