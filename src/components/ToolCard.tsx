"use client";

import { ToolInfo, ToolStatus } from "@/lib/tools";
import Link from "next/link";

interface ToolCardProps {
  tool: ToolInfo;
  status: ToolStatus;
}

export default function ToolCard({ tool, status }: ToolCardProps) {
  const isActive = status === "active";
  const isCompleted = status === "completed";
  const isLocked = status === "locked";

  const cardStyle: React.CSSProperties = {
    borderRadius: "14px",
    padding: "22px 26px",
    transition: "all 0.25s ease",
    border: isActive
      ? "1.5px solid var(--accent)"
      : isCompleted
      ? "1.5px solid var(--border)"
      : "1.5px solid var(--border)",
    background: isLocked ? "var(--locked-bg)" : "var(--card)",
    opacity: isLocked ? 0.55 : 1,
    boxShadow: isActive ? "0 4px 20px var(--accent-glow)" : "none",
  };

  const cardContent = (
    <div
      className={`${
        isActive
          ? "hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
          : ""
      }`}
      style={cardStyle}
      onMouseEnter={(e) => {
        if (isActive) {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 8px 30px var(--accent-glow)";
        }
      }}
      onMouseLeave={(e) => {
        if (isActive) {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 20px var(--accent-glow)";
        }
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{tool.icon}</span>
          <div>
            <h3
              className="font-semibold"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: isLocked ? "var(--locked-text)" : "var(--ink)",
              }}
            >
              {tool.name}
            </h3>
            <p
              className="text-sm"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: isLocked ? "var(--locked-text)" : "var(--muted)",
              }}
            >
              {tool.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          {tool.type === "voice" && (
            <span
              className="text-xs font-medium px-3 py-1"
              style={{
                borderRadius: "100px",
                background: "var(--purple-light)",
                color: "var(--purple)",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Głosowy
            </span>
          )}
          <span
            className="text-xs font-medium px-3 py-1"
            style={{
              borderRadius: "100px",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              background: isActive
                ? "var(--accent-light)"
                : isCompleted
                ? "var(--accent-light)"
                : "var(--locked-bg)",
              color: isActive
                ? "var(--accent)"
                : isCompleted
                ? "var(--accent)"
                : "var(--locked-text)",
              border: isLocked ? "1px solid var(--border)" : "none",
            }}
          >
            {isCompleted ? "Ukończone" : isActive ? "Aktywne" : "Zablokowane"}
          </span>
          {isActive && (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-250"
              style={{
                border: "1.5px solid var(--accent)",
                color: "var(--accent)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--accent)";
                e.currentTarget.style.color = "#ffffff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--accent)";
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (isActive) {
    return (
      <Link href={`/tools/${tool.id.toLowerCase()}`}>
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
