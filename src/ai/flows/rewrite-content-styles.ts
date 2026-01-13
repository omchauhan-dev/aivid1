'use server';

/**
 * @fileOverview AI agent to rewrite content in different styles.
 *
 * - rewriteContentInStyle - A function that rewrites content in a specified style.
 * - RewriteContentInStyleInput - The input type for the rewriteContentInStyle function.
 * - RewriteContentInStyleOutput - The return type for the rewriteContentInStyle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
  return rewriteContentInStyleFlow(input);
}

const rewriteContentInStylePrompt = ai.definePrompt({
  name: 'rewriteContentInStylePrompt',
  input: {schema: RewriteContentInStyleInputSchema},
  output: {schema: RewriteContentInStyleOutputSchema},
  prompt: `Rewrite the following content in a {{{style}}} style:\n\n{{{content}}}`,
});

const rewriteContentInStyleFlow = ai.defineFlow(
  {
    name: 'rewriteContentInStyleFlow',
    inputSchema: RewriteContentInStyleInputSchema,
    outputSchema: RewriteContentInStyleOutputSchema,
  },
  async input => {
    const {output} = await rewriteContentInStylePrompt(input);
    return output!;
  }
);
