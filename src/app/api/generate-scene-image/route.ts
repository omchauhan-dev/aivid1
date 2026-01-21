
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { prompt, model: requestedModel } = await req.json();

    if (!process.env.HUGGING_FACE_API_KEY) {
      return new Response(JSON.stringify({ error: 'Missing HF API Key' }), { status: 500 });
    }

    // Determine model to use. Default to SDXL Base if not specified, but support overrides.
    // User requested SDXL Turbo support.
    let model = "stabilityai/stable-diffusion-xl-base-1.0";

    if (requestedModel === 'sdxl-turbo') {
        model = "stabilityai/sdxl-turbo";
    } else if (requestedModel === 'flux') {
        model = "black-forest-labs/FLUX.1-schnell";
    } else if (requestedModel) {
        // Allow passing full model ID if advanced user
        model = requestedModel;
    }

    const response = await fetch(
      `https://router.huggingface.co/hf-inference/models/${model}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Hugging Face Image API Error (${model}):`, errorText);
        return new Response(JSON.stringify({ error: `HF API Error: ${response.status} - ${errorText}` }), { status: 500 });
    }

    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const base64 = buffer.toString('base64');
    const mimeType = blob.type || 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${base64}`;

    return new Response(JSON.stringify({ url: dataUrl }), { status: 200 });

  } catch (error) {
    console.error('Error generating image:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate image.' }), {
      status: 500,
    });
  }
}
