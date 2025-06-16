
'use server';

/**
 * @fileOverview This file defines a Genkit flow for extracting insights from code diffs using the Gemini API.
 *
 * - extractCodeInsights - A function that takes a code diff as input and returns insights.
 * - ExtractCodeInsightsInput - The input type for the extractCodeInsights function.
 * - ExtractCodeInsightsOutput - The return type for the extractCodeInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractCodeInsightsInputSchema = z.object({
  codeDiff: z
    .string()
    .describe('The code diff to analyze.'),
});
export type ExtractCodeInsightsInput = z.infer<typeof ExtractCodeInsightsInputSchema>;

const ExtractCodeInsightsOutputSchema = z.object({
  insights: z.string().describe('Insights extracted from the code diff.'),
});
export type ExtractCodeInsightsOutput = z.infer<typeof ExtractCodeInsightsOutputSchema>;

export async function extractCodeInsights(input: ExtractCodeInsightsInput): Promise<ExtractCodeInsightsOutput> {
  return extractCodeInsightsFlow(input);
}

const extractCodeInsightsPrompt = ai.definePrompt({
  name: 'extractCodeInsightsPrompt',
  input: {schema: ExtractCodeInsightsInputSchema},
  output: {schema: ExtractCodeInsightsOutputSchema},
  prompt: `You are a code review assistant. Analyze the following code diff and provide insights, highlighting key changes and potential issues.\n\nCode Diff:\n\n{{codeDiff}}`,
});

const extractCodeInsightsFlow = ai.defineFlow(
  {
    name: 'extractCodeInsightsFlow',
    inputSchema: ExtractCodeInsightsInputSchema,
    outputSchema: ExtractCodeInsightsOutputSchema,
  },
  async input => {
    const {output} = await extractCodeInsightsPrompt(input);
    return output!;
  }
);

