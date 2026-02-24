"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { TOOLS, getToolStatuses, ToolStatus } from "@/lib/tools";
import ToolCard from "@/components/ToolCard";

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [toolStatuses, setToolStatuses] = useState<Record<string, ToolStatus>>({});
  const [loadingSessions, setLoadingSessions] = useState(true);

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
      setToolStatuses(getToolStatuses(sessions));
    }
    setLoadingSessions(false);
  }

  function handleLogout() {
    logout();
    router.push("/");
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
            <div className="flex items-center gap-2 hidden min-[480px]:flex">
              <span className="text-white/90 text-sm font-medium tracking-wide" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                DFE.academy
              </span>
              <span
                className="w-2 h-2 rounded-full animate-pulse-dot"
                style={{ background: "var(--accent)" }}
              />
            </div>

            {/* Separator */}
            <div className="hidden min-[480px]:block w-px h-8 bg-white/20" />

            {/* Title */}
            <div>
              <h1 className="text-white text-lg">Projekt AI</h1>
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
              Ładowanie narzędzi...
            </div>
          ) : (
            TOOLS.map((tool, index) => {
              const status = toolStatuses[tool.id] || "locked";
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

                  {/* Tool card */}
                  <div className="flex-1 pb-5">
                    <ToolCard tool={tool} status={status} />
                  </div>
                </div>
              );
            })
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
