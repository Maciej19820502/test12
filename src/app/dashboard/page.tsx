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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg text-slate-500">Ładowanie...</div>
      </div>
    );
  }

  const completedCount = Object.values(toolStatuses).filter((s) => s === "completed").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Projekt AI</h1>
            <p className="text-sm text-slate-500">Witaj, {user.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-slate-500 hover:text-slate-700 transition px-3 py-1.5 rounded-lg hover:bg-slate-100"
          >
            Wyloguj się
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Progress bar */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-slate-900">Twój postęp</h2>
            <span className="text-sm text-slate-500">
              {completedCount} z {TOOLS.length} ukończonych
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / TOOLS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Tool steps */}
        <div className="space-y-4">
          {loadingSessions ? (
            <div className="text-center py-12 text-slate-500">
              Ładowanie narzędzi...
            </div>
          ) : (
            TOOLS.map((tool, index) => (
              <div key={tool.id} className="flex items-start gap-4">
                {/* Step connector */}
                <div className="flex flex-col items-center pt-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                      toolStatuses[tool.id] === "completed"
                        ? "bg-green-100 border-green-500 text-green-700"
                        : toolStatuses[tool.id] === "active"
                        ? "bg-blue-100 border-blue-500 text-blue-700"
                        : "bg-slate-100 border-slate-300 text-slate-400"
                    }`}
                  >
                    {toolStatuses[tool.id] === "completed" ? "✓" : tool.id}
                  </div>
                  {index < TOOLS.length - 1 && (
                    <div
                      className={`w-0.5 h-12 mt-1 ${
                        toolStatuses[tool.id] === "completed"
                          ? "bg-green-300"
                          : "bg-slate-200"
                      }`}
                    />
                  )}
                </div>

                {/* Tool card */}
                <div className="flex-1 pb-4">
                  <ToolCard
                    tool={tool}
                    status={toolStatuses[tool.id] || "locked"}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
