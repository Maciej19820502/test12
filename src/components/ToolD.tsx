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

interface CFOReview {
  review_text: string | null;
  requirements: string | null;
  approved: boolean;
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

const CRITERIA_NAMES = [
  "Jasność celów",
  "Realność harmonogramu",
  "Kompletność zakresu",
  "Zarządzanie ryzykiem",
  "Mierzalność rezultatów",
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

function formatCFOForAI(review: CFOReview): string {
  return `Status: ${review.approved ? "Zatwierdzony" : "Niezatwierdzony"}\nRecenzja: ${review.review_text || "brak"}\nWymagania: ${review.requirements || "brak"}`;
}

export default function ToolD() {
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [scores, setScores] = useState<number[] | null>(null);
  const [avgScore, setAvgScore] = useState<number | null>(null);
  const [projectCard, setProjectCard] = useState<ProjectCard | null>(null);
  const [cfoReview, setCfoReview] = useState<CFOReview | null>(null);
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
    if (projectCard && cfoReview && !initialized.current) {
      initialized.current = true;
      const cardText = formatCardForAI(projectCard);
      const cfoText = formatCFOForAI(cfoReview);
      const contextMessage: Message = {
        role: "user",
        content: `Oto karta mojego projektu:\n\n${cardText}\n\nRecenzja CFO:\n${cfoText}\n\nProszę o recenzję z perspektywy Project Managera.`,
      };
      sendToAI([contextMessage]);
    }
  }, [projectCard, cfoReview]);

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

    const { data: review } = await supabase
      .from("cfo_reviews")
      .select("review_text, requirements, approved")
      .eq("project_id", project.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (card) setProjectCard(card);
    if (review) setCfoReview(review);
    setLoadingData(false);
  }

  async function sendToAI(currentMessages: Message[]) {
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: currentMessages, tool: "D" }),
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

        if (reply.includes("RECENZJA_PM")) {
          await savePMReview(reply);
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

    const allMessages: Message[] =
      projectCard && cfoReview
        ? [
            {
              role: "user",
              content: `Oto karta mojego projektu:\n\n${formatCardForAI(projectCard)}\n\nRecenzja CFO:\n${formatCFOForAI(cfoReview)}\n\nProszę o recenzję z perspektywy Project Managera.`,
            },
            ...messages,
            userMessage,
          ]
        : [...messages, userMessage];

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    await sendToAI(allMessages);
  }

  async function savePMReview(reply: string) {
    if (!user || !projectId) return;
    setSaving(true);

    const reviewSection = reply.split("RECENZJA_PM")[1] || "";

    const parseScore = (key: string): number | null => {
      const match = reviewSection.match(new RegExp(`${key}:\\s*(\\d+)`));
      const val = match ? parseInt(match[1]) : null;
      return val && val >= 1 && val <= 10 ? val : null;
    };

    const e1 = parseScore("E1");
    const e2 = parseScore("E2");
    const e3 = parseScore("E3");
    const e4 = parseScore("E4");
    const e5 = parseScore("E5");

    const scoreValues = [e1, e2, e3, e4, e5].filter((s): s is number => s !== null);
    const avg = scoreValues.length > 0
      ? Math.round((scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length) * 10) / 10
      : null;

    const recMatch = reviewSection.match(/Rekomendacje:\s*([\s\S]+?)(?=Harmonogram:)/);
    const timeMatch = reviewSection.match(/Harmonogram:\s*([\s\S]+?)$/);

    const recommendations = recMatch?.[1]?.trim() || null;
    const improved_timeline = timeMatch?.[1]?.trim() || null;

    const { error } = await supabase.from("pm_reviews").insert({
      project_id: projectId,
      e1_score: e1,
      e2_score: e2,
      e3_score: e3,
      e4_score: e4,
      e5_score: e5,
      average_score: avg,
      recommendations,
      improved_timeline,
    });

    if (error) {
      console.error("PM review save error:", error);
      setSaving(false);
      return;
    }

    // Update project status
    await supabase
      .from("projects")
      .update({ status: "pm_reviewed", updated_at: new Date().toISOString() })
      .eq("id", projectId);

    // Mark Tool D as completed
    const { data: existingSession } = await supabase
      .from("tool_sessions")
      .select("id")
      .eq("user_id", user.id)
      .eq("tool_name", "D")
      .single();

    if (existingSession) {
      await supabase
        .from("tool_sessions")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", existingSession.id);
    } else {
      await supabase.from("tool_sessions").insert({
        user_id: user.id,
        tool_name: "D",
        status: "completed",
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      });
    }

    setScores([e1 || 0, e2 || 0, e3 || 0, e4 || 0, e5 || 0]);
    setAvgScore(avg);
    setSaving(false);
    setSaved(true);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function getScoreColor(score: number): string {
    if (score >= 8) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 5) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-red-600 bg-red-50 border-red-200";
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-73px)]">
        <div className="animate-pulse text-slate-500">Ładowanie danych projektu...</div>
      </div>
    );
  }

  if (!projectCard || !cfoReview) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-73px)]">
        <div className="text-center">
          <p className="text-slate-500 mb-4">
            {!projectCard
              ? "Najpierw opracuj kartę projektu w Narzędziu B."
              : "Najpierw uzyskaj recenzję CFO w Narzędziu C."}
          </p>
          <button
            onClick={() => router.push(!projectCard ? "/tools/b" : "/tools/c")}
            className="text-blue-600 hover:underline"
          >
            Przejdź do {!projectCard ? "Narzędzia B" : "Narzędzia C"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-73px)]">
      {/* PM badge */}
      <div className="bg-indigo-50 border-b border-indigo-200 px-4 py-2.5">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <span className="text-lg">📊</span>
          <div>
            <p className="text-xs text-indigo-600 font-medium uppercase tracking-wide">Recenzja PM</p>
            <p className="text-sm text-indigo-800">Project Manager ocenia kartę projektu w 5 kryteriach</p>
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
                .replace("RECENZJA_PM\n", "")
                .replace("RECENZJA_PM", "")}
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

      {/* Score card */}
      {saved && scores && avgScore !== null && (
        <div className="px-4 pb-2">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-slate-900">Ocena Project Managera</p>
              <span className={`text-lg font-bold px-3 py-1 rounded-lg border ${getScoreColor(avgScore)}`}>
                {avgScore}/10
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2 mb-4">
              {scores.map((score, i) => (
                <div key={i} className="text-center">
                  <div className={`text-xl font-bold rounded-lg py-1 border ${getScoreColor(score)}`}>
                    {score}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{CRITERIA_NAMES[i]}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => router.push("/dashboard")}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
              >
                Wróć do panelu
              </button>
            </div>
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
              placeholder="Odpowiedz PM..."
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
