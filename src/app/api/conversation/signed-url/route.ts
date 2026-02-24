import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const agentId = process.env.ELEVENLABS_AGENT_ID;

    if (!apiKey || !agentId) {
      return NextResponse.json(
        { error: "Brak konfiguracji ElevenLabs Agent" },
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
