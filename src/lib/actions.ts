'use server';

import { generateDecisionJustification } from '@/ai/flows/generate-decision-justification';
import { generateDecisionRecommendation } from '@/ai/flows/generate-decision-recommendation';
import { z } from 'zod';
import type { DecisionResult } from '@/lib/types';
import { getFirestore, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

export type ActionState = {
  status: 'success' | 'error' | 'idle';
  result?: DecisionResult;
  message?: string;
};

const decisionFormSchema = z.object({
  subject: z.string().min(3, { message: 'Subject must be at least 3 characters long.' }),
  options: z.array(z.string().min(1, { message: 'Option cannot be empty.' }))
    .min(2, { message: 'Please provide at least two options.' }),
  userContext: z.string().optional(),
  responseLength: z.enum(['short', 'long']),
  userId: z.string().optional(),
});

export async function getAiDecision(
  data: z.infer<typeof decisionFormSchema>
): Promise<ActionState> {
  const validation = decisionFormSchema.safeParse(data);

  if (!validation.success) {
    return {
      status: 'error',
      message: validation.error.errors.map(e => e.message).join(', '),
    };
  }

  const { subject, options, userContext, responseLength, userId } = validation.data;

  try {
    const recommendationResult = await generateDecisionRecommendation({
      subject,
      options: options,
      userContext: userContext ?? 'No personal context provided.',
    });

    if (!recommendationResult.recommendation) {
      throw new Error("Failed to generate a recommendation.");
    }
    
    const aiRecommendation = recommendationResult.recommendation;
    
    const justificationResult = await generateDecisionJustification({
      subject,
      options: options,
      aiRecommendation,
      responseLength,
    });
    
    if (!justificationResult.justification) {
        throw new Error("Failed to generate justification.")
    }

    const decisionResult = {
      recommendation: aiRecommendation,
      justification: justificationResult.justification,
    };

    if (userId) {
      const { firestore } = initializeFirebase();
      const decisionsCollection = collection(firestore, 'users', userId, 'decisions');
      await addDoc(decisionsCollection, {
        subject,
        options,
        userContext,
        ...decisionResult,
        createdAt: serverTimestamp(),
      });
    }

    return {
      status: 'success',
      result: decisionResult,
    };
  } catch (error) {
    console.error(error);
    return {
      status: 'error',
      message: 'An unexpected error occurred while making a decision. Please try again.',
    };
  }
}
