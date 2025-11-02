'use server';

import { generateDecisionJustification } from '@/ai/flows/generate-decision-justification';
import { generateDecisionRecommendation } from '@/ai/flows/generate-decision-recommendation';
import { generateDirectAnswer } from '@/ai/flows/generate-direct-answer';
import { z } from 'zod';
import type { DecisionResult } from '@/lib/types';
import { saveDecisionToFirestore } from '@/firebase/server-actions';


export type ActionState = {
  status: 'success' | 'error' | 'idle';
  result?: DecisionResult & { options: string[] };
  message?: string;
};

const decisionFormSchema = z.object({
  subject: z.string().min(3, { message: 'Subject must be at least 3 characters long.' }),
  options: z.array(z.string().min(1)).optional(),
  userContext: z.string().optional(),
  responseLength: z.enum(['short', 'long']),
  userId: z.string().optional(),
});


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

    // SCENARIO 1: User did NOT provide options. Act as a direct conversational AI.
    if (!options || options.length === 0) {
      const directAnswerResult = await generateDirectAnswer({
        question: subject,
        userContext: userContext ?? 'No personal context provided.',
      });

      if (!directAnswerResult || !directAnswerResult.answer) {
        throw new Error('AI failed to provide a direct answer.');
      }
      
      const finalResult: DecisionResult & { options: string[] } = {
        recommendation: subject, // For direct answers, the "recommendation" is the question.
        justification: directAnswerResult.answer,
        options: [], // No options were involved.
      };
      
       if (userId) {
         await saveDecisionToFirestore(userId, {
            subject: subject,
            options: [],
            userContext,
            recommendation: "Direct Answer",
            justification: directAnswerResult.answer,
            status: 'Pending',
         });
      }

      return {
        status: 'success',
        result: finalResult,
      };
    }


    // SCENARIO 2: User provided options. Act as a decision-maker.
    
    // Step 1: Get the AI's recommendation from the provided options
    const recommendationResult = await generateDecisionRecommendation({
      subject,
      options: options,
      userContext: userContext ?? 'No personal context provided.',
    });

    let aiRecommendation = recommendationResult.recommendation;

    // Step 2: CRITICAL - Validate the AI's output. If it hallucinated, fallback to the first option.
    if (!options.includes(aiRecommendation)) {
      console.warn(`AI returned an invalid option: "${aiRecommendation}". Falling back to the first option.`);
      aiRecommendation = options[0];
    }
    
    // Step 3: Generate justification for the (now guaranteed valid) recommendation
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
      options: options,
    };

    // Step 4: Save the decision to Firestore if a user is logged in.
    if (userId) {
       await saveDecisionToFirestore(userId, {
          subject,
          options,
          userContext,
          recommendation: finalResult.recommendation,
          justification: finalResult.justification,
          status: 'Pending',
       });
    }

    // Step 5: Return success state
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
