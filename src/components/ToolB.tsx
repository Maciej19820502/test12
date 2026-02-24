"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ToolB() {
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [projectTopic, setProjectTopic] = useState<{ title: string; description: string } | null>(null);
  const [loadingProject, setLoadingProject] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load project topic from Tool A
  useEffect(() => {
    if (user) {
      loadProject();
    }
  }, [user]);

  // Start chat once project is loaded
  useEffect(() => {
    if (projectTopic && !initialized.current) {
      initialized.current = true;
      const contextMessage: Message = {
        role: "user",
        content: `Mój temat projektu:\nTytuł: ${projectTopic.title}\nOpis: ${projectTopic.description}\n\nPomóż mi opracować kartę projektu.`,
      };
      sendToAI([contextMessage]);
    }
  }, [projectTopic]);

  async function loadProject() {
    if (!user) return;

    const { data } = await supabase
      .from("projects")
      .select("topic_title, topic_description")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (data) {
      setProjectTopic({
        title: data.topic_title || "Bez tytułu",
        description: data.topic_description || "",
      });
    }
    setLoadingProject(false);
  }

  async function sendToAI(currentMessages: Message[]) {
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: currentMessages, tool: "B" }),
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

        if (reply.includes("KARTA_ZATWIERDZONA")) {
          await saveProjectCard(reply);
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

    // Build full message history including initial context
    const allMessages: Message[] = projectTopic
      ? [
          {
            role: "user",
            content: `Mój temat projektu:\nTytuł: ${projectTopic.title}\nOpis: ${projectTopic.description}\n\nPomóż mi opracować kartę projektu.`,
          },
          ...messages,
          userMessage,
        ]
      : [...messages, userMessage];

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    await sendToAI(allMessages);
  }

  async function saveProjectCard(reply: string) {
    if (!user) return;
    setSaving(true);

    // Parse sections from AI response
    const sectionsText = reply.split("KARTA_ZATWIERDZONA")[1] || "";
    const sections = sectionsText.split("---").map((s) => s.trim());

    const parseSection = (index: number) => {
      const section = sections[index] || "";
      return section.replace(/^Sekcja \d+:\s*/i, "").trim() || null;
    };

    // Get project ID
    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!project) {
      console.error("No project found");
      setSaving(false);
      return;
    }

    // Save project card
    const { error: cardError } = await supabase.from("project_cards").insert({
      project_id: project.id,
      section_1: parseSection(0),
      section_2: parseSection(1),
      section_3: parseSection(2),
      section_4: parseSection(3),
      section_5: parseSection(4),
      section_6: parseSection(5),
      section_7: parseSection(6),
      section_8: parseSection(7),
      version: 1,
      source_tool: "B",
    });

    if (cardError) {
      console.error("Card save error:", cardError);
      setSaving(false);
      return;
    }

    // Update project status
    await supabase
      .from("projects")
      .update({ status: "card_created", updated_at: new Date().toISOString() })
      .eq("id", project.id);

    // Mark Tool B as completed
    const { data: existingSession } = await supabase
      .from("tool_sessions")
      .select("id")
      .eq("user_id", user.id)
      .eq("tool_name", "B")
      .single();

    if (existingSession) {
      await supabase
        .from("tool_sessions")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", existingSession.id);
    } else {
      await supabase.from("tool_sessions").insert({
        user_id: user.id,
        tool_name: "B",
        status: "completed",
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      });
    }

    setSaving(false);
    setSaved(true);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (loadingProject) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-73px)]">
        <div className="animate-pulse text-slate-500">Ładowanie projektu...</div>
      </div>
    );
  }

  if (!projectTopic) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-73px)]">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Najpierw zdefiniuj temat projektu w Narzędziu A.</p>
          <button
            onClick={() => router.push("/tools/a")}
            className="text-blue-600 hover:underline"
          >
            Przejdź do Narzędzia A
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-73px)]">
      {/* Project topic banner */}
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-2.5">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs text-blue-500 font-medium uppercase tracking-wide">Temat projektu</p>
          <p className="text-sm text-blue-800 font-medium">{projectTopic.title}</p>
        </div>
      </div>

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
              {msg.content.replace("KARTA_ZATWIERDZONA\n", "").replace("KARTA_ZATWIERDZONA", "")}
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
              <p className="text-green-800 font-medium">Karta projektu zapisana!</p>
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
