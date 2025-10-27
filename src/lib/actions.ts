'use server';

import { generateDecisionJustification } from '@/ai/flows/generate-decision-justification';
import { z } from 'zod';
import type { DecisionResult } from '@/lib/types';

export type ActionState = {
  status: 'success' | 'error' | 'idle';
  result?: DecisionResult;
  message?: string;
};

const decisionFormSchema = z.object({
  subject: z.string().min(3, { message: 'Subject must be at least 3 characters long.' }),
  options: z.array(z.object({ value: z.string().min(1, { message: 'Option cannot be empty.' }) }))
    .min(2, { message: 'Please provide at least two options.' }),
});

export async function getAiDecision(data: { subject: string; options: {value: string}[] }): Promise<ActionState> {
  const validation = decisionFormSchema.safeParse(data);

  if (!validation.success) {
    return {
      status: 'error',
      message: validation.error.errors.map(e => e.message).join(', '),
    };
  }

  const { subject, options } = validation.data;
  const optionValues = options.map(o => o.value);

  try {
    // The AI flow `generateDecisionJustification` requires a recommendation to be passed in.
    // As there is no flow to *make* the decision, we'll simulate the AI's choice
    // by randomly picking one of the user's options.
    const aiRecommendation = optionValues[Math.floor(Math.random() * optionValues.length)];

    const justificationResult = await generateDecisionJustification({
      subject,
      options: optionValues,
      aiRecommendation,
    });
    
    if (!justificationResult.justification) {
        throw new Error("Failed to generate justification.")
    }

    return {
      status: 'success',
      result: {
        recommendation: aiRecommendation,
        justification: justificationResult.justification,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      status: 'error',
      message: 'An unexpected error occurred while making a decision. Please try again.',
    };
  }
}
