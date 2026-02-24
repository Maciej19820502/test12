"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import LoginForm from "@/components/LoginForm";

function DotGrid() {
  const dots = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 5; col++) {
      dots.push(
        <div
          key={`${row}-${col}`}
          className="w-1 h-1 rounded-full bg-white/20"
        />
      );
    }
  }
  return (
    <div className="grid grid-cols-5 gap-4 opacity-30">
      {dots}
    </div>
  );
}

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-pulse text-lg text-muted">Ładowanie...</div>
      </div>
    );
  }

  if (user) return null;

  return (
    <main className="min-h-screen flex flex-col md:flex-row">
      {/* Left panel */}
      <div
        className="hidden md:flex md:w-[44%] flex-col justify-between p-10 lg:p-14 relative overflow-hidden"
        style={{ background: "var(--ink)" }}
      >
        {/* Decorative radial glow */}
        <div
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)" }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-16">
            <span className="text-white/90 text-sm font-medium tracking-wide" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              DFE.academy
            </span>
            <span
              className="w-2 h-2 rounded-full animate-pulse-dot"
              style={{ background: "var(--accent)" }}
            />
          </div>

          {/* Hero text */}
          <h1 className="text-white text-4xl lg:text-[52px] leading-tight mb-6">
            Cyfrowy{" "}
            <em style={{ color: "var(--accent)" }}>Lider</em>
          </h1>
          <p className="text-white/60 text-base lg:text-lg leading-relaxed max-w-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Platforma szkoleniowa z agentami AI dla uczestników programu &quot;Cyfrowy Lider&quot;
          </p>
        </div>

        {/* Bottom info */}
        <div className="relative z-10 space-y-5">
          <DotGrid />
          <div className="space-y-1.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <p className="text-white/50 text-xs tracking-wide">
              Akademia Leona Koźmińskiego · Warszawa
            </p>
            <p className="text-white/40 text-xs">
              Dostęp aktywny do 30.06.2026
            </p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 md:px-12 bg-surface relative">
        {/* Mobile logo */}
        <div className="md:hidden flex items-center gap-2 mb-10">
          <span className="text-ink text-sm font-medium tracking-wide" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            DFE.academy
          </span>
          <span
            className="w-2 h-2 rounded-full animate-pulse-dot"
            style={{ background: "var(--accent)" }}
          />
        </div>

        <div className="w-full max-w-[420px] animate-fade-up">
          <div className="mb-8">
            <h2 className="text-3xl text-ink mb-2">Zaloguj się</h2>
            <p className="text-muted text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Wprowadź swoje dane, aby kontynuować
            </p>
          </div>

          <LoginForm />

          <div className="text-center mt-8">
            <Link
              href="/admin"
              className="text-xs text-muted/50 hover:text-muted transition-colors duration-250"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Panel admina
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
      </div>
    </main>
  );
}
