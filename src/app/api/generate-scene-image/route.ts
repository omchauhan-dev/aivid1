import { createOpenAI } from '@ai-sdk/openai';
import { generateImage } from 'ai';

export const maxDuration = 60;

// Configure OpenRouter client for image generation
// Note: Not all OpenRouter models support the standard image generation interface
// If this fails, we might need a direct fetch implementation.
// However, trying with a compatible model first.
const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!process.env.OPENROUTER_API_KEY) {
      return new Response(JSON.stringify({ error: 'Missing API Key' }), { status: 500 });
    }

    // Direct fetch to OpenRouter Chat Completions API with an image model
    // This is often how "image generation" is done on OpenRouter for models like Flux
    // The response usually contains a markdown image link
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "black-forest-labs/flux-1-schnell",
        messages: [
          {
            role: "user",
            content: `Generate an image based on this description: ${prompt}`
          }
        ]
      })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenRouter Image API Error:", errorText);
        throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    // Extract URL from markdown format ![image](url) or just get the URL if plain
    // Flux on OpenRouter often returns a hosted URL in the content
    // Regex to find http/https url ending in png/jpg/webp or just a url
    const urlMatch = content.match(/https?:\/\/[^\s\)]+/);

    if (urlMatch) {
        return new Response(JSON.stringify({ url: urlMatch[0] }), { status: 200 });
    } else {
        console.error("No URL found in response:", content);
         return new Response(JSON.stringify({ error: 'Failed to parse image URL' }), { status: 500 });
    }

  } catch (error) {
    console.error('Error generating image:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate image.' }), {
      status: 500,
    });
  }
}
