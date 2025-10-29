'use server';

import { generateDecisionJustification } from '@/ai/flows/generate-decision-justification';
import { generateDecisionRecommendation } from '@/ai/flows/generate-decision-recommendation';
import { z } from 'zod';
import type { DecisionResult } from '@/lib/types';
import { getFirestore, addDoc, collection } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';

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

function saveDecision(userId: string, decisionData: any) {
    const { firestore } = initializeFirebase();
    const decisionsCollection = collection(firestore, 'users', userId, 'decisions');
    
    // Use non-blocking update to prevent UI freezes and handle errors gracefully.
    addDocumentNonBlocking(decisionsCollection, {
        ...decisionData,
        createdAt: new Date().toISOString(),
    });
}


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

    let aiRecommendation = recommendationResult.recommendation;

    // CRITICAL FIX: Validate that the AI's recommendation is one of the provided options.
    // If not, use the first option as a safe fallback.
    if (!options.includes(aiRecommendation)) {
      console.warn(`AI returned an invalid option: "${aiRecommendation}". Falling back to the first option.`);
      aiRecommendation = options[0];
    }
    
    const justificationResult = await generateDecisionJustification({
      subject,
      options: options,
      aiRecommendation, // Use the validated or fallback recommendation
      responseLength,
    });
    
    if (!justificationResult || !justificationResult.justification) {
        throw new Error("Failed to generate justification.");
    }

    const decisionResult = {
      recommendation: aiRecommendation,
      justification: justificationResult.justification,
    };

    if (userId) {
       saveDecision(userId, {
          subject,
          options,
          userContext,
          ...decisionResult,
       });
    }

    return {
      status: 'success',
      result: decisionResult,
    };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    
    // Improved error message for service availability
    if (errorMessage.includes('503') || errorMessage.includes('unavailable')) {
       return {
        status: 'error',
        message: "We're sorry, but the AI service is currently experiencing high traffic or is unavailable. Please try again in a few moments.",
      };
    }

    return {
      status: 'error',
      message: `An error occurred while getting your advice. Please check your connection and try again.`,
    };
  }
}
