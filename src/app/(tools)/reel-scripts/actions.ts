'use server';

import { generateReelScript } from '@/ai/flows/generate-reel-scripts';
import { z } from 'zod';

const FormSchema = z.object({
  subjectMatter: z.string(),
  reelLength: z.enum(['15s', '30s', '60s']),
  language: z.enum(['Hinglish', 'Hindi', 'English']),
});

type FormValues = z.infer<typeof FormSchema>;

export async function getReelScriptAction(values: FormValues) {
    try {
        const result = await generateReelScript(values);
        return { data: result.script, error: null };
    } catch(e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
        return { data: null, error: `Failed to generate script: ${errorMessage}` };
    }
}
