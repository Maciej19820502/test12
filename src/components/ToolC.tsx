"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ProjectCard {
  section_1: string | null;
  section_2: string | null;
  section_3: string | null;
  section_4: string | null;
  section_5: string | null;
  section_6: string | null;
  section_7: string | null;
  section_8: string | null;
}

const SECTION_NAMES = [
  "Cel projektu",
  "Zakres projektu",
  "Grupa docelowa",
  "Główne rezultaty",
  "Harmonogram",
  "Budżet i zasoby",
  "Ryzyka",
  "Kryteria sukcesu",
];

function formatCardForAI(card: ProjectCard): string {
  const sections = [
    card.section_1, card.section_2, card.section_3, card.section_4,
    card.section_5, card.section_6, card.section_7, card.section_8,
  ];
  return sections
    .map((s, i) => `${i + 1}. ${SECTION_NAMES[i]}: ${s || "brak"}`)
    .join("\n");
}

export default function ToolC() {
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reviewResult, setReviewResult] = useState<{ status: string; approved: boolean } | null>(null);
  const [projectCard, setProjectCard] = useState<ProjectCard | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (user) loadProjectData();
  }, [user]);

  useEffect(() => {
    if (projectCard && !initialized.current) {
      initialized.current = true;
      const cardText = formatCardForAI(projectCard);
      const contextMessage: Message = {
        role: "user",
        content: `Oto karta mojego projektu do recenzji:\n\n${cardText}\n\nProszę o recenzję z perspektywy CFO.`,
      };
      sendToAI([contextMessage]);
    }
  }, [projectCard]);

  async function loadProjectData() {
    if (!user) return;

    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!project) {
      setLoadingData(false);
      return;
    }

    setProjectId(project.id);

    const { data: card } = await supabase
      .from("project_cards")
      .select("section_1, section_2, section_3, section_4, section_5, section_6, section_7, section_8")
      .eq("project_id", project.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (card) {
      setProjectCard(card);
    }
    setLoadingData(false);
  }

  async function sendToAI(currentMessages: Message[]) {
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: currentMessages, tool: "C" }),
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

        if (reply.includes("RECENZJA_CFO")) {
          await saveCFOReview(reply);
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

    const allMessages: Message[] = projectCard
      ? [
          {
            role: "user",
            content: `Oto karta mojego projektu do recenzji:\n\n${formatCardForAI(projectCard)}\n\nProszę o recenzję z perspektywy CFO.`,
          },
          ...messages,
          userMessage,
        ]
      : [...messages, userMessage];

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    await sendToAI(allMessages);
  }

  async function saveCFOReview(reply: string) {
    if (!user || !projectId) return;
    setSaving(true);

    const reviewSection = reply.split("RECENZJA_CFO")[1] || "";

    const statusMatch = reviewSection.match(/Status:\s*(.+)/);
    const reviewMatch = reviewSection.match(/Recenzja:\s*([\s\S]+?)(?=Wymagania:)/);
    const reqMatch = reviewSection.match(/Wymagania:\s*([\s\S]+?)$/);

    const statusText = statusMatch?.[1]?.trim() || "";
    const approved = statusText.includes("ZATWIERDZONY") && !statusText.includes("ODRZUCONY");
    const reviewText = reviewMatch?.[1]?.trim() || "";
    const requirements = reqMatch?.[1]?.trim() || "";

    const { error } = await supabase.from("cfo_reviews").insert({
      project_id: projectId,
      review_text: reviewText,
      requirements: requirements === "brak" ? null : requirements,
      approved,
    });

    if (error) {
      console.error("CFO review save error:", error);
      setSaving(false);
      return;
    }

    // Update project status
    await supabase
      .from("projects")
      .update({ status: "cfo_reviewed", updated_at: new Date().toISOString() })
      .eq("id", projectId);

    // Mark Tool C as completed
    const { data: existingSession } = await supabase
      .from("tool_sessions")
      .select("id")
      .eq("user_id", user.id)
      .eq("tool_name", "C")
      .single();

    if (existingSession) {
      await supabase
        .from("tool_sessions")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", existingSession.id);
    } else {
      await supabase.from("tool_sessions").insert({
        user_id: user.id,
        tool_name: "C",
        status: "completed",
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      });
    }

    setReviewResult({ status: statusText, approved });
    setSaving(false);
    setSaved(true);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-73px)]">
        <div className="animate-pulse text-slate-500">Ładowanie danych projektu...</div>
      </div>
    );
  }

  if (!projectCard) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-73px)]">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Najpierw opracuj kartę projektu w Narzędziu B.</p>
          <button
            onClick={() => router.push("/tools/b")}
            className="text-blue-600 hover:underline"
          >
            Przejdź do Narzędzia B
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-73px)]">
      {/* CFO badge */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <span className="text-lg">💼</span>
          <div>
            <p className="text-xs text-amber-600 font-medium uppercase tracking-wide">Recenzja CFO</p>
            <p className="text-sm text-amber-800">Dyrektor finansowy analizuje Twoją kartę projektu</p>
          </div>
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
              {msg.content
                .replace("RECENZJA_CFO\n", "")
                .replace("RECENZJA_CFO", "")}
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

      {/* Review result banner */}
      {saved && reviewResult && (
        <div className="px-4 pb-2">
          <div
            className={`rounded-xl p-4 flex items-center justify-between border ${
              reviewResult.approved
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <div>
              <p className={`font-medium ${reviewResult.approved ? "text-green-800" : "text-red-800"}`}>
                {reviewResult.approved ? "Projekt zatwierdzony przez CFO!" : "Projekt wymaga poprawek"}
              </p>
              <p className={`text-sm ${reviewResult.approved ? "text-green-600" : "text-red-600"}`}>
                {reviewResult.status} — Możesz przejść do następnego narzędzia.
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition text-white ${
                reviewResult.approved
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
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
              placeholder="Odpowiedz CFO..."
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
