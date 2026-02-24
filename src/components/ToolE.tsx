"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useConversation } from "@elevenlabs/react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface TranscriptEntry {
  role: "user" | "agent";
  text: string;
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

const DEFENSE_PROMPT = `Jesteś przewodniczącym komisji obrony projektu. Prowadzisz panel obrony, w którym uczestnik musi obronić swój projekt przed komisją ekspertów.

Prowadź rozmowę w języku polskim. Bądź profesjonalny, wymagający ale fair.

Sposób pracy:
1. Na początku przedstaw komisję (3 osoby: Ty jako przewodniczący, ekspert merytoryczny, ekspert ds. wdrożeń) i poproś o krótką prezentację projektu własnymi słowami
2. Następnie zadawaj pytania pogłębiające (po 1 pytaniu na turę), dotyczące:
   - Słabych punktów wskazanych przez CFO i PM
   - Realności wdrożenia i harmonogramu
   - Gotowości do radzenia sobie z ryzykami
   - Mierzalności rezultatów
   - Budżetu i zwrotu z inwestycji
3. Po 3-5 rundach pytań, ogłoś decyzję komisji

Ważne zasady:
- Zadawaj pytania po jednym — nie zasypuj uczestnika
- Nawiązuj do odpowiedzi uczestnika — słuchaj uważnie
- Bądź krytyczny ale konstruktywny
- Nie wydawaj werdyktu bez minimum 3 rund pytań
- Bądź zwięzły — 2-3 zdania na odpowiedź, chyba że ogłaszasz werdykt
- Mów naturalnie, jak na prawdziwej obronie projektu
- Gdy ogłaszasz werdykt, powiedz wyraźnie jedną z trzech decyzji: "projekt jest zatwierdzony", "projekt jest warunkowo zatwierdzony", albo "projekt jest odrzucony", a następnie podaj krótkie uzasadnienie`;

function detectDecision(entries: TranscriptEntry[]): string | null {
  const agentMessages = entries
    .filter((e) => e.role === "agent")
    .map((e) => e.text.toLowerCase());

  // Check last few agent messages for decision keywords
  const recent = agentMessages.slice(-3).join(" ");

  if (recent.includes("warunkowo zatwierdzony")) return "WARUNKOWO_ZATWIERDZONY";
  if (recent.includes("projekt jest zatwierdzony") || recent.includes("projekt zatwierdzony"))
    return "ZATWIERDZONY";
  if (recent.includes("projekt jest odrzucony") || recent.includes("projekt odrzucony"))
    return "ODRZUCONY";
  return null;
}

export default function ToolE() {
  const { user } = useAuth();
  const router = useRouter();

  // Project data
  const [projectCard, setProjectCard] = useState<ProjectCard | null>(null);
  const [cfoReview, setCfoReview] = useState<CFOReview | null>(null);
  const [pmReview, setPmReview] = useState<PMReview | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  // Conversation state
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [decision, setDecision] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");

  const transcriptRef = useRef<TranscriptEntry[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const decisionSavedRef = useRef(false);

  const conversation = useConversation({
    onMessage: useCallback(
      (props: { message: string; role: "user" | "agent" }) => {
        const entry: TranscriptEntry = {
          role: props.role,
          text: props.message,
        };
        transcriptRef.current = [...transcriptRef.current, entry];
        setTranscript([...transcriptRef.current]);
      },
      []
    ),
    onDisconnect: useCallback(() => {
      // Analyze transcript for decision on disconnect
      if (!decisionSavedRef.current && transcriptRef.current.length > 0) {
        const detected = detectDecision(transcriptRef.current);
        if (detected) {
          setDecision(detected);
        }
      }
    }, []),
    onError: useCallback((message: string) => {
      console.error("Conversation error:", message);
      setError(message);
    }, []),
  });

  // Scroll to bottom on new transcript entries
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  // Load project data
  useEffect(() => {
    if (user) loadProjectData();
  }, [user]);

  // Auto-save when decision is detected
  useEffect(() => {
    if (decision && !decisionSavedRef.current && projectId && user) {
      decisionSavedRef.current = true;
      saveDefenseResult(decision);
    }
  }, [decision, projectId, user]);

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

  async function startDefense() {
    if (!projectCard || !cfoReview || !pmReview) return;
    setError(null);

    const cardText = formatCardForAI(projectCard);
    const cfoText = formatCFOForAI(cfoReview);
    const pmText = formatPMForAI(pmReview);

    const fullPrompt = `${DEFENSE_PROMPT}

--- DANE PROJEKTU DO OBRONY ---

KARTA PROJEKTU:
${cardText}

RECENZJA CFO:
${cfoText}

RECENZJA PM:
${pmText}`;

    try {
      const res = await fetch("/api/conversation/signed-url");
      const data = await res.json();

      if (!res.ok || !data.signedUrl) {
        setError(data.error || "Nie udało się uzyskać dostępu do agenta");
        return;
      }

      await conversation.startSession({
        signedUrl: data.signedUrl,
        overrides: {
          agent: {
            prompt: { prompt: fullPrompt },
            firstMessage:
              "Dzień dobry. Jestem przewodniczącym komisji obrony projektu. W składzie komisji zasiadają również ekspert merytoryczny oraz ekspert ds. wdrożeń. Proszę, niech Pan lub Pani przedstawi swój projekt własnymi słowami — czego dotyczy i co jest jego głównym celem?",
            language: "pl",
          },
        },
      });
    } catch (err) {
      console.error("Failed to start defense:", err);
      setError("Nie udało się rozpocząć sesji. Sprawdź konfigurację agenta ElevenLabs.");
    }
  }

  async function endDefense() {
    await conversation.endSession();

    // Check for decision in transcript
    if (!decisionSavedRef.current) {
      const detected = detectDecision(transcriptRef.current);
      if (detected) {
        setDecision(detected);
      }
    }
  }

  function handleSendText() {
    if (!input.trim() || conversation.status !== "connected") return;
    conversation.sendUserMessage(input.trim());
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  }

  async function saveDefenseResult(decisionText: string) {
    if (!user || !projectId) return;
    setSaving(true);

    // Build reasoning from last agent messages
    const lastAgentMessages = transcriptRef.current
      .filter((e) => e.role === "agent")
      .slice(-2)
      .map((e) => e.text)
      .join(" ");

    // Build full transcript
    const fullTranscript = transcriptRef.current
      .map((e) => `[${e.role === "user" ? "Kandydat" : "Komisja"}]: ${e.text}`)
      .join("\n\n");

    const { error: dbError } = await supabase.from("defense_results").insert({
      project_id: projectId,
      decision: decisionText,
      notes_summary: lastAgentMessages,
      transcript: fullTranscript,
    });

    if (dbError) {
      console.error("Defense result save error:", dbError);
      setSaving(false);
      return;
    }

    await supabase
      .from("projects")
      .update({ status: "defended", updated_at: new Date().toISOString() })
      .eq("id", projectId);

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

    setSaving(false);
    setSaved(true);
  }

  // --- RENDERS ---

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-72px-40px)]">
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
      <div className="flex items-center justify-center h-[calc(100vh-72px-40px)]">
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

  // Pre-defense: show start button
  if (conversation.status === "disconnected" && transcript.length === 0 && !saved) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-72px-40px)] gap-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Obrona projektu</h2>
          <p className="text-slate-500 text-sm mb-6">
            Komisja ekspertów przeprowadzi z Tobą rozmowę na temat Twojego projektu.
            Mów naturalnie — agent ElevenLabs prowadzi rozmowę głosową w czasie rzeczywistym.
          </p>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
              {error}
            </div>
          )}
          <button
            onClick={startDefense}
            className="bg-purple-600 text-white px-8 py-3 rounded-xl text-base font-medium hover:bg-purple-700 transition shadow-lg shadow-purple-200"
          >
            Rozpocznij obronę
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-72px-40px)]">
      {/* Status bar */}
      <div className="bg-purple-50 border-b border-purple-200 px-4 py-2.5">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          {/* Speaking indicator */}
          <div className="flex items-center gap-2">
            {conversation.isSpeaking ? (
              <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5 items-end h-4">
                  <span className="w-1 bg-purple-500 rounded-full animate-pulse" style={{ height: "40%", animationDelay: "0ms" }} />
                  <span className="w-1 bg-purple-500 rounded-full animate-pulse" style={{ height: "70%", animationDelay: "150ms" }} />
                  <span className="w-1 bg-purple-500 rounded-full animate-pulse" style={{ height: "100%", animationDelay: "300ms" }} />
                  <span className="w-1 bg-purple-500 rounded-full animate-pulse" style={{ height: "60%", animationDelay: "100ms" }} />
                  <span className="w-1 bg-purple-500 rounded-full animate-pulse" style={{ height: "80%", animationDelay: "200ms" }} />
                </div>
                <span className="text-xs text-purple-700 font-medium">Komisja mówi</span>
              </div>
            ) : conversation.status === "connected" ? (
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-700 font-medium">Słucham...</span>
              </div>
            ) : conversation.status === "connecting" ? (
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" />
                <span className="text-xs text-amber-700 font-medium">Łączenie...</span>
              </div>
            ) : (
              <span className="text-xs text-slate-500">Rozłączono</span>
            )}
          </div>

          <div className="ml-auto flex gap-2">
            {conversation.status === "connected" && (
              <button
                onClick={endDefense}
                className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-full hover:bg-red-200 transition font-medium"
              >
                Zakończ obronę
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Transcript */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {transcript.map((entry, i) => (
          <div
            key={i}
            className={`flex ${entry.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                entry.role === "user"
                  ? "bg-blue-600 text-white rounded-br-md"
                  : "bg-white border border-slate-200 text-slate-800 rounded-bl-md shadow-sm"
              }`}
            >
              {entry.role === "agent" && (
                <div className="flex items-center gap-1.5 mb-1.5 text-xs text-purple-500 font-medium">
                  Komisja
                </div>
              )}
              {entry.text}
            </div>
          </div>
        ))}

        {saving && (
          <div className="flex justify-center">
            <div className="text-sm text-slate-500 animate-pulse">Zapisywanie wyniku obrony...</div>
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
                Proces zakończony.
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

      {/* Text input (optional, for typing during conversation) */}
      {conversation.status === "connected" && !saved && (
        <div className="border-t border-slate-200 bg-white px-4 py-3">
          <div className="max-w-3xl mx-auto flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Opcjonalnie: wpisz odpowiedź tekstem..."
              rows={1}
              className="flex-1 resize-none rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              onClick={handleSendText}
              disabled={!input.trim()}
              className="bg-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Wyślij
            </button>
          </div>
        </div>
      )}

      {/* Post-defense: transcript visible but session ended, no decision saved yet */}
      {conversation.status === "disconnected" && transcript.length > 0 && !saved && !saving && (
        <div className="border-t border-slate-200 bg-white px-4 py-3">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <p className="text-sm text-slate-500">Sesja zakończona.</p>
            <div className="flex gap-2">
              <button
                onClick={startDefense}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                Rozpocznij ponownie
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition"
              >
                Wróć do panelu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
