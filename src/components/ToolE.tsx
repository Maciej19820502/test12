"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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

interface PMReview {
  e1_score: number | null;
  e2_score: number | null;
  e3_score: number | null;
  e4_score: number | null;
  e5_score: number | null;
  average_score: number | null;
  recommendations: string | null;
  improved_timeline: string | null;
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

function formatCFOForAI(review: CFOReview): string {
  return `Status: ${review.approved ? "Zatwierdzony" : "Niezatwierdzony"}\nRecenzja: ${review.review_text || "brak"}\nWymagania: ${review.requirements || "brak"}`;
}

function formatPMForAI(review: PMReview): string {
  return `Oceny: E1=${review.e1_score}/10, E2=${review.e2_score}/10, E3=${review.e3_score}/10, E4=${review.e4_score}/10, E5=${review.e5_score}/10 (średnia: ${review.average_score}/10)\nRekomendacje: ${review.recommendations || "brak"}\nUlepszony harmonogram: ${review.improved_timeline || "brak"}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SpeechRecognitionType = any;

// Check for SpeechRecognition support
function getSpeechRecognition(): SpeechRecognitionType | null {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export default function ToolE() {
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [decision, setDecision] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [projectCard, setProjectCard] = useState<ProjectCard | null>(null);
  const [cfoReview, setCfoReview] = useState<CFOReview | null>(null);
  const [pmReview, setPmReview] = useState<PMReview | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setSpeechSupported(getSpeechRecognition() !== null);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (user) loadProjectData();
  }, [user]);

  useEffect(() => {
    if (projectCard && cfoReview && pmReview && !initialized.current) {
      initialized.current = true;
      const cardText = formatCardForAI(projectCard);
      const cfoText = formatCFOForAI(cfoReview);
      const pmText = formatPMForAI(pmReview);
      const contextMessage: Message = {
        role: "user",
        content: `Oto karta mojego projektu:\n\n${cardText}\n\nRecenzja CFO:\n${cfoText}\n\nRecenzja PM:\n${pmText}\n\nJestem gotowy do obrony projektu.`,
      };
      sendToAI([contextMessage]);
    }
  }, [projectCard, cfoReview, pmReview]);

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

    const [cardRes, cfoRes, pmRes] = await Promise.all([
      supabase
        .from("project_cards")
        .select("section_1, section_2, section_3, section_4, section_5, section_6, section_7, section_8")
        .eq("project_id", project.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from("cfo_reviews")
        .select("review_text, requirements, approved")
        .eq("project_id", project.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from("pm_reviews")
        .select("e1_score, e2_score, e3_score, e4_score, e5_score, average_score, recommendations, improved_timeline")
        .eq("project_id", project.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single(),
    ]);

    if (cardRes.data) setProjectCard(cardRes.data);
    if (cfoRes.data) setCfoReview(cfoRes.data);
    if (pmRes.data) setPmReview(pmRes.data);
    setLoadingData(false);
  }

  const speakText = useCallback((text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const cleaned = text
      .replace("DECYZJA_KOMISJI\n", "")
      .replace("DECYZJA_KOMISJI", "");

    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.lang = "pl-PL";
    utterance.rate = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, []);

  async function sendToAI(currentMessages: Message[]) {
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: currentMessages, tool: "E" }),
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
        speakText(reply);

        if (reply.includes("DECYZJA_KOMISJI")) {
          await saveDefenseResult(reply, currentMessages);
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
      projectCard && cfoReview && pmReview
        ? [
            {
              role: "user",
              content: `Oto karta mojego projektu:\n\n${formatCardForAI(projectCard)}\n\nRecenzja CFO:\n${formatCFOForAI(cfoReview)}\n\nRecenzja PM:\n${formatPMForAI(pmReview)}\n\nJestem gotowy do obrony projektu.`,
            },
            ...messages,
            userMessage,
          ]
        : [...messages, userMessage];

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    await sendToAI(allMessages);
  }

  function toggleListening() {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognitionClass = getSpeechRecognition();
    if (!SpeechRecognitionClass) return;

    const recognition = new SpeechRecognitionClass();
    recognition.lang = "pl-PL";
    recognition.continuous = false;
    recognition.interimResults = false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) {
        setInput((prev) => (prev ? prev + " " + transcript : transcript));
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }

  function stopSpeaking() {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }

  async function saveDefenseResult(reply: string, allMessages: Message[]) {
    if (!user || !projectId) return;
    setSaving(true);

    const decisionSection = reply.split("DECYZJA_KOMISJI")[1] || "";

    const decisionMatch = decisionSection.match(/Decyzja:\s*(.+)/);
    const notesMatch = decisionSection.match(/Uzasadnienie:\s*([\s\S]+?)$/);

    const decisionText = decisionMatch?.[1]?.trim() || "BRAK";
    const notesSummary = notesMatch?.[1]?.trim() || "";

    // Build transcript from messages
    const transcript = allMessages
      .map((m) => `[${m.role === "user" ? "Kandydat" : "Komisja"}]: ${m.content}`)
      .join("\n\n");

    const { error } = await supabase.from("defense_results").insert({
      project_id: projectId,
      decision: decisionText,
      notes_summary: notesSummary,
      transcript,
    });

    if (error) {
      console.error("Defense result save error:", error);
      setSaving(false);
      return;
    }

    // Update project status
    await supabase
      .from("projects")
      .update({ status: "defended", updated_at: new Date().toISOString() })
      .eq("id", projectId);

    // Mark Tool E as completed
    const { data: existingSession } = await supabase
      .from("tool_sessions")
      .select("id")
      .eq("user_id", user.id)
      .eq("tool_name", "E")
      .single();

    if (existingSession) {
      await supabase
        .from("tool_sessions")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", existingSession.id);
    } else {
      await supabase.from("tool_sessions").insert({
        user_id: user.id,
        tool_name: "E",
        status: "completed",
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      });
    }

    setDecision(decisionText);
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

  if (!projectCard || !cfoReview || !pmReview) {
    const missing = !projectCard ? "B" : !cfoReview ? "C" : "D";
    const missingName = !projectCard
      ? "kartę projektu w Narzędziu B"
      : !cfoReview
        ? "recenzję CFO w Narzędziu C"
        : "recenzję PM w Narzędziu D";
    return (
      <div className="flex items-center justify-center h-[calc(100vh-73px)]">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Najpierw uzyskaj {missingName}.</p>
          <button
            onClick={() => router.push(`/tools/${missing.toLowerCase()}`)}
            className="text-blue-600 hover:underline"
          >
            Przejdź do Narzędzia {missing}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-73px)]">
      {/* Voice defense badge */}
      <div className="bg-purple-50 border-b border-purple-200 px-4 py-2.5">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <span className="text-lg">🎙️</span>
          <div>
            <p className="text-xs text-purple-600 font-medium uppercase tracking-wide">Obrona projektu</p>
            <p className="text-sm text-purple-800">
              Komisja zadaje pytania — odpowiadaj głosowo lub tekstowo
            </p>
          </div>
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="ml-auto text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-200 transition"
            >
              Zatrzymaj odtwarzanie
            </button>
          )}
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
              {msg.role === "assistant" && (
                <div className="flex items-center gap-1.5 mb-1.5 text-xs text-purple-500 font-medium">
                  <span>🎙️</span> Komisja
                </div>
              )}
              {msg.content
                .replace("DECYZJA_KOMISJI\n", "")
                .replace("DECYZJA_KOMISJI", "")}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Decision banner */}
      {saved && decision && (
        <div className="px-4 pb-2">
          <div
            className={`rounded-xl p-4 flex items-center justify-between border ${
              decision.includes("ZATWIERDZONY") && !decision.includes("ODRZUCONY")
                ? "bg-green-50 border-green-200"
                : decision.includes("WARUNKOWO")
                  ? "bg-amber-50 border-amber-200"
                  : "bg-red-50 border-red-200"
            }`}
          >
            <div>
              <p
                className={`font-medium ${
                  decision.includes("ZATWIERDZONY") && !decision.includes("ODRZUCONY")
                    ? "text-green-800"
                    : decision.includes("WARUNKOWO")
                      ? "text-amber-800"
                      : "text-red-800"
                }`}
              >
                {decision.includes("ZATWIERDZONY") && !decision.includes("ODRZUCONY")
                  ? "Projekt obroniony!"
                  : decision.includes("WARUNKOWO")
                    ? "Projekt warunkowo zatwierdzony"
                    : "Projekt wymaga poprawek"}
              </p>
              <p
                className={`text-sm ${
                  decision.includes("ZATWIERDZONY") && !decision.includes("ODRZUCONY")
                    ? "text-green-600"
                    : decision.includes("WARUNKOWO")
                      ? "text-amber-600"
                      : "text-red-600"
                }`}
              >
                {decision} — Proces zakończony.
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition text-white ${
                decision.includes("ZATWIERDZONY") && !decision.includes("ODRZUCONY")
                  ? "bg-green-600 hover:bg-green-700"
                  : decision.includes("WARUNKOWO")
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-red-600 hover:bg-red-700"
              }`}
            >
              Wróć do panelu
            </button>
          </div>
        </div>
      )}

      {/* Input area with mic */}
      {!saved && (
        <div className="border-t border-slate-200 bg-white px-4 py-3">
          <div className="max-w-3xl mx-auto flex gap-2">
            {speechSupported && (
              <button
                onClick={toggleListening}
                disabled={loading || saving}
                className={`px-3 py-2.5 rounded-xl text-sm font-medium transition border ${
                  isListening
                    ? "bg-red-50 border-red-300 text-red-600 animate-pulse"
                    : "bg-purple-50 border-purple-300 text-purple-600 hover:bg-purple-100"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={isListening ? "Zatrzymaj nagrywanie" : "Mów"}
              >
                {isListening ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
              </button>
            )}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "Słucham..." : "Odpowiedz komisji..."}
              rows={1}
              disabled={loading || saving}
              className="flex-1 resize-none rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:bg-slate-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading || saving}
              className="bg-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "..." : "Wyślij"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
