import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const TOOL_A_SYSTEM_PROMPT = `Jesteś doświadczonym mentorem projektów edukacyjnych. Twoim zadaniem jest pomóc użytkownikowi zdefiniować temat projektu szkoleniowego.

Prowadź rozmowę w języku polskim. Bądź pomocny, ale konkretny.

Twoje zadania:
1. Zapytaj użytkownika o obszar zainteresowań lub problem, który chce rozwiązać
2. Pomóż doprecyzować temat — zadawaj pytania pogłębiające
3. Zaproponuj sformułowanie tematu projektu (tytuł + krótki opis 2-3 zdania)
4. Gdy użytkownik zaakceptuje temat, odpowiedz w formacie:

TEMAT_ZATWIERDZONY
Tytuł: [tytuł projektu]
Opis: [opis projektu 2-3 zdania]

Ważne zasady:
- Nie zatwierdzaj tematu sam — czekaj na potwierdzenie użytkownika
- Temat powinien być konkretny i mierzalny
- Opis powinien jasno określać cel i zakres projektu
- Bądź zwięzły w odpowiedziach (maks 3-4 zdania na odpowiedź, chyba że prezentujesz temat)`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Brak klucza API OpenAI" },
        { status: 500 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: TOOL_A_SYSTEM_PROMPT },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const reply = completion.choices[0]?.message?.content || "Brak odpowiedzi";

    return NextResponse.json({ reply });
  } catch (error: unknown) {
    console.error("OpenAI API error:", error);
    const message = error instanceof Error ? error.message : "Błąd API";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
