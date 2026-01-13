'use server';

/**
 * @fileOverview Generates compelling calls to action for reels.
 *
 * - generateCallToActions - A function that generates calls to action.
 * - GenerateCallToActionsInput - The input type for the generateCallToActions function.
 * - GenerateCallToActionsOutput - The return type for the generateCallToActions function.
 */

import { openrouter } from '@/ai/openrouter';
import { z } from 'zod';

const GenerateCallToActionsInputSchema = z.object({
  reelContent: z.string().describe('The content of the reel.'),
});
export type GenerateCallToActionsInput = z.infer<typeof GenerateCallToActionsInputSchema>;

const GenerateCallToActionsOutputSchema = z.object({
  callToActions: z.array(z.string()).describe('An array of compelling calls to action.'),
});
export type GenerateCallToActionsOutput = z.infer<typeof GenerateCallToActionsOutputSchema>;

export async function generateCallToActions(
  input: GenerateCallToActionsInput
): Promise<GenerateCallToActionsOutput> {
  const prompt = `You are an expert in creating engaging content for social media reels. Based on the reel content provided, generate a list of compelling calls to action to encourage viewers to interact with the reel.

Reel Content: ${input.reelContent}

Generate at least 5 calls to action.
Return the result as a valid JSON object matching this structure:
{
  "callToActions": ["cta1", "cta2", ...]
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
    return GenerateCallToActionsOutputSchema.parse(result);
  } catch (error) {
    console.error("Failed to parse CTA output:", content, error);
    throw new Error("Failed to parse generated calls to action.");
  }
}
