'use server';

/**
 * @fileOverview Generates potential options for a given decision-making scenario.
 *
 * - generateDecisionOptions - A function that generates a list of options.
 * - GenerateDecisionOptionsInput - The input type for the generateDecisionOptions function.
 * - GenerateDecisionOptionsOutput - The return type for the generateDecisionOptions function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateDecisionOptionsInputSchema = z.object({
  subject: z.string().describe('The decision or question the user is facing.'),
  userContext: z.string().optional().describe('Any personal context the user has provided.'),
});
export type GenerateDecisionOptionsInput = z.infer<typeof GenerateDecisionOptionsInputSchema>;

const GenerateDecisionOptionsOutputSchema = z.object({
  options: z.array(z.string()).describe('An array of 3-4 distinct and actionable options.'),
});
export type GenerateDecisionOptionsOutput = z.infer<typeof GenerateDecisionOptionsOutputSchema>;

export async function generateDecisionOptions(
  input: GenerateDecisionOptionsInput
): Promise<GenerateDecisionOptionsOutput> {
  return generateDecisionOptionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDecisionOptionsPrompt',
  input: { schema: GenerateDecisionOptionsInputSchema },
  output: { schema: GenerateDecisionOptionsOutputSchema },
  system:
    'You are an expert advisor. Your task is to brainstorm a list of 3-4 distinct, actionable, and diverse options for a user facing a decision. The options should be concise.',
  prompt: `The user needs help with the following decision: "{{subject}}".
  Their personal context is: "{{userContext}}"
  
  Generate a list of 3-4 potential options for them to consider.`,
});

const generateDecisionOptionsFlow = ai.defineFlow(
  {
    name: 'generateDecisionOptionsFlow',
    inputSchema: GenerateDecisionOptionsInputSchema,
    outputSchema: GenerateDecisionOptionsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
