'use server';

import { rewriteContentInStyle } from '@/ai/flows/rewrite-content-styles';
import { z } from 'zod';

const FormSchema = z.object({
  content: z.string(),
  style: z.enum([
      'aggressive',
      'calm',
      'emotional',
      'storytelling',
      'authoritative',
    ]),
});

type FormValues = z.infer<typeof FormSchema>;

export async function getRewrittenContentAction(values: FormValues) {
    try {
        const result = await rewriteContentInStyle(values);
        return { data: result.rewrittenContent, error: null };
    } catch(e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
        return { data: null, error: `Failed to rewrite content: ${errorMessage}` };
    }
}
