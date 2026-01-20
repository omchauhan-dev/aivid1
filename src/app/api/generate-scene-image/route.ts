
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!process.env.HUGGING_FACE_API_KEY) {
      return new Response(JSON.stringify({ error: 'Missing HF API Key' }), { status: 500 });
    }

    // UPDATE: HF Inference API URL changed.
    // Use the router URL or the dedicated endpoint if using a specific model.
    // The error message said: "Please use https://router.huggingface.co instead."

    const model = "stabilityai/stable-diffusion-xl-base-1.0";

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
        // Fallback to Flux if SDXL fails, or just report error
        const errorText = await response.text();
        console.error("Hugging Face Image API Error:", errorText);

        // Retry with Flux on the new router URL if the first one failed (e.g. if SDXL is restricted)
        // But first, let's return the error properly.
        return new Response(JSON.stringify({ error: `HF API Error: ${response.status} - ${errorText}` }), { status: 500 });
    }

    // The HF Inference API for image models often returns the image binary directly (Blob)
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Convert to Data URL
    const base64 = buffer.toString('base64');
    const mimeType = blob.type || 'image/jpeg'; // Default to jpeg if type missing
    const dataUrl = `data:${mimeType};base64,${base64}`;

    return new Response(JSON.stringify({ url: dataUrl }), { status: 200 });

  } catch (error) {
    console.error('Error generating image:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate image.' }), {
      status: 500,
    });
  }
}
