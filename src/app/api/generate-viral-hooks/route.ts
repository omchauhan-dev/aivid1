import { streamObject } from 'ai';
import { z } from 'zod';
import { model } from '@/ai/model';

export const maxDuration = 60;

const GenerateViralHooksInputSchema = z.object({
  topic: z.string(),
});

const GenerateViralHooksOutputSchema = z.object({
  hooks: z.array(z.string()).describe('An array of attention-grabbing hooks for the reel.'),
});

export async function POST(req: Request) {
  try {
    const context = await req.json();
    const { topic } = GenerateViralHooksInputSchema.parse(context);

    const result = await streamObject({
      model: model,
      schema: GenerateViralHooksOutputSchema,
      prompt: `Topic: ${topic}\n\nGenerate 5 viral hooks.`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Error generating viral hooks:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate hooks' }), {
      status: 500,
    });
  }
}
