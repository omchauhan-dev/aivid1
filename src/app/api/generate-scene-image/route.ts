import { NextResponse } from 'next/server';

// 1. FIX: Updated URL from "api-inference" to "router"
const MODEL_ID = "stabilityai/stable-diffusion-xl-base-1.0";
const API_URL = `https://router.huggingface.co/hf-inference/models/${MODEL_ID}`;

export async function POST(req: Request) {
  try {
    if (!process.env.HUGGING_FACE_API_KEY) {
      return NextResponse.json({ error: 'Missing HUGGING_FACE_TOKEN in .env.local' }, { status: 500 });
    }

    const body = await req.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'No prompt provided' }, { status: 400 });
    }

    console.log(`[HF] Generating image for: "${prompt.substring(0, 30)}..."`);

    const response = await fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ inputs: prompt }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[HF] API Error:", errorText);
      return NextResponse.json(
        { error: `Hugging Face Error: ${response.status} - ${errorText}` }, 
        { status: response.status }
      );
    }

    // Handle "Model is loading" edge case
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        const json = await response.json();
        if (json.error && json.error.includes("loading")) {
            return NextResponse.json({ error: "Model is warming up, please try again in 30 seconds." }, { status: 503 });
        }
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64Image}`;

    return NextResponse.json({ url: dataUrl });

  } catch (error: any) {
    console.error("[HF] Server Crash:", error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
