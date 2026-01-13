'use server';

/**
 * @fileOverview This file defines a flow for generating viral hooks for reels.
 *
 * It includes:
 * - `generateViralHooks`: A function to generate attention-grabbing hooks for reels.
 * - `GenerateViralHooksInput`: The input type for the `generateViralHooks` function.
 * - `GenerateViralHooksOutput`: The output type for the `generateViralHooks` function.
 */

import { openrouter } from '@/ai/openrouter';
import { z } from 'zod';

const GenerateViralHooksInputSchema = z.object({
  topic: z.string().describe('The topic of the reel.'),
});
export type GenerateViralHooksInput = z.infer<typeof GenerateViralHooksInputSchema>;

const GenerateViralHooksOutputSchema = z.object({
  hooks: z.array(z.string()).describe('An array of attention-grabbing hooks for the reel.'),
});
export type GenerateViralHooksOutput = z.infer<typeof GenerateViralHooksOutputSchema>;

export async function generateViralHooks(input: GenerateViralHooksInput): Promise<GenerateViralHooksOutput> {
  const prompt = `Topic: ${input.topic}

Generate 5 viral hooks.
Return JSON:
{
  "hooks": ["hook1", "hook2", ...]
}`;

  const completion = await openrouter.chat.completions.create({
    model: "openai/gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a viral content expert. Output JSON only." },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" }
  });

  const content = completion.choices[0].message.content;
  if (!content) {
    throw new Error("No content generated");
  }

  try {
    const result = JSON.parse(content);
    return GenerateViralHooksOutputSchema.parse(result);
  } catch (error) {
    console.error("Failed to parse viral hooks output:", content, error);
    throw new Error("Failed to parse generated hooks.");
  }
}
