'use server';

import { generateCaptionsAndHashtags } from '@/ai/flows/generate-captions-hashtags';
import { z } from 'zod';

const FormSchema = z.object({
  themeOrMessage: z.string(),
});

type FormValues = z.infer<typeof FormSchema>;

export async function getCaptionsAndHashtagsAction(values: FormValues) {
    try {
        const result = await generateCaptionsAndHashtags(values);
        return { data: result, error: null };
    } catch(e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
        return { data: null, error: `Failed to generate content: ${errorMessage}` };
    }
}
