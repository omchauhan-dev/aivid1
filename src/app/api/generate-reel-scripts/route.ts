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
  script: z.string().describe('The generated reel script.'),
});

export async function POST(req: Request) {
  try {
    const context = await req.json();
    const { subjectMatter, reelLength, language } = GenerateReelScriptInputSchema.parse(context);

    const result = await streamObject({
      model: model,
      schema: GenerateReelScriptOutputSchema,
      prompt: `Subject: ${subjectMatter}\nLength: ${reelLength}\nLanguage: ${language}\n\nGenerate a detailed reel script with heavy voiceover and distinct visual scenes. Focus on real, actionable content. Format it with 'SCENE' and 'VOICEOVER' sections.`,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Error generating reel script:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate script.' }), {
      status: 500,
    });
  }
}
