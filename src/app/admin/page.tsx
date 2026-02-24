"use client";

import { useState } from "react";
import Link from "next/link";

interface PmScores {
  e1: number | null;
  e2: number | null;
  e3: number | null;
  e4: number | null;
  e5: number | null;
  average: number | null;
}

interface Participant {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  projectTitle: string | null;
  completedTools: string[];
  completedCount: number;
  pmScores: PmScores | null;
  cfoApproved: boolean | null;
  defenseDecision: string | null;
}

const TOOLS_ORDER = ["A", "B", "C", "D", "E"];
const TOOL_LABELS: Record<string, string> = {
  A: "Temat",
  B: "Karta",
  C: "CFO",
  D: "PM",
  E: "Obrona",
};

export default function AdminDashboard() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/participants", {
        headers: { "x-admin-password": password },
      });

      if (res.status === 401) {
        setError("Nieprawidłowe hasło");
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      setParticipants(data.participants);
      setAuthenticated(true);
    } catch {
      setError("Błąd połączenia z serwerem");
    }
    setLoading(false);
  }

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/participants", {
        headers: { "x-admin-password": password },
      });
      const data = await res.json();
      if (!data.error) {
        setParticipants(data.participants);
      }
    } catch {
      // silent
    }
    setLoading(false);
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-surface px-4">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="text-center mb-8">
            <h1 className="text-2xl text-ink">Panel admina</h1>
            <p className="text-muted mt-2 text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Porównanie uczestników
            </p>
          </div>
          <form
            onSubmit={handleLogin}
            className="rounded-[14px] p-8 space-y-5"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-semibold tracking-[1.5px] uppercase mb-2"
                style={{ color: "var(--muted)", fontSize: "12px" }}
              >
                Hasło dostępu
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Wprowadź hasło"
                required
                className="w-full px-4 py-3 rounded-[14px] border-[1.5px] outline-none transition-all duration-250 text-ink placeholder:text-locked-text"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--card)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--accent)";
                  e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {error && (
              <div
                className="text-sm px-4 py-3 rounded-[14px] border"
                style={{
                  background: "var(--accent-light)",
                  color: "var(--accent)",
                  borderColor: "var(--accent-glow)",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-[14px] font-semibold text-white transition-all duration-250 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "var(--accent)" }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.boxShadow = "0 8px 25px var(--accent-glow)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {loading ? "Ładowanie..." : "Zaloguj się"}
            </button>
          </form>
          <div className="text-center mt-4">
            <Link
              href="/"
              className="text-sm text-muted/60 hover:text-muted transition-colors duration-250"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Powrót do logowania
            </Link>
          </div>
        </div>

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
      </main>
    );
  }

  const totalParticipants = participants.length;
  const toolCompletionCounts = TOOLS_ORDER.map(
    (tool) => participants.filter((p) => p.completedTools.includes(tool)).length
  );
  const allCompleted = participants.filter((p) => p.completedCount === 5).length;

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
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="hidden min-[480px]:flex items-center gap-2">
              <span className="text-white/90 text-sm font-medium tracking-wide" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                DFE.academy
              </span>
              <span
                className="w-2 h-2 rounded-full animate-pulse-dot"
                style={{ background: "var(--accent)" }}
              />
            </div>
            <div className="hidden min-[480px]:block w-px h-8 bg-white/20" />
            <div>
              <h1 className="text-white text-lg">Panel admina</h1>
              <p className="text-white/50 text-xs" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Porównanie postępów uczestników
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={refresh}
              disabled={loading}
              className="text-sm text-white/70 hover:text-white transition-colors duration-250 px-4 py-1.5 rounded-[14px] border border-white/20 hover:border-white/40 disabled:opacity-50"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {loading ? "Odświeżanie..." : "Odśwież"}
            </button>
            <Link
              href="/"
              className="text-sm text-white/70 hover:text-white transition-colors duration-250 px-4 py-1.5 rounded-[14px] border border-white/20 hover:border-white/40"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Powrót
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 pb-24">
        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div
            className="rounded-[14px] p-5 animate-fade-up fade-delay-1"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <p className="text-sm text-muted" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Uczestników</p>
            <p className="text-3xl font-bold text-ink mt-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{totalParticipants}</p>
          </div>
          <div
            className="rounded-[14px] p-5 animate-fade-up fade-delay-2"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <p className="text-sm text-muted" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Ukończyli wszystko</p>
            <p className="text-3xl font-bold mt-1" style={{ color: "var(--accent)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{allCompleted}</p>
          </div>
          {TOOLS_ORDER.map((tool, i) => (
            <div
              key={tool}
              className={`rounded-[14px] p-5 animate-fade-up fade-delay-${Math.min(i + 3, 5)}`}
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            >
              <p className="text-sm text-muted" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Narzędzie {tool} ({TOOL_LABELS[tool]})
              </p>
              <p className="text-3xl font-bold mt-1" style={{ color: "var(--accent)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {toolCompletionCounts[i]}
              </p>
              <p className="text-xs text-muted mt-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {totalParticipants > 0
                  ? `${Math.round((toolCompletionCounts[i] / totalParticipants) * 100)}%`
                  : "0%"}{" "}
                uczestników
              </p>
            </div>
          ))}
        </div>

        {/* Participants table */}
        <div
          className="rounded-[14px] overflow-hidden animate-fade-up"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}
        >
          <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <h2 className="text-lg text-ink">Uczestnicy</h2>
          </div>

          {participants.length === 0 ? (
            <div className="px-6 py-12 text-center text-muted" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Brak uczestników z ukończonymi etapami.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <thead>
                  <tr style={{ background: "var(--locked-bg)" }}>
                    <th className="px-4 py-3 font-semibold text-left" style={{ color: "var(--muted)" }}>#</th>
                    <th className="px-4 py-3 font-semibold text-left" style={{ color: "var(--muted)" }}>Uczestnik</th>
                    <th className="px-4 py-3 font-semibold text-left" style={{ color: "var(--muted)" }}>Projekt</th>
                    {TOOLS_ORDER.map((tool) => (
                      <th key={tool} className="px-3 py-3 font-semibold text-center" style={{ color: "var(--muted)" }}>
                        {tool}
                      </th>
                    ))}
                    <th className="px-4 py-3 font-semibold text-center" style={{ color: "var(--muted)" }}>Postęp</th>
                    <th className="px-4 py-3 font-semibold text-center" style={{ color: "var(--muted)" }}>Ocena PM</th>
                    <th className="px-4 py-3 font-semibold text-center" style={{ color: "var(--muted)" }}>CFO</th>
                    <th className="px-4 py-3 font-semibold text-center" style={{ color: "var(--muted)" }}>Obrona</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((p, idx) => (
                    <>
                      <tr
                        key={p.id}
                        className="cursor-pointer transition-colors duration-200"
                        style={{
                          borderTop: "1px solid var(--border)",
                          background: expandedRow === p.id ? "var(--accent-light)" : "transparent",
                        }}
                        onMouseEnter={(e) => {
                          if (expandedRow !== p.id) {
                            e.currentTarget.style.background = "var(--locked-bg)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (expandedRow !== p.id) {
                            e.currentTarget.style.background = "transparent";
                          }
                        }}
                        onClick={() => setExpandedRow(expandedRow === p.id ? null : p.id)}
                      >
                        <td className="px-4 py-3 text-muted">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-ink">{p.name}</div>
                          <div className="text-xs text-muted">{p.email}</div>
                        </td>
                        <td className="px-4 py-3 max-w-[200px] truncate" style={{ color: "var(--ink)" }}>
                          {p.projectTitle || <span className="text-locked-text">—</span>}
                        </td>
                        {TOOLS_ORDER.map((tool) => (
                          <td key={tool} className="px-3 py-3 text-center">
                            {p.completedTools.includes(tool) ? (
                              <span
                                className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold"
                                style={{ background: "var(--accent-light)", color: "var(--accent)" }}
                              >
                                ✓
                              </span>
                            ) : (
                              <span
                                className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs"
                                style={{ background: "var(--locked-bg)", color: "var(--locked-text)" }}
                              >
                                —
                              </span>
                            )}
                          </td>
                        ))}
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center gap-2 justify-center">
                            <div className="w-16 rounded-full" style={{ height: "6px", background: "var(--locked-bg)" }}>
                              <div
                                className="rounded-full transition-all"
                                style={{
                                  height: "6px",
                                  width: `${(p.completedCount / 5) * 100}%`,
                                  background: "var(--accent)",
                                }}
                              />
                            </div>
                            <span className="text-xs font-medium text-muted">
                              {p.completedCount}/5
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {p.pmScores?.average != null ? (
                            <span
                              className="font-bold"
                              style={{
                                color:
                                  p.pmScores.average >= 4
                                    ? "#16a34a"
                                    : p.pmScores.average >= 3
                                    ? "#ca8a04"
                                    : "var(--accent)",
                              }}
                            >
                              {Number(p.pmScores.average).toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-locked-text">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {p.cfoApproved === true ? (
                            <span
                              className="inline-flex px-2.5 py-0.5 text-xs font-medium"
                              style={{
                                borderRadius: "100px",
                                background: "var(--accent-light)",
                                color: "var(--accent)",
                              }}
                            >
                              Tak
                            </span>
                          ) : p.cfoApproved === false ? (
                            <span
                              className="inline-flex px-2.5 py-0.5 text-xs font-medium"
                              style={{
                                borderRadius: "100px",
                                background: "var(--locked-bg)",
                                color: "var(--locked-text)",
                              }}
                            >
                              Nie
                            </span>
                          ) : (
                            <span className="text-locked-text">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {p.defenseDecision ? (
                            <span
                              className="inline-flex px-2.5 py-0.5 text-xs font-medium"
                              style={{
                                borderRadius: "100px",
                                background: "var(--purple-light)",
                                color: "var(--purple)",
                              }}
                            >
                              {p.defenseDecision}
                            </span>
                          ) : (
                            <span className="text-locked-text">—</span>
                          )}
                        </td>
                      </tr>

                      {/* Expanded row with PM scores details */}
                      {expandedRow === p.id && p.pmScores && (
                        <tr key={`${p.id}-details`} style={{ background: "var(--accent-light)", borderTop: "1px solid var(--accent-glow)" }}>
                          <td colSpan={11} className="px-6 py-4">
                            <div className="text-sm">
                              <p className="font-semibold mb-3" style={{ color: "var(--ink)" }}>Oceny szczegółowe PM:</p>
                              <div className="grid grid-cols-5 gap-4 max-w-lg">
                                {(["e1", "e2", "e3", "e4", "e5"] as const).map((key) => {
                                  const score = p.pmScores?.[key];
                                  return (
                                    <div key={key} className="text-center">
                                      <p className="text-xs uppercase font-medium text-muted">{key}</p>
                                      <p
                                        className="text-lg font-bold mt-0.5"
                                        style={{
                                          color:
                                            score != null && score >= 4
                                              ? "#16a34a"
                                              : score != null && score >= 3
                                              ? "#ca8a04"
                                              : score != null
                                              ? "var(--accent)"
                                              : "var(--locked-text)",
                                        }}
                                      >
                                        {score != null ? Number(score).toFixed(1) : "—"}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
