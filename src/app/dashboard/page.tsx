"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { TOOLS, getToolStatuses, ToolStatus } from "@/lib/tools";
import ToolCard from "@/components/ToolCard";

interface ToolResult {
  A?: { title: string; description: string } | null;
  B?: { sections: Record<string, string> } | null;
  C?: { approved: boolean; review: string; requirements: string } | null;
  D?: { e1: number; e2: number; e3: number; e4: number; e5: number; average: number; recommendations: string } | null;
  E?: { decision: string; summary: string } | null;
}

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [toolStatuses, setToolStatuses] = useState<Record<string, ToolStatus>>({});
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [toolResults, setToolResults] = useState<ToolResult>({});
  const [expandedResult, setExpandedResult] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchToolSessions();
    }
  }, [user]);

  async function fetchToolSessions() {
    if (!user) return;

    const { data: sessions } = await supabase
      .from("tool_sessions")
      .select("tool_name, status")
      .eq("user_id", user.id);

    if (sessions) {
      const statuses = getToolStatuses(sessions);
      setToolStatuses(statuses);
      await fetchToolResults(statuses);
    }
    setLoadingSessions(false);
  }

  async function fetchToolResults(statuses: Record<string, ToolStatus>) {
    if (!user) return;
    const results: ToolResult = {};

    // Get project
    const { data: project } = await supabase
      .from("projects")
      .select("id, topic_title, topic_description")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!project) return;

    // Tool A result
    if (statuses["A"] === "completed") {
      results.A = { title: project.topic_title || "", description: project.topic_description || "" };
    }

    // Tool B result
    if (statuses["B"] === "completed") {
      const { data: card } = await supabase
        .from("project_cards")
        .select("section_1, section_2, section_3, section_4, section_5, section_6, section_7, section_8")
        .eq("project_id", project.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (card) {
        results.B = {
          sections: {
            "Cel projektu": card.section_1 || "",
            "Zakres projektu": card.section_2 || "",
            "Grupa docelowa": card.section_3 || "",
            "Główne rezultaty": card.section_4 || "",
            "Harmonogram": card.section_5 || "",
            "Budżet i zasoby": card.section_6 || "",
            "Ryzyka": card.section_7 || "",
            "Kryteria sukcesu": card.section_8 || "",
          },
        };
      }
    }

    // Tool C result
    if (statuses["C"] === "completed") {
      const { data: cfo } = await supabase
        .from("cfo_reviews")
        .select("approved, review_text, requirements")
        .eq("project_id", project.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (cfo) {
        results.C = { approved: cfo.approved, review: cfo.review_text || "", requirements: cfo.requirements || "" };
      }
    }

    // Tool D result
    if (statuses["D"] === "completed") {
      const { data: pm } = await supabase
        .from("pm_reviews")
        .select("e1_score, e2_score, e3_score, e4_score, e5_score, average_score, recommendations")
        .eq("project_id", project.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (pm) {
        results.D = {
          e1: pm.e1_score, e2: pm.e2_score, e3: pm.e3_score,
          e4: pm.e4_score, e5: pm.e5_score, average: pm.average_score,
          recommendations: pm.recommendations || "",
        };
      }
    }

    // Tool E result
    if (statuses["E"] === "completed") {
      const { data: defense } = await supabase
        .from("defense_results")
        .select("decision, notes_summary")
        .eq("project_id", project.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (defense) {
        results.E = { decision: defense.decision || "", summary: defense.notes_summary || "" };
      }
    }

    setToolResults(results);
  }

  function handleLogout() {
    logout();
    router.push("/");
  }

  function toggleResult(toolId: string) {
    setExpandedResult(expandedResult === toolId ? null : toolId);
  }

  function renderResultContent(toolId: string) {
    const key = toolId as keyof ToolResult;
    const result = toolResults[key];
    if (!result) return <p className="text-muted text-sm">Brak danych.</p>;

    switch (toolId) {
      case "A": {
        const r = result as NonNullable<ToolResult["A"]>;
        return (
          <div className="space-y-2">
            <p className="font-semibold text-ink text-sm">Temat projektu:</p>
            <p className="text-ink text-sm">{r.title}</p>
            {r.description && (
              <>
                <p className="font-semibold text-ink text-sm mt-3">Opis:</p>
                <p className="text-muted text-sm whitespace-pre-line">{r.description}</p>
              </>
            )}
          </div>
        );
      }
      case "B": {
        const r = result as NonNullable<ToolResult["B"]>;
        return (
          <div className="space-y-3">
            {Object.entries(r.sections).map(([label, value]) => (
              value && (
                <div key={label}>
                  <p className="font-semibold text-ink text-sm">{label}:</p>
                  <p className="text-muted text-sm whitespace-pre-line">{value}</p>
                </div>
              )
            ))}
          </div>
        );
      }
      case "C": {
        const r = result as NonNullable<ToolResult["C"]>;
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-ink text-sm">Status:</span>
              <span
                className="text-xs font-medium px-3 py-1"
                style={{
                  borderRadius: "100px",
                  background: r.approved ? "var(--accent-light)" : "var(--locked-bg)",
                  color: r.approved ? "var(--accent)" : "var(--locked-text)",
                }}
              >
                {r.approved ? "Zatwierdzony" : "Odrzucony"}
              </span>
            </div>
            {r.review && (
              <div>
                <p className="font-semibold text-ink text-sm">Recenzja:</p>
                <p className="text-muted text-sm whitespace-pre-line">{r.review}</p>
              </div>
            )}
            {r.requirements && (
              <div>
                <p className="font-semibold text-ink text-sm">Wymagania:</p>
                <p className="text-muted text-sm whitespace-pre-line">{r.requirements}</p>
              </div>
            )}
          </div>
        );
      }
      case "D": {
        const r = result as NonNullable<ToolResult["D"]>;
        const criteria = [
          { key: "E1", label: "Jasność celów", score: r.e1 },
          { key: "E2", label: "Realność harmonogramu", score: r.e2 },
          { key: "E3", label: "Kompletność zakresu", score: r.e3 },
          { key: "E4", label: "Zarządzanie ryzykiem", score: r.e4 },
          { key: "E5", label: "Mierzalność rezultatów", score: r.e5 },
        ];
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-semibold text-ink text-sm">Średnia ocena:</span>
              <span
                className="text-lg font-bold"
                style={{
                  color: r.average >= 4 ? "#16a34a" : r.average >= 3 ? "#ca8a04" : "var(--accent)",
                }}
              >
                {Number(r.average).toFixed(1)} / 10
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {criteria.map((c) => (
                <div
                  key={c.key}
                  className="text-center rounded-[10px] py-2 px-1"
                  style={{ background: "var(--locked-bg)" }}
                >
                  <p className="text-[10px] uppercase font-semibold text-muted tracking-wide">{c.key}</p>
                  <p
                    className="text-base font-bold"
                    style={{
                      color: c.score != null && c.score >= 4 ? "#16a34a" : c.score != null && c.score >= 3 ? "#ca8a04" : "var(--accent)",
                    }}
                  >
                    {c.score != null ? Number(c.score).toFixed(1) : "—"}
                  </p>
                  <p className="text-[10px] text-muted leading-tight">{c.label}</p>
                </div>
              ))}
            </div>
            {r.recommendations && (
              <div>
                <p className="font-semibold text-ink text-sm">Rekomendacje:</p>
                <p className="text-muted text-sm whitespace-pre-line">{r.recommendations}</p>
              </div>
            )}
          </div>
        );
      }
      case "E": {
        const r = result as NonNullable<ToolResult["E"]>;
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-ink text-sm">Decyzja:</span>
              <span
                className="text-xs font-medium px-3 py-1"
                style={{
                  borderRadius: "100px",
                  background: "var(--purple-light)",
                  color: "var(--purple)",
                }}
              >
                {r.decision}
              </span>
            </div>
            {r.summary && (
              <div>
                <p className="font-semibold text-ink text-sm">Uzasadnienie:</p>
                <p className="text-muted text-sm whitespace-pre-line">{r.summary}</p>
              </div>
            )}
          </div>
        );
      }
      default:
        return null;
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-pulse text-lg text-muted">Ładowanie...</div>
      </div>
    );
  }

  const completedCount = Object.values(toolStatuses).filter((s) => s === "completed").length;
  const fadeDelays = ["fade-delay-1", "fade-delay-2", "fade-delay-3", "fade-delay-4", "fade-delay-5"];

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header
        className="sticky top-0 z-40"
        style={{
          background: "var(--ink)",
          height: "72px",
        }}
      >
        <div className="max-w-5xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <a
              href="https://dfe.academy/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hidden min-[480px]:flex no-underline"
            >
              <span className="text-white/90 text-sm font-medium tracking-wide" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                DFE.academy
              </span>
              <span
                className="w-2 h-2 rounded-full animate-pulse-dot"
                style={{ background: "var(--accent)" }}
              />
            </a>

            {/* Separator */}
            <div className="hidden min-[480px]:block w-px h-8 bg-white/20" />

            {/* Title */}
            <div>
              <h1 className="text-white text-lg">Projekt AI w edukacji</h1>
              <p className="text-white/50 text-xs" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Witaj, {user.name}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="text-sm text-white/70 hover:text-white transition-colors duration-250 px-4 py-1.5 rounded-[14px] border border-white/20 hover:border-white/40"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Wyloguj się
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-8 pb-24">
        {/* Progress card */}
        <div
          className="rounded-[14px] overflow-hidden mb-8 animate-fade-up"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
          }}
        >
          {/* Top accent line proportional to progress */}
          <div className="h-[3px] w-full" style={{ background: "var(--locked-bg)" }}>
            <div
              className="h-full transition-all duration-700 ease-out"
              style={{
                width: `${(completedCount / TOOLS.length) * 100}%`,
                background: "var(--accent)",
              }}
            />
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg text-ink">Twój postęp</h2>
              <span className="text-sm text-muted" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {completedCount} z {TOOLS.length} ukończonych
              </span>
            </div>
            <div
              className="w-full rounded-full"
              style={{ height: "6px", background: "var(--locked-bg)" }}
            >
              <div
                className="rounded-full transition-all duration-700 ease-out"
                style={{
                  height: "6px",
                  width: `${(completedCount / TOOLS.length) * 100}%`,
                  background: "var(--accent)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-0">
          {loadingSessions ? (
            <div className="text-center py-12 text-muted" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Ładowanie kroków...
            </div>
          ) : (
            TOOLS.map((tool, index) => {
              const status = toolStatuses[tool.id] || "locked";
              const isExpanded = expandedResult === tool.id;
              return (
                <div
                  key={tool.id}
                  className={`flex items-start gap-5 animate-fade-up ${fadeDelays[index] || ""}`}
                >
                  {/* Timeline node + connector */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300"
                      style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        background:
                          status === "completed"
                            ? "var(--accent-light)"
                            : status === "active"
                            ? "var(--accent-light)"
                            : "var(--locked-bg)",
                        borderColor:
                          status === "completed"
                            ? "var(--accent)"
                            : status === "active"
                            ? "var(--accent)"
                            : "var(--border)",
                        color:
                          status === "completed"
                            ? "var(--accent)"
                            : status === "active"
                            ? "var(--accent)"
                            : "var(--locked-text)",
                      }}
                    >
                      {status === "completed" ? "✓" : tool.id}
                    </div>
                    {index < TOOLS.length - 1 && (
                      <div
                        className="w-[2px] mt-0 flex-shrink-0"
                        style={{
                          height: "100%",
                          minHeight: "24px",
                          background:
                            status === "completed"
                              ? "var(--accent)"
                              : "var(--border)",
                        }}
                      />
                    )}
                  </div>

                  {/* Tool card + result */}
                  <div className="flex-1 pb-5 space-y-2">
                    <ToolCard tool={tool} status={status} />

                    {/* Rezultat button for completed steps */}
                    {status === "completed" && (
                      <>
                        <button
                          onClick={() => toggleResult(tool.id)}
                          className="text-xs font-medium px-4 py-1.5 transition-all duration-250 flex items-center gap-1.5"
                          style={{
                            borderRadius: "100px",
                            background: isExpanded ? "var(--accent)" : "var(--accent-light)",
                            color: isExpanded ? "#ffffff" : "var(--accent)",
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                          }}
                          onMouseEnter={(e) => {
                            if (!isExpanded) {
                              e.currentTarget.style.background = "var(--accent)";
                              e.currentTarget.style.color = "#ffffff";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isExpanded) {
                              e.currentTarget.style.background = "var(--accent-light)";
                              e.currentTarget.style.color = "var(--accent)";
                            }
                          }}
                        >
                          Rezultat
                          <svg
                            className="w-3.5 h-3.5 transition-transform duration-250"
                            style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {/* Expanded result panel */}
                        {isExpanded && (
                          <div
                            className="rounded-[14px] p-5 animate-fade-up"
                            style={{
                              background: "var(--card)",
                              border: "1px solid var(--border)",
                              fontFamily: "'Plus Jakarta Sans', sans-serif",
                            }}
                          >
                            {renderResultContent(tool.id)}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Instrukcja i FAQ */}
        <div className="mt-12 space-y-6">
          {/* Instrukcja */}
          <div
            className="rounded-[14px] p-6 animate-fade-up"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
            }}
          >
            <h2 className="text-lg text-ink mb-4">Instrukcja aplikacji</h2>
            <div className="space-y-3 text-sm text-muted leading-relaxed" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              <p>
                Witaj w aplikacji <strong style={{ color: "var(--ink)" }}>Projekt AI w edukacji</strong>! To narzędzie
                przeprowadzi Cię krok po kroku przez proces tworzenia i obrony projektu edukacyjnego z wykorzystaniem
                sztucznej inteligencji.
              </p>
              <p>
                Aplikacja składa się z <strong style={{ color: "var(--ink)" }}>pięciu kroków</strong>, które realizujesz po kolei.
                Każdy kolejny krok odblokuje się dopiero po zakończeniu poprzedniego:
              </p>
              <ol className="list-decimal list-inside space-y-1.5 pl-1">
                <li><strong style={{ color: "var(--ink)" }}>Krok A — Definiowanie tematu.</strong> Rozmawiasz z agentem AI, który pomoże Ci wybrać i doprecyzować temat projektu.</li>
                <li><strong style={{ color: "var(--ink)" }}>Krok B — Karta projektu.</strong> Na podstawie zatwierdzonego tematu tworzysz pełną kartę projektu (cel, zakres, budżet, harmonogram i inne).</li>
                <li><strong style={{ color: "var(--ink)" }}>Krok C — Recenzja CFO.</strong> Twój projekt przechodzi recenzję finansową — agent AI wcieli się w rolę dyrektora finansowego.</li>
                <li><strong style={{ color: "var(--ink)" }}>Krok D — Recenzja PM.</strong> Kolejna recenzja — tym razem z perspektywy kierownika projektu, który oceni Twój projekt w pięciu kategoriach.</li>
                <li><strong style={{ color: "var(--ink)" }}>Krok E — Obrona projektu.</strong> Prowadzisz głosową rozmowę z komisją egzaminacyjną AI, która oceni Twoją obronę projektu.</li>
              </ol>
              <p>
                Po ukończeniu każdego kroku możesz kliknąć przycisk <strong style={{ color: "var(--accent)" }}>Rezultat</strong>,
                aby zobaczyć wynik — treść zatwierdzonego tematu, kartę projektu, recenzje lub ocenę obrony.
              </p>
            </div>
          </div>

          {/* FAQ */}
          <div
            className="rounded-[14px] p-6 animate-fade-up fade-delay-1"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
            }}
          >
            <h2 className="text-lg text-ink mb-4">Najczęściej zadawane pytania</h2>
            <div className="space-y-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              <div>
                <p className="text-sm font-semibold text-ink mb-1">Czy mogę wrócić do poprzedniego kroku?</p>
                <p className="text-sm text-muted leading-relaxed">
                  Ukończone kroki nie mogą być powtórzone, ale ich rezultaty są zawsze dostępne pod przyciskiem
                  &quot;Rezultat&quot; na dashboardzie.
                </p>
              </div>
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
                <p className="text-sm font-semibold text-ink mb-1">Jak działa agent głosowy w Kroku E?</p>
                <p className="text-sm text-muted leading-relaxed">
                  Krok E to rozmowa głosowa w czasie rzeczywistym. Agent AI prowadzi komisję egzaminacyjną, a Ty
                  bronisz swojego projektu. Potrzebujesz mikrofonu i przeglądarki wspierającej Web Audio API.
                  Możesz też skorzystać z trybu tekstowego.
                </p>
              </div>
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
                <p className="text-sm font-semibold text-ink mb-1">Co oznaczają oceny w Kroku D?</p>
                <p className="text-sm text-muted leading-relaxed">
                  Kierownik projektu (PM) ocenia Twój projekt w pięciu kategoriach (E1–E5) w skali 1–10: jasność celów,
                  realność harmonogramu, kompletność zakresu, zarządzanie ryzykiem i mierzalność rezultatów.
                </p>
              </div>
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
                <p className="text-sm font-semibold text-ink mb-1">Czy moje dane są bezpieczne?</p>
                <p className="text-sm text-muted leading-relaxed">
                  Wszystkie dane są przechowywane w bezpiecznej bazie danych. Twoje projekty, rozmowy i wyniki
                  są dostępne tylko dla Ciebie i administratorów platformy.
                </p>
              </div>
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
                <p className="text-sm font-semibold text-ink mb-1">Do kiedy mam dostęp do platformy?</p>
                <p className="text-sm text-muted leading-relaxed">
                  Platforma jest dostępna do <strong style={{ color: "var(--ink)" }}>30 czerwca 2026 roku</strong>.
                  Po tym terminie dostęp zostanie zamknięty.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="fixed bottom-0 left-0 right-0 text-center py-3 px-4 z-50"
        style={{
          background: "rgba(248, 247, 244, 0.85)",
          backdropFilter: "blur(8px)",
          borderTop: "1px solid var(--border)",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        <p className="text-[11px] text-muted">
          Workspace Partners Sp. z o.o. · Piotrkowska 73, 81-502 Gdynia
        </p>
      </footer>
    </div>
  );
}
