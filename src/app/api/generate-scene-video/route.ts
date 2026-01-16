
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { prompt, imageUrl } = await req.json();

    if (!process.env.HUGGING_FACE_API_KEY) {
      return new Response(JSON.stringify({ error: 'Missing HF API Key' }), { status: 500 });
    }

    // We will use Lightricks/LTX-Video on Hugging Face if available, as it is a strong open video model.
    // Or we can try "stabilityai/stable-video-diffusion-img2vid-xt" for Image-to-Video.
    // Since the prompt explicitly said "from image generate video", we should prefer Image-to-Video.

    let model = "Lightricks/LTX-Video"; // Good text-to-video / image-to-video model
    let inputs: any = { prompt };

    // NOTE: The HF Inference API parameters vary by model.
    // For Image-to-Video, we usually pass the image.
    // However, LTX-Video often takes text.
    // Let's try "stabilityai/stable-video-diffusion-img2vid-xt-1-1" which is strictly Img2Vid.

    if (imageUrl) {
        model = "stabilityai/stable-video-diffusion-img2vid-xt-1-1";
        // This model expects the input to be the image file.
        // We might need to fetch the image first if it's a URL, or pass base64.
        // If imageUrl is a data URL, we can parse it.

        // However, HF Inference API for SVD usually takes the binary image in the body.
        // But if we have 'inputs' JSON, it might not work standardly.
        // Let's try sending the image binary directly.
    }

    // Since strictly adhering to "from image generate video", if we have an imageUrl (which is a Data URL from our previous step),
    // we should use that.

    let response;

    if (imageUrl) {
         // Convert Data URL to Blob/Buffer
         const base64Data = imageUrl.split(',')[1];
         const buffer = Buffer.from(base64Data, 'base64');

         response = await fetch(
            `https://api-inference.huggingface.co/models/${model}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
                    "Content-Type": "application/json", // Some endpoints want binary, some want JSON
                    // "Content-Type": "application/octet-stream" // SVD often takes image directly
                },
                method: "POST",
                body: buffer, // Sending binary image
            }
        );
    } else {
        // Fallback to Text-to-Video if no image (though UI logic should prevent this if we enforce flow)
        // Or if we just use a T2V model
        model = "Lightricks/LTX-Video";
        response = await fetch(
            `https://api-inference.huggingface.co/models/${model}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({ inputs: prompt }),
            }
        );
    }

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Hugging Face Video API Error:", errorText);
        throw new Error(`HF API error: ${response.statusText} - ${errorText}`);
    }

    // HF Video API usually returns binary (mp4) or JSON with url depending on the model/deployment.
    // SVD on Inference API often returns the video binary.
    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
        const data = await response.json();
        // Sometimes it returns { error: ... } even with 200 ok if queued? No, usually not 200.
        // Check for URL
        return new Response(JSON.stringify(data), { status: 200 });
    } else {
        // Binary response (video/mp4 or similar)
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const base64 = buffer.toString('base64');
        const mimeType = contentType || 'video/mp4';
        const dataUrl = `data:${mimeType};base64,${base64}`;

        return new Response(JSON.stringify({ url: dataUrl }), { status: 200 });
    }

  } catch (error) {
    console.error('Error generating video:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate video. Please try again or create an image first.' }), {
      status: 500,
    });
  }
}
