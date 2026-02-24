export interface ToolInfo {
  id: "A" | "B" | "C" | "D" | "E";
  name: string;
  description: string;
  icon: string;
  type: "text" | "voice";
}

export const TOOLS: ToolInfo[] = [
  {
    id: "A",
    name: "Narzędzie A",
    description: "Definiowanie tematu projektu",
    icon: "💡",
    type: "text",
  },
  {
    id: "B",
    name: "Narzędzie B",
    description: "Opracowanie karty projektu",
    icon: "📋",
    type: "text",
  },
  {
    id: "C",
    name: "Narzędzie C",
    description: "Recenzja CFO",
    icon: "💼",
    type: "text",
  },
  {
    id: "D",
    name: "Narzędzie D",
    description: "Recenzja PM",
    icon: "📊",
    type: "text",
  },
  {
    id: "E",
    name: "Narzędzie E",
    description: "Obrona projektu (agent głosowy)",
    icon: "🎙️",
    type: "voice",
  },
];

export type ToolStatus = "locked" | "active" | "completed";

export function getToolStatuses(
  sessions: Array<{ tool_name: string; status: string }>
): Record<string, ToolStatus> {
  const toolOrder: Array<"A" | "B" | "C" | "D" | "E"> = ["A", "B", "C", "D", "E"];
  const statuses: Record<string, ToolStatus> = {};

  for (let i = 0; i < toolOrder.length; i++) {
    const toolName = toolOrder[i];
    const session = sessions.find((s) => s.tool_name === toolName);
    const sessionStatus = session?.status || "not_started";

    if (sessionStatus === "completed") {
      statuses[toolName] = "completed";
    } else if (sessionStatus === "in_progress") {
      statuses[toolName] = "active";
    } else {
      // Check if previous tool is completed
      if (i === 0) {
        statuses[toolName] = "active"; // Tool A is always available
      } else {
        const prevTool = toolOrder[i - 1];
        statuses[toolName] = statuses[prevTool] === "completed" ? "active" : "locked";
      }
    }
  }

  return statuses;
}
