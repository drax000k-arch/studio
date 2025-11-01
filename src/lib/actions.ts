'use server';

import { generateDecisionJustification } from '@/ai/flows/generate-decision-justification';
import { generateDecisionRecommendation } from '@/ai/flows/generate-decision-recommendation';
import { generateDecisionOptions } from '@/ai/flows/generate-decision-options';
import { z } from 'zod';
import type { DecisionResult } from '@/lib/types';
import { initializeFirebase } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection } from 'firebase/firestore';

export type ActionState = {
  status: 'success' | 'error' | 'idle';
  result?: DecisionResult & { options: string[] };
  message?: string;
};

const decisionFormSchema = z.object({
  subject: z.string().min(3, { message: 'Subject must be at least 3 characters long.' }),
  options: z.array(z.string().min(1)).optional(), // Options are now optional
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

    const { subject, userContext, responseLength, userId } = validation.data;
    let options = validation.data.options;

    // 1. Generate options if they weren't provided
    if (!options || options.length < 2) {
      const generatedOptionsResult = await generateDecisionOptions({
        subject,
        userContext: userContext ?? 'No personal context provided.',
      });
      if (!generatedOptionsResult || !generatedOptionsResult.options || generatedOptionsResult.options.length === 0) {
        throw new Error("AI failed to generate any decision options.");
      }
      options = generatedOptionsResult.options;
    }
    
    if (options.length < 2) {
      throw new Error("Could not determine at least two options for the decision.");
    }


    // 2. Get the AI's recommendation from the (now guaranteed) list of options
    const recommendationResult = await generateDecisionRecommendation({
      subject,
      options: options,
      userContext: userContext ?? 'No personal context provided.',
    });

    let aiRecommendation = recommendationResult.recommendation;

    // 3. CRITICAL: Validate the AI's output. If it's not a valid option, fallback to the first option.
    if (!options.includes(aiRecommendation)) {
      console.warn(`AI returned an invalid option: "${aiRecommendation}". Falling back to the first option.`);
      aiRecommendation = options[0];
    }
    
    // 4. Generate justification for the (now guaranteed valid) recommendation
    const justificationResult = await generateDecisionJustification({
      subject,
      options: options,
      aiRecommendation: aiRecommendation,
      responseLength,
    });
    
    if (!justificationResult || !justificationResult.justification) {
        throw new Error("Failed to generate justification from the AI.");
    }

    const finalResult: DecisionResult & { options: string[] } = {
      recommendation: aiRecommendation,
      justification: justificationResult.justification,
      options: options, // Include the options in the final result
    };

    // 5. Save the decision to Firestore if a user is logged in.
    if (userId) {
       saveDecision(userId, {
          subject,
          options,
          userContext,
          recommendation: finalResult.recommendation,
          justification: finalResult.justification,
       });
    }

    // 6. Return success state
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
