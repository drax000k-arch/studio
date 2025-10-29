'use server';

import { generateDecisionJustification } from '@/ai/flows/generate-decision-justification';
import { generateDecisionRecommendation } from '@/ai/flows/generate-decision-recommendation';
import { z } from 'zod';
import type { DecisionResult } from '@/lib/types';
import { initializeFirebase } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection } from 'firebase/firestore';

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
    
    addDocumentNonBlocking(decisionsCollection, {
        ...decisionData,
        createdAt: new Date().toISOString(),
    });
}


export async function getAiDecision(
  data: z.infer<typeof decisionFormSchema>
): Promise<ActionState> {
  try {
    const validation = decisionFormSchema.safeParse(data);

    if (!validation.success) {
      return {
        status: 'error',
        message: validation.error.errors.map(e => e.message).join(', '),
      };
    }

    const { subject, options, userContext, responseLength, userId } = validation.data;

    // 1. Get the AI's recommendation
    const recommendationResult = await generateDecisionRecommendation({
      subject,
      options: options,
      userContext: userContext ?? 'No personal context provided.',
    });

    let aiRecommendation = recommendationResult.recommendation;

    // 2. CRITICAL: Validate the AI's output. If it's not a valid option, fallback to the first option.
    if (!options.includes(aiRecommendation)) {
      console.warn(`AI returned an invalid option: "${aiRecommendation}". Falling back to the first option.`);
      aiRecommendation = options[0];
    }
    
    // 3. Generate justification for the (now guaranteed valid) recommendation
    const justificationResult = await generateDecisionJustification({
      subject,
      options: options,
      aiRecommendation: aiRecommendation,
      responseLength,
    });
    
    if (!justificationResult || !justificationResult.justification) {
        throw new Error("Failed to generate justification from the AI.");
    }

    const finalResult: DecisionResult = {
      recommendation: aiRecommendation,
      justification: justificationResult.justification,
    };

    // 4. Save the decision to Firestore if a user is logged in.
    if (userId) {
       saveDecision(userId, {
          subject,
          options,
          userContext,
          ...finalResult,
       });
    }

    // 5. Return success state
    return {
      status: 'success',
      result: finalResult,
    };

  } catch (error) {
    console.error("Error in getAiDecision:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    
    if (errorMessage.includes('503') || errorMessage.includes('unavailable')) {
       return {
        status: 'error',
        message: "The AI service is currently overloaded or unavailable. Please try again in a few moments.",
      };
    }

    return {
      status: 'error',
      message: `An unexpected error occurred while getting your advice. Please check your connection and try again.`,
    };
  }
}
