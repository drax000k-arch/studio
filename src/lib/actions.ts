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

    if (!recommendationResult.recommendation || !options.includes(recommendationResult.recommendation)) {
      console.error("AI recommendation was invalid:", recommendationResult.recommendation);
      // Even if the recommendation is invalid, we can try to ask for justification on the first option as a fallback.
      // A better solution would be to retry the recommendation.
      const fallbackRecommendation = options[0];
      const justificationResult = await generateDecisionJustification({
        subject,
        options: options,
        aiRecommendation: fallbackRecommendation,
        responseLength,
      });

      const decisionResult = {
        recommendation: fallbackRecommendation,
        justification: justificationResult.justification || "The AI could not provide a specific justification for its fallback choice.",
      };
      
      return {
        status: 'error',
        message: 'The AI provided an unexpected recommendation, but here is a default analysis.',
        result: decisionResult
      };
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
      try {
        const { firestore } = initializeFirebase();
        const decisionsCollection = collection(firestore, 'users', userId, 'decisions');
        await addDoc(decisionsCollection, {
          subject,
          options,
          userContext,
          ...decisionResult,
          createdAt: serverTimestamp(),
        });
      } catch (dbError) {
        console.error("Firestore write failed:", dbError);
        // We don't want to fail the whole operation if just the save fails.
        // The user still gets their advice.
      }
    }

    return {
      status: 'success',
      result: decisionResult,
    };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    
    if (errorMessage.includes('503')) {
       return {
        status: 'error',
        message: "We're sorry, but the AI service is currently experiencing high traffic. Please try again in a few moments.",
      };
    }

    return {
      status: 'error',
      message: `An error occurred while getting your advice. Please try again.`,
    };
  }
}
