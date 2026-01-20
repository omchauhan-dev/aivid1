
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!process.env.OPENROUTER_API_KEY) {
      return new Response(JSON.stringify({ error: 'Missing API Key' }), { status: 500 });
    }

    // OpenRouter currently focuses on LLMs.
    // Standard TTS (like OpenAI's /v1/audio/speech) might not be directly supported via the same endpoint.
    // However, if the user has a key that works for OpenAI directly, this would work.
    // Since we are strictly using OpenRouter, we will try to request it.
    // If this fails (404/400), we return an error.

    // Note: As of my knowledge cutoff, OpenRouter doesn't officially proxy the OpenAI Audio API.
    // But for the sake of the "system" request, I will implement the structure.

    const response = await fetch("https://openrouter.ai/api/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/tts-1",
        input: text,
        voice: "alloy"
      })
    });

    if (!response.ok) {
        // Fallback: If OpenRouter doesn't support it, we might want to tell the client
        // to use browser TTS or just fail gracefully.
        console.warn("OpenRouter TTS failed, status:", response.status);
        return new Response(JSON.stringify({ error: 'Voiceover generation not supported by current provider.' }), { status: 501 });
    }

    const arrayBuffer = await response.arrayBuffer();
    // Return audio content
    return new Response(arrayBuffer, {
      headers: {
        "Content-Type": "audio/mpeg"
      }
    });

  } catch (error) {
    console.error('Error generating voiceover:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate voiceover.' }), {
      status: 500,
    });
  }
}
