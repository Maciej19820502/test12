"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";
import { TOOLS } from "@/lib/tools";
import Link from "next/link";
import ToolA from "@/components/ToolA";
import ToolB from "@/components/ToolB";

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg text-slate-500">Ładowanie...</div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-slate-500 mb-4">Narzędzie nie znalezione</p>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Wróć do panelu
          </Link>
        </div>
      </div>
    );
  }

  // Render tool-specific content
  function renderToolContent() {
    switch (toolId) {
      case "A":
        return <ToolA />;
      case "B":
        return <ToolB />;
      default:
        return (
          <main className="max-w-3xl mx-auto px-4 py-12">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
              <div className="text-6xl mb-4">{tool!.icon}</div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">{tool!.name}</h2>
              <p className="text-slate-500 mb-6">
                {tool!.type === "voice"
                  ? "Agent głosowy — wkrótce dostępny"
                  : "Agent tekstowy — wkrótce dostępny"}
              </p>
              <div className="inline-block bg-amber-50 text-amber-700 text-sm px-4 py-2 rounded-lg border border-amber-200">
                To narzędzie jest w trakcie budowy. Wróć później.
              </div>
            </div>
          </main>
        );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-slate-400 hover:text-slate-600 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {tool.icon} {tool.name}
              </h1>
              <p className="text-sm text-slate-500">{tool.description}</p>
            </div>
          </div>
        </div>
      </header>

      {renderToolContent()}
    </div>
  );
}
