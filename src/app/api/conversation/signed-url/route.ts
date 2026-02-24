import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const agentId = process.env.ELEVENLABS_AGENT_ID;

    if (!apiKey || !agentId) {
      const missing = [];
      if (!apiKey) missing.push("ELEVENLABS_API_KEY");
      if (!agentId) missing.push("ELEVENLABS_AGENT_ID");
      console.error("Missing env vars:", missing.join(", "));
      return NextResponse.json(
        { error: `Brak zmiennych środowiskowych: ${missing.join(", ")}. Upewnij się, że są ustawione w .env.local i zrestartuj serwer (npm run dev).` },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
      {
        method: "GET",
        headers: {
          "xi-api-key": apiKey,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs signed URL error:", response.status, errorText);
      return NextResponse.json(
        { error: `ElevenLabs error: ${response.status}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json({ signedUrl: data.signed_url });
  } catch (error: unknown) {
    console.error("Signed URL error:", error);
    const message = error instanceof Error ? error.message : "Błąd generowania URL";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
