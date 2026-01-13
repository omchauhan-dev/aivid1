'use server';

/**
 * @fileOverview A reel script generation AI agent.
 *
 * - generateReelScript - A function that handles the reel script generation process.
 * - GenerateReelScriptInput - The input type for the generateReelScript function.
 * - GenerateReelScriptOutput - The return type for the generateReelScript function.
 */

import { openrouter } from '@/ai/openrouter';
import { z } from 'zod';

const GenerateReelScriptInputSchema = z.object({
  subjectMatter: z.string().describe('The subject matter of the reel.'),
  reelLength: z.enum(['15s', '30s', '60s']).describe('The length of the reel (15s, 30s, or 60s).'),
  language: z.enum(['Hinglish', 'Hindi', 'English']).describe('The language of the reel script.'),
});
export type GenerateReelScriptInput = z.infer<typeof GenerateReelScriptInputSchema>;

const GenerateReelScriptOutputSchema = z.object({
  script: z.string().describe('The generated reel script.'),
});
export type GenerateReelScriptOutput = z.infer<typeof GenerateReelScriptOutputSchema>;

export async function generateReelScript(input: GenerateReelScriptInput): Promise<GenerateReelScriptOutput> {
  const prompt = `You are a creative reel script writer. Generate a script for a reel based on the provided subject matter, reel length, and language.

Subject Matter: ${input.subjectMatter}
Reel Length: ${input.reelLength}
Language: ${input.language}

Return the result as a valid JSON object matching this structure:
{
  "script": "The full script text..."
}`;

  const completion = await openrouter.chat.completions.create({
    model: "google/gemini-flash-1.5",
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
    return GenerateReelScriptOutputSchema.parse(result);
  } catch (error) {
    console.error("Failed to parse reel script output:", content, error);
    throw new Error("Failed to parse generated script.");
  }
}
