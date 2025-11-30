'use server';

/**
 * @fileOverview An AI agent for recommending relevant study resources to students.
 *
 * - recommendResources - A function that recommends study resources based on a student's academic history and enrolled contributions.
 * - RecommendResourcesInput - The input type for the recommendResources function.
 * - RecommendResourcesOutput - The return type for the recommendResources function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendResourcesInputSchema = z.object({
  academicHistory: z
    .string()
    .describe('A summary of the student\'s academic history.'),
  enrolledContributions: z
    .string()
    .describe('A list of the contributions the student is currently enrolled in.'),
  learningNeeds: z
    .string()
    .describe('A description of the student\'s specific learning needs.'),
});
export type RecommendResourcesInput = z.infer<typeof RecommendResourcesInputSchema>;

const RecommendResourcesOutputSchema = z.object({
  recommendedResources: z
    .string()
    .describe('A list of recommended study resources relevant to the student\'s needs.'),
});
export type RecommendResourcesOutput = z.infer<typeof RecommendResourcesOutputSchema>;

export async function recommendResources(input: RecommendResourcesInput): Promise<RecommendResourcesOutput> {
  return recommendResourcesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendResourcesPrompt',
  input: {schema: RecommendResourcesInputSchema},
  output: {schema: RecommendResourcesOutputSchema},
  prompt: `You are an AI assistant designed to recommend study resources to students.

  Based on the student's academic history, current enrollments, and stated learning needs, provide a list of relevant resources.

  Academic History: {{{academicHistory}}}
  Enrolled Contributions: {{{enrolledContributions}}}
  Learning Needs: {{{learningNeeds}}}

  Recommended Resources:`, //Ensure the output is a string.
});

const recommendResourcesFlow = ai.defineFlow(
  {
    name: 'recommendResourcesFlow',
    inputSchema: RecommendResourcesInputSchema,
    outputSchema: RecommendResourcesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
