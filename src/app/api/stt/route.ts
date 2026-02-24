import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Brak konfiguracji ElevenLabs" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const audio = formData.get("audio") as Blob | null;

    if (!audio) {
      return NextResponse.json({ error: "Brak pliku audio" }, { status: 400 });
    }

    const elevenLabsForm = new FormData();
    elevenLabsForm.append("file", audio, "recording.webm");
    elevenLabsForm.append("model_id", "scribe_v1");
    elevenLabsForm.append("language_code", "pol");

    const response = await fetch(
      "https://api.elevenlabs.io/v1/speech-to-text",
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
        },
        body: elevenLabsForm,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs STT error:", response.status, errorText);
      return NextResponse.json(
        { error: `ElevenLabs STT error: ${response.status}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json({ text: data.text || "" });
  } catch (error: unknown) {
    console.error("STT error:", error);
    const message = error instanceof Error ? error.message : "Błąd STT";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
