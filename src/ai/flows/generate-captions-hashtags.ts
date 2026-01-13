'use server';

/**
 * @fileOverview Generates emotion-based captions and trending hashtags for reels.
 *
 * - generateCaptionsAndHashtags - A function that generates captions and hashtags.
 * - GenerateCaptionsAndHashtagsInput - The input type for the generateCaptionsAndHashtags function.
 * - GenerateCaptionsAndHashtagsOutput - The return type for the generateCaptionsAndHashtags function.
 */

import { openrouter } from '@/ai/openrouter';
import { z } from 'zod';

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
  const prompt = `Theme/Message: ${input.themeOrMessage}

Generate 3 emotion-based captions and 5 trending hashtags.
Return JSON:
{
  "captions": ["caption1", ...],
  "hashtags": ["#tag1", ...]
}`;

  const completion = await openrouter.chat.completions.create({
    model: "google/gemini-2.0-flash-001",
    messages: [
      { role: "system", content: "You are a social media expert. Output JSON only." },
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
    return GenerateCaptionsAndHashtagsOutputSchema.parse(result);
  } catch (error) {
    console.error("Failed to parse captions/hashtags output:", content, error);
    throw new Error("Failed to parse generated content.");
  }
}
