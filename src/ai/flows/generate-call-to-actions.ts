'use server';

/**
 * @fileOverview Generates compelling calls to action for reels.
 *
 * - generateCallToActions - A function that generates calls to action.
 * - GenerateCallToActionsInput - The input type for the generateCallToActions function.
 * - GenerateCallToActionsOutput - The return type for the generateCallToActions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
  return generateCallToActionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCallToActionsPrompt',
  input: {schema: GenerateCallToActionsInputSchema},
  output: {schema: GenerateCallToActionsOutputSchema},
  prompt: `You are an expert in creating engaging content for social media reels. Based on the reel content provided, generate a list of compelling calls to action to encourage viewers to interact with the reel.

Reel Content: {{{reelContent}}}

Calls to Action:`,
});

const generateCallToActionsFlow = ai.defineFlow(
  {
    name: 'generateCallToActionsFlow',
    inputSchema: GenerateCallToActionsInputSchema,
    outputSchema: GenerateCallToActionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
