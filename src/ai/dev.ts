import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-community-posts.ts';
import '@/ai/flows/generate-decision-justification.ts';
import '@/ai/flows/generate-decision-titles.ts';
import '@/ai/flows/generate-decision-recommendation.ts';
