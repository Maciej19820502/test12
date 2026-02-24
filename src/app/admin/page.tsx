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
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Panel admina</h1>
            <p className="text-slate-500 mt-2">Porównanie uczestników</p>
          </div>
          <form
            onSubmit={handleLogin}
            className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 space-y-5"
          >
            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium text-slate-700 mb-1">
                Hasło dostępu
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Wprowadź hasło"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-slate-900 placeholder:text-slate-400"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Ładowanie..." : "Zaloguj się"}
            </button>
          </form>
          <div className="text-center mt-4">
            <Link href="/" className="text-sm text-slate-400 hover:text-slate-600 transition">
              Powrót do logowania
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const totalParticipants = participants.length;
  const toolCompletionCounts = TOOLS_ORDER.map(
    (tool) => participants.filter((p) => p.completedTools.includes(tool)).length
  );
  const allCompleted = participants.filter((p) => p.completedCount === 5).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Panel admina</h1>
            <p className="text-sm text-slate-500">Porównanie postępów uczestników</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={refresh}
              disabled={loading}
              className="text-sm text-blue-600 hover:text-blue-800 transition px-3 py-1.5 rounded-lg hover:bg-blue-50 disabled:opacity-50"
            >
              {loading ? "Odświeżanie..." : "Odśwież"}
            </button>
            <Link
              href="/"
              className="text-sm text-slate-500 hover:text-slate-700 transition px-3 py-1.5 rounded-lg hover:bg-slate-100"
            >
              Powrót
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <p className="text-sm text-slate-500">Uczestników</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{totalParticipants}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <p className="text-sm text-slate-500">Ukończyli wszystko</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{allCompleted}</p>
          </div>
          {TOOLS_ORDER.map((tool, i) => (
            <div key={tool} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <p className="text-sm text-slate-500">
                Narzędzie {tool} ({TOOL_LABELS[tool]})
              </p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{toolCompletionCounts[i]}</p>
              <p className="text-xs text-slate-400 mt-1">
                {totalParticipants > 0
                  ? `${Math.round((toolCompletionCounts[i] / totalParticipants) * 100)}%`
                  : "0%"}{" "}
                uczestników
              </p>
            </div>
          ))}
        </div>

        {/* Participants table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Uczestnicy</h2>
          </div>

          {participants.length === 0 ? (
            <div className="px-6 py-12 text-center text-slate-500">
              Brak uczestników z ukończonymi etapami.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="px-4 py-3 font-semibold text-slate-600">#</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Uczestnik</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Projekt</th>
                    {TOOLS_ORDER.map((tool) => (
                      <th key={tool} className="px-3 py-3 font-semibold text-slate-600 text-center">
                        {tool}
                      </th>
                    ))}
                    <th className="px-4 py-3 font-semibold text-slate-600 text-center">Postęp</th>
                    <th className="px-4 py-3 font-semibold text-slate-600 text-center">Ocena PM</th>
                    <th className="px-4 py-3 font-semibold text-slate-600 text-center">CFO</th>
                    <th className="px-4 py-3 font-semibold text-slate-600 text-center">Obrona</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((p, idx) => (
                    <>
                      <tr
                        key={p.id}
                        className={`border-t border-slate-100 hover:bg-slate-50 cursor-pointer transition ${
                          expandedRow === p.id ? "bg-blue-50" : ""
                        }`}
                        onClick={() => setExpandedRow(expandedRow === p.id ? null : p.id)}
                      >
                        <td className="px-4 py-3 text-slate-400">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-slate-900">{p.name}</div>
                          <div className="text-xs text-slate-400">{p.email}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-700 max-w-[200px] truncate">
                          {p.projectTitle || <span className="text-slate-300">—</span>}
                        </td>
                        {TOOLS_ORDER.map((tool) => (
                          <td key={tool} className="px-3 py-3 text-center">
                            {p.completedTools.includes(tool) ? (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                                ✓
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-300 text-xs">
                                —
                              </span>
                            )}
                          </td>
                        ))}
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center gap-2 justify-center">
                            <div className="w-16 bg-slate-100 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${(p.completedCount / 5) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-500 font-medium">
                              {p.completedCount}/5
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {p.pmScores?.average != null ? (
                            <span
                              className={`font-bold ${
                                p.pmScores.average >= 4
                                  ? "text-green-600"
                                  : p.pmScores.average >= 3
                                  ? "text-yellow-600"
                                  : "text-red-600"
                              }`}
                            >
                              {Number(p.pmScores.average).toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {p.cfoApproved === true ? (
                            <span className="inline-flex px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                              Tak
                            </span>
                          ) : p.cfoApproved === false ? (
                            <span className="inline-flex px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                              Nie
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {p.defenseDecision ? (
                            <span className="inline-flex px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
                              {p.defenseDecision}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                      </tr>

                      {/* Expanded row with PM scores details */}
                      {expandedRow === p.id && p.pmScores && (
                        <tr key={`${p.id}-details`} className="bg-blue-50 border-t border-blue-100">
                          <td colSpan={11} className="px-6 py-4">
                            <div className="text-sm">
                              <p className="font-semibold text-slate-700 mb-3">Oceny szczegółowe PM:</p>
                              <div className="grid grid-cols-5 gap-4 max-w-lg">
                                {(["e1", "e2", "e3", "e4", "e5"] as const).map((key) => {
                                  const score = p.pmScores?.[key];
                                  return (
                                    <div key={key} className="text-center">
                                      <p className="text-xs text-slate-500 uppercase font-medium">{key}</p>
                                      <p
                                        className={`text-lg font-bold mt-0.5 ${
                                          score != null && score >= 4
                                            ? "text-green-600"
                                            : score != null && score >= 3
                                            ? "text-yellow-600"
                                            : score != null
                                            ? "text-red-600"
                                            : "text-slate-300"
                                        }`}
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
    </div>
  );
}
