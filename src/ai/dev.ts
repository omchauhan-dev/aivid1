import { config } from 'dotenv';
config();

import '@/ai/flows/rewrite-content-styles.ts';
import '@/ai/flows/generate-captions-hashtags.ts';
import '@/ai/flows/generate-reel-scripts.ts';
import '@/ai/flows/generate-call-to-actions.ts';
import '@/ai/flows/generate-viral-hooks.ts';