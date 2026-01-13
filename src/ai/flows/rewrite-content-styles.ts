'use server';

/**
 * @fileOverview AI agent to rewrite content in different styles.
 *
 * - rewriteContentInStyle - A function that rewrites content in a specified style.
 * - RewriteContentInStyleInput - The input type for the rewriteContentInStyle function.
 * - RewriteContentInStyleOutput - The return type for the rewriteContentInStyle function.
 */

import { openrouter } from '@/ai/openrouter';
import { z } from 'zod';

const RewriteContentInStyleInputSchema = z.object({
  content: z.string().describe('The content to be rewritten.'),
  style: z
    .enum([
      'aggressive',
      'calm',
      'emotional',
      'storytelling',
      'authoritative',
    ])
    .describe('The style to rewrite the content in.'),
});
export type RewriteContentInStyleInput = z.infer<
  typeof RewriteContentInStyleInputSchema
>;

const RewriteContentInStyleOutputSchema = z.object({
  rewrittenContent: z
    .string()
    .describe('The content rewritten in the specified style.'),
});
export type RewriteContentInStyleOutput = z.infer<
  typeof RewriteContentInStyleOutputSchema
>;

export async function rewriteContentInStyle(
  input: RewriteContentInStyleInput
): Promise<RewriteContentInStyleOutput> {
  const prompt = `Rewrite in ${input.style} style:

${input.content}

Return JSON:
{
  "rewrittenContent": "The rewritten text..."
}`;

  const completion = await openrouter.chat.completions.create({
    model: "google/gemini-2.0-flash-001",
    messages: [
      { role: "system", content: "You are an expert editor. Output JSON only." },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" }
  });

  const content = completion.choices[0].message.content;
  if (!content) {
    throw new Error("No content generated");
  }

  try {
    const cleanedContent = content.replace(/```json\n?|```/g, '').trim();
    const result = JSON.parse(cleanedContent);
    return RewriteContentInStyleOutputSchema.parse(result);
  } catch (error) {
    console.error("Failed to parse rewrite output:", content, error);
    throw new Error("Failed to parse generated content.");
  }
}
