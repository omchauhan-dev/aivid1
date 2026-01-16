
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!process.env.HUGGING_FACE_API_KEY) {
      return new Response(JSON.stringify({ error: 'Missing HF API Key' }), { status: 500 });
    }

    // Use Hugging Face Inference API for Flux
    const response = await fetch(
      "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
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
        console.error("Hugging Face Image API Error:", errorText);
        throw new Error(`HF API error: ${response.statusText}`);
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
