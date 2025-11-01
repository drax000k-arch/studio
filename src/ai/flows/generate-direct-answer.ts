'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a direct answer to a user's question.
 *
 * - generateDirectAnswer - A function that provides a direct, conversational answer.
 * - GenerateDirectAnswerInput - The input type for the generateDirectAnswer function.
 * - GenerateDirectAnswerOutput - The output type for the generateDirectAnswer function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateDirectAnswerInputSchema = z.object({
  question: z.string().describe('The direct question the user is asking.'),
  userContext: z.string().optional().describe('Any personal context the user has provided.'),
});
export type GenerateDirectAnswerInput = z.infer<typeof GenerateDirectAnswerInputSchema>;

const GenerateDirectAnswerOutputSchema = z.object({
  answer: z.string().describe('A direct, helpful answer to the user\'s question.'),
});
export type GenerateDirectAnswerOutput = z.infer<typeof GenerateDirectAnswerOutputSchema>;

export async function generateDirectAnswer(
  input: GenerateDirectAnswerInput
): Promise<GenerateDirectAnswerOutput> {
  return generateDirectAnswerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDirectAnswerPrompt',
  input: { schema: GenerateDirectAnswerInputSchema },
  output: { schema: GenerateDirectAnswerOutputSchema },
  system:
    "You are a helpful AI assistant. Your task is to answer the user's question directly and conversationally. Do not try to frame it as a 'decision'. Just provide a clear, helpful response.",
  prompt: `The user has asked the following question: "{{question}}"
  
  Their personal context is: "{{userContext}}"
  
  Provide a direct and helpful answer.`,
});

const generateDirectAnswerFlow = ai.defineFlow(
  {
    name: 'generateDirectAnswerFlow',
    inputSchema: GenerateDirectAnswerInputSchema,
    outputSchema: GenerateDirectAnswerOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
