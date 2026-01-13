'use server';

/**
 * @fileOverview A reel script generation AI agent.
 *
 * - generateReelScript - A function that handles the reel script generation process.
 * - GenerateReelScriptInput - The input type for the generateReelScript function.
 * - GenerateReelScriptOutput - The return type for the generateReelScript function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
  return generateReelScriptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReelScriptPrompt',
  input: {schema: GenerateReelScriptInputSchema},
  output: {schema: GenerateReelScriptOutputSchema},
  prompt: `You are a creative reel script writer. Generate a script for a reel based on the provided subject matter, reel length, and language.\n\nSubject Matter: {{{subjectMatter}}}\nReel Length: {{{reelLength}}}\nLanguage: {{{language}}}\n\nScript:`,
});

const generateReelScriptFlow = ai.defineFlow(
  {
    name: 'generateReelScriptFlow',
    inputSchema: GenerateReelScriptInputSchema,
    outputSchema: GenerateReelScriptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
