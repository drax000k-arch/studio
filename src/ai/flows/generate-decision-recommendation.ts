'use server';

/**
 * @fileOverview Recommends an option based on user context.
 *
 * - generateDecisionRecommendation - A function that generates a decision recommendation.
 * - GenerateDecisionRecommendationInput - The input type for the generateDecisionRecommendation function.
 * - GenerateDecisionRecommendationOutput - The return type for the generateDecisionRecommendation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateDecisionRecommendationInputSchema = z.object({
  subject: z.string().describe('The subject of the decision.'),
  options: z.array(z.string()).describe('The options to consider.'),
  userContext: z.string().describe('The personal context of the user making the decision.'),
});
export type GenerateDecisionRecommendationInput = z.infer<typeof GenerateDecisionRecommendationInputSchema>;

const GenerateDecisionRecommendationOutputSchema = z.object({
  recommendation: z.string().describe('The AI recommended option from the provided list.'),
});
export type GenerateDecisionRecommendationOutput = z.infer<typeof GenerateDecisionRecommendationOutputSchema>;

export async function generateDecisionRecommendation(
  input: GenerateDecisionRecommendationInput
): Promise<GenerateDecisionRecommendationOutput> {
  return generateDecisionRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDecisionRecommendationPrompt',
  input: { schema: GenerateDecisionRecommendationInputSchema },
  output: { schema: GenerateDecisionRecommendationOutputSchema },
  prompt: `You are an expert AI assistant that helps users make the best possible decision by analyzing their personal context.

  Decision Subject: {{{subject}}}
  Available Options:
  {{#each options}}
  - {{{this}}}
  {{/each}}

  User's Personal Context: {{{userContext}}}

  Analyze the user's context and the available options carefully. Choose the single best option from the list that aligns with the user's situation and goals.

  Your response MUST be one of the exact strings from the 'Available Options' list and nothing else. For example, if the options are ["Go to the movies", "Read a book"], your output must be either "Go to the movies" or "Read a book".
  `,
});

const generateDecisionRecommendationFlow = ai.defineFlow(
  {
    name: 'generateDecisionRecommendationFlow',
    inputSchema: GenerateDecisionRecommendationInputSchema,
    outputSchema: GenerateDecisionRecommendationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
