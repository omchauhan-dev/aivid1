'use server';

/**
 * @fileOverview Generates emotion-based captions and trending hashtags for reels.
 *
 * - generateCaptionsAndHashtags - A function that generates captions and hashtags.
 * - GenerateCaptionsAndHashtagsInput - The input type for the generateCaptionsAndHashtags function.
 * - GenerateCaptionsAndHashtagsOutput - The return type for the generateCaptionsAndHashtags function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCaptionsAndHashtagsInputSchema = z.object({
  themeOrMessage: z
    .string()
    .describe('The theme or message of the reel.'),
});
export type GenerateCaptionsAndHashtagsInput = z.infer<typeof GenerateCaptionsAndHashtagsInputSchema>;

const GenerateCaptionsAndHashtagsOutputSchema = z.object({
  captions: z
    .array(z.string())
    .describe('Emotion-based captions for the reel.'),
  hashtags: z
    .array(z.string())
    .describe('Trending hashtags related to the reel.'),
});
export type GenerateCaptionsAndHashtagsOutput = z.infer<typeof GenerateCaptionsAndHashtagsOutputSchema>;

export async function generateCaptionsAndHashtags(
  input: GenerateCaptionsAndHashtagsInput
): Promise<GenerateCaptionsAndHashtagsOutput> {
  return generateCaptionsAndHashtagsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCaptionsAndHashtagsPrompt',
  input: {schema: GenerateCaptionsAndHashtagsInputSchema},
  output: {schema: GenerateCaptionsAndHashtagsOutputSchema},
  prompt: `You are an expert social media manager. You are generating captions and hashtags for a reel based on the theme or message provided by the user.

  Theme/Message: {{{themeOrMessage}}}

  Generate 3 emotion-based captions and 5 trending hashtags related to the reel.
  `,
});

const generateCaptionsAndHashtagsFlow = ai.defineFlow(
  {
    name: 'generateCaptionsAndHashtagsFlow',
    inputSchema: GenerateCaptionsAndHashtagsInputSchema,
    outputSchema: GenerateCaptionsAndHashtagsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
