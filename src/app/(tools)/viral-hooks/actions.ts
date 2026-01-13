'use server';

import { generateViralHooks } from '@/ai/flows/generate-viral-hooks';
import { z } from 'zod';

const FormSchema = z.object({
  topic: z.string(),
});

type FormValues = z.infer<typeof FormSchema>;

export async function getViralHooksAction(values: FormValues) {
    try {
        const result = await generateViralHooks(values);
        return { data: result.hooks, error: null };
    } catch(e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
        return { data: null, error: `Failed to generate hooks: ${errorMessage}` };
    }
}
