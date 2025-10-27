'use server';

/**
 * @fileOverview Summarizes community posts related to a decision.
 *
 * - summarizeCommunityPosts - A function that summarizes community posts.
 * - SummarizeCommunityPostsInput - The input type for the summarizeCommunityPosts function.
 * - SummarizeCommunityPostsOutput - The return type for the summarizeCommunityPosts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeCommunityPostsInputSchema = z.object({
  posts: z.array(z.string()).describe('An array of community post texts.'),
});
export type SummarizeCommunityPostsInput = z.infer<
  typeof SummarizeCommunityPostsInputSchema
>;

const SummarizeCommunityPostsOutputSchema = z.object({
  summary: z
    .string()
    .describe('A concise summary of the community posts.'),
});
export type SummarizeCommunityPostsOutput = z.infer<
  typeof SummarizeCommunityPostsOutputSchema
>;

export async function summarizeCommunityPosts(
  input: SummarizeCommunityPostsInput
): Promise<SummarizeCommunityPostsOutput> {
  return summarizeCommunityPostsFlow(input);
}

const summarizeCommunityPostsPrompt = ai.definePrompt({
  name: 'summarizeCommunityPostsPrompt',
  input: {schema: SummarizeCommunityPostsInputSchema},
  output: {schema: SummarizeCommunityPostsOutputSchema},
  prompt: `Summarize the following community posts into a concise summary:\n\nPosts:\n{{#each posts}}\n- {{{this}}}\n{{/each}}\n\nSummary:`,
});

const summarizeCommunityPostsFlow = ai.defineFlow(
  {
    name: 'summarizeCommunityPostsFlow',
    inputSchema: SummarizeCommunityPostsInputSchema,
    outputSchema: SummarizeCommunityPostsOutputSchema,
  },
  async input => {
    const {output} = await summarizeCommunityPostsPrompt(input);
    return output!;
  }
);
