'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating viral hooks for reels.
 *
 * It includes:
 * - `generateViralHooks`: A function to generate attention-grabbing hooks for reels.
 * - `GenerateViralHooksInput`: The input type for the `generateViralHooks` function.
 * - `GenerateViralHooksOutput`: The output type for the `generateViralHooks` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateViralHooksInputSchema = z.object({
  topic: z.string().describe('The topic of the reel.'),
});
export type GenerateViralHooksInput = z.infer<typeof GenerateViralHooksInputSchema>;

const GenerateViralHooksOutputSchema = z.object({
  hooks: z.array(z.string()).describe('An array of attention-grabbing hooks for the reel.'),
});
export type GenerateViralHooksOutput = z.infer<typeof GenerateViralHooksOutputSchema>;

export async function generateViralHooks(input: GenerateViralHooksInput): Promise<GenerateViralHooksOutput> {
  return generateViralHooksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateViralHooksPrompt',
  input: {schema: GenerateViralHooksInputSchema},
  output: {schema: GenerateViralHooksOutputSchema},
  prompt: `You are an expert in creating viral content for social media. Your goal is to generate attention-grabbing hooks for reels based on a given topic.

  Topic: {{{topic}}}

  Generate 5 different hooks that are likely to go viral. Return the hooks as a JSON array of strings.
  `,
});

const generateViralHooksFlow = ai.defineFlow(
  {
    name: 'generateViralHooksFlow',
    inputSchema: GenerateViralHooksInputSchema,
    outputSchema: GenerateViralHooksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
