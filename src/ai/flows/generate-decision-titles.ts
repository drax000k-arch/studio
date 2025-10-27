'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating decision titles.
 *
 * - generateDecisionTitles -  A function that generates titles for a decision based on a description.
 * - GenerateDecisionTitlesInput - The input type for the generateDecisionTitles function.
 * - GenerateDecisionTitlesOutput - The output type for the generateDecisionTitles function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDecisionTitlesInputSchema = z.object({
  description: z.string().describe('The description of the decision to be made.'),
});
export type GenerateDecisionTitlesInput = z.infer<typeof GenerateDecisionTitlesInputSchema>;

const GenerateDecisionTitlesOutputSchema = z.object({
  titles: z.array(z.string()).describe('An array of suggested titles for the decision.'),
});
export type GenerateDecisionTitlesOutput = z.infer<typeof GenerateDecisionTitlesOutputSchema>;

export async function generateDecisionTitles(input: GenerateDecisionTitlesInput): Promise<GenerateDecisionTitlesOutput> {
  return generateDecisionTitlesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDecisionTitlesPrompt',
  input: {schema: GenerateDecisionTitlesInputSchema},
  output: {schema: GenerateDecisionTitlesOutputSchema},
  prompt: `You are an AI assistant that suggests titles for decisions based on their description.\n\n  Suggest 5 titles for the following decision description:\n  {{description}}\n\n  Your output should be a JSON array of strings.`,
});

const generateDecisionTitlesFlow = ai.defineFlow(
  {
    name: 'generateDecisionTitlesFlow',
    inputSchema: GenerateDecisionTitlesInputSchema,
    outputSchema: GenerateDecisionTitlesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
