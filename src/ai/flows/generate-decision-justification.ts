'use server';

/**
 * @fileOverview Generates a justification for the AI's recommended decision.
 *
 * - generateDecisionJustification - A function that generates the decision justification.
 * - GenerateDecisionJustificationInput - The input type for the generateDecisionJustification function.
 * - GenerateDecisionJustificationOutput - The return type for the generateDecisionJustification function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDecisionJustificationInputSchema = z.object({
  subject: z.string().describe('The subject of the decision.'),
  options: z.array(z.string()).describe('The options to consider.'),
  aiRecommendation: z.string().describe('The AI recommended option.'),
  responseLength: z.enum(['short', 'long']).describe('The desired length of the justification.'),
});
export type GenerateDecisionJustificationInput = z.infer<
  typeof GenerateDecisionJustificationInputSchema
>;

const GenerateDecisionJustificationOutputSchema = z.object({
  justification: z.string().describe('The AI justification for the recommended option.'),
});
export type GenerateDecisionJustificationOutput = z.infer<
  typeof GenerateDecisionJustificationOutputSchema
>;

export async function generateDecisionJustification(
  input: GenerateDecisionJustificationInput
): Promise<GenerateDecisionJustificationOutput> {
  return generateDecisionJustificationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDecisionJustificationPrompt',
  input: {schema: GenerateDecisionJustificationInputSchema},
  output: {schema: GenerateDecisionJustificationOutputSchema},
  prompt: `You are an AI assistant that provides justifications for your recommended decisions.

  Subject: {{{subject}}}
  Options: {{#each options}}{{{this}}}, {{/each}}
  AI Recommendation: {{{aiRecommendation}}}

  Provide a clear and {{#if (eq responseLength "short")}}concise{{else}}detailed{{/if}} justification for the AI's recommended option, explaining the reasoning and factors considered. Focus on logical reasoning, budget considerations, and any other relevant parameters.
  `,
});

const generateDecisionJustificationFlow = ai.defineFlow(
  {
    name: 'generateDecisionJustificationFlow',
    inputSchema: GenerateDecisionJustificationInputSchema,
    outputSchema: GenerateDecisionJustificationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
