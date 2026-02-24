"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";
import { TOOLS } from "@/lib/tools";
import Link from "next/link";
import ToolA from "@/components/ToolA";
import ToolB from "@/components/ToolB";
import ToolC from "@/components/ToolC";
import ToolD from "@/components/ToolD";
import ToolE from "@/components/ToolE";

export default function ToolPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const toolId = (params.toolId as string)?.toUpperCase();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  const tool = TOOLS.find((t) => t.id === toolId);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-pulse text-lg text-muted">Ładowanie...</div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <p className="text-lg text-muted mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Narzędzie nie znalezione
          </p>
          <Link
            href="/dashboard"
            className="text-sm font-medium transition-colors duration-250"
            style={{ color: "var(--accent)" }}
          >
            Wróć do panelu
          </Link>
        </div>
      </div>
    );
  }

  function renderToolContent() {
    switch (toolId) {
      case "A":
        return <ToolA />;
      case "B":
        return <ToolB />;
      case "C":
        return <ToolC />;
      case "D":
        return <ToolD />;
      case "E":
        return <ToolE />;
      default:
        return (
          <main className="max-w-3xl mx-auto px-4 py-12">
            <div
              className="rounded-[14px] p-8 text-center"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="text-6xl mb-4">{tool!.icon}</div>
              <h2 className="text-xl text-ink mb-2">{tool!.name}</h2>
              <p className="text-muted mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {tool!.type === "voice"
                  ? "Agent głosowy — wkrótce dostępny"
                  : "Agent tekstowy — wkrótce dostępny"}
              </p>
              <div
                className="inline-block text-sm px-4 py-2 rounded-[14px]"
                style={{
                  background: "var(--accent-light)",
                  color: "var(--accent)",
                  border: "1px solid var(--accent-glow)",
                }}
              >
                To narzędzie jest w trakcie budowy. Wróć później.
              </div>
            </div>
          </main>
        );
    }
  }

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
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-white/50 hover:text-white transition-colors duration-250"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>

            {/* Logo */}
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
              <h1 className="text-white text-lg">
                {tool.icon} {tool.name}
              </h1>
              <p className="text-white/50 text-xs" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {tool.description}
              </p>
            </div>
          </div>
        </div>
      </header>

      {renderToolContent()}

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
