import { streamObject } from 'ai';
import { z } from 'zod';
import { model } from '@/ai/model';

export const maxDuration = 60;

const GenerateReelScriptInputSchema = z.object({
  subjectMatter: z.string(),
  reelLength: z.enum(['15s', '30s', '60s']),
  language: z.enum(['Hinglish', 'Hindi', 'English']),
});

const GenerateReelScriptOutputSchema = z.object({
  scenes: z.array(z.object({
    visual: z.string().describe('Detailed description of the visual scene.'),
    voiceover: z.string().describe('The voiceover script for this scene.')
  })).describe('A list of scenes making up the reel.'),
});

export async function POST(req: Request) {
  try {
    const context = await req.json();
    const { subjectMatter, reelLength, language } = GenerateReelScriptInputSchema.parse(context);

    const result = await streamObject({
      model: model,
      schema: GenerateReelScriptOutputSchema,
      prompt: `Subject: ${subjectMatter}\nLength: ${reelLength}\nLanguage: ${language}\n\nGenerate a creative reel script structured as a series of scenes. For each scene, provide a detailed 'visual' description (suitable for image generation) and a 'voiceover' script. The content should be actionable and engaging.`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Error generating reel script:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate script.' }), {
      status: 500,
    });
  }
}
