'use server';

import { generateCallToActions } from '@/ai/flows/generate-call-to-actions';
import { z } from 'zod';

const FormSchema = z.object({
  reelContent: z.string(),
});

type FormValues = z.infer<typeof FormSchema>;

export async function getCallToActionsAction(values: FormValues) {
    try {
        const result = await generateCallToActions(values);
        return { data: result.callToActions, error: null };
    } catch(e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
        return { data: null, error: `Failed to generate calls to action: ${errorMessage}` };
    }
}
