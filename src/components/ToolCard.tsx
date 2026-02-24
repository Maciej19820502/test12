"use client";

import { ToolInfo, ToolStatus } from "@/lib/tools";
import Link from "next/link";

interface ToolCardProps {
  tool: ToolInfo;
  status: ToolStatus;
}

export default function ToolCard({ tool, status }: ToolCardProps) {
  const statusConfig = {
    locked: {
      bg: "bg-slate-50 border-slate-200",
      badge: "bg-slate-100 text-slate-400",
      badgeText: "Zablokowane",
      textColor: "text-slate-400",
    },
    active: {
      bg: "bg-white border-blue-200 shadow-md",
      badge: "bg-blue-100 text-blue-700",
      badgeText: "Aktywne",
      textColor: "text-slate-900",
    },
    completed: {
      bg: "bg-white border-green-200",
      badge: "bg-green-100 text-green-700",
      badgeText: "Ukończone",
      textColor: "text-slate-700",
    },
  };

  const config = statusConfig[status];

  const cardContent = (
    <div
      className={`rounded-xl border p-5 transition-all ${config.bg} ${
        status === "active" ? "hover:shadow-lg cursor-pointer" : ""
      } ${status === "locked" ? "opacity-60" : ""}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{tool.icon}</span>
          <div>
            <h3 className={`font-semibold ${config.textColor}`}>{tool.name}</h3>
            <p className={`text-sm ${status === "locked" ? "text-slate-400" : "text-slate-500"}`}>
              {tool.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {tool.type === "voice" && (
            <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700">
              Głosowy
            </span>
          )}
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${config.badge}`}>
            {config.badgeText}
          </span>
          {status === "active" && (
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );

  if (status === "active") {
    return (
      <Link href={`/tools/${tool.id.toLowerCase()}`}>
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
