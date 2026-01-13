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
  const prompt = `You are an expert in creating viral content for social media. Your goal is to generate attention-grabbing hooks for reels based on a given topic.

Topic: ${input.topic}

Generate 5 different hooks that are likely to go viral.
Return the result as a valid JSON object matching this structure:
{
  "hooks": ["hook1", "hook2", ...]
}`;

  const completion = await openrouter.chat.completions.create({
    model: "openai/gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a helpful assistant that outputs JSON." },
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
