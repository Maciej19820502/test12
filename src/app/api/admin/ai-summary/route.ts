import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  const password = req.headers.get("x-admin-password");
  if (password !== "MACIEK2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "Brak klucza API OpenAI" }, { status: 500 });
  }

  const { type, data } = await req.json();

  if (type === "participant") {
    return handleParticipantSummary(data);
  } else if (type === "overall") {
    return handleOverallSummary(data);
  }

  return NextResponse.json({ error: "Unknown type" }, { status: 400 });
}

async function handleParticipantSummary(participant: Record<string, unknown>) {
  const prompt = buildParticipantPrompt(participant);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Jesteś ekspertem ds. oceny uczestników programu edukacyjnego "Projekt AI w edukacji".
Twoim zadaniem jest napisanie zwięzłego opisu podsumowującego ocenę uczestnika w nie więcej niż 1000 znaków.

Opis MUSI zawierać:
1. Ogólną ocenę merytoryczną projektu i postępów uczestnika
2. Ocenę dojrzałości technologicznej do pracy z chatbotem AI (narzędzia A-D)
3. Ocenę dojrzałości technologicznej do pracy z modelem głosowym AI (narzędzie E)
4. Kluczowe mocne strony i obszary do poprawy

Pisz po polsku, profesjonalnie i zwięźle. Max 1000 znaków.`,
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 500,
    });

    const summary = completion.choices[0]?.message?.content || "Brak opisu";
    return NextResponse.json({ summary });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Błąd API";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function handleOverallSummary(data: { descriptions: { name: string; description: string }[] }) {
  const descriptionsText = data.descriptions
    .map((d, i) => `${i + 1}. ${d.name}: ${d.description}`)
    .join("\n\n");

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Jesteś ekspertem ds. ewaluacji programów edukacyjnych. Na podstawie opisów poszczególnych uczestników programu "Projekt AI w edukacji", przygotuj podsumowanie całej grupy.

Podsumowanie MUSI zawierać:
1. Ogólny obraz grupy — poziom zaangażowania i postępów
2. Wzorce w dojrzałości technologicznej do pracy z AI (chat i głos)
3. Powtarzające się mocne strony grupy
4. Wspólne obszary do poprawy
5. Wnioski i rekomendacje dla organizatorów programu

Pisz po polsku, profesjonalnie. Używaj akapitów.`,
        },
        {
          role: "user",
          content: `Opisy ${data.descriptions.length} uczestników programu:\n\n${descriptionsText}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 2000,
    });

    const summary = completion.choices[0]?.message?.content || "Brak podsumowania";
    return NextResponse.json({ summary });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Błąd API";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function buildParticipantPrompt(p: Record<string, unknown>): string {
  const parts: string[] = [];

  parts.push(`Uczestnik: ${p.name} (${p.email})`);
  parts.push(`Ukończone narzędzia: ${(p.completedTools as string[])?.join(", ") || "brak"} (${p.completedCount}/5)`);

  if (p.projectTitle) {
    parts.push(`Temat projektu: ${p.projectTitle}`);
  }
  if (p.projectDescription) {
    parts.push(`Opis projektu: ${p.projectDescription}`);
  }

  const card = p.projectCard as Record<string, string | null> | null;
  if (card) {
    const sections = [
      "Cel projektu", "Zakres", "Grupa docelowa", "Rezultaty",
      "Harmonogram", "Budżet i zasoby", "Ryzyka", "Kryteria sukcesu",
    ];
    const cardText = sections
      .map((label, i) => {
        const val = card[`s${i + 1}`];
        return val ? `  ${label}: ${val}` : null;
      })
      .filter(Boolean)
      .join("\n");
    if (cardText) {
      parts.push(`Karta projektu:\n${cardText}`);
    }
  }

  if (p.cfoApproved != null) {
    parts.push(`CFO: ${p.cfoApproved ? "Zatwierdzony" : "Odrzucony"}`);
    if (p.cfoReviewText) parts.push(`Recenzja CFO: ${p.cfoReviewText}`);
    if (p.cfoRequirements) parts.push(`Wymagania CFO: ${p.cfoRequirements}`);
  }

  const pmScores = p.pmScores as Record<string, number | null> | null;
  if (pmScores) {
    const scores = ["e1", "e2", "e3", "e4", "e5"]
      .map((k) => `${k.toUpperCase()}=${pmScores[k] ?? "—"}`)
      .join(", ");
    parts.push(`Oceny PM: ${scores}, średnia=${pmScores.average ?? "—"}`);
    if (p.pmRecommendations) parts.push(`Rekomendacje PM: ${p.pmRecommendations}`);
  }

  if (p.defenseDecision) {
    parts.push(`Obrona głosowa: ${p.defenseDecision}`);
    if (p.defenseNotes) parts.push(`Notatki z obrony: ${p.defenseNotes}`);
  }

  return parts.join("\n");
}
