
'use server';

/**
 * @fileOverview A resource aggregator AI agent.
 *
 * - resourceAggregator - A function that handles the resource aggregation process.
 * - ResourceAggregatorInput - The input type for the resourceAggregator function.
 * - ResourceAggregatorOutput - The return type for the resourceAggregator function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ResourceAggregatorInputSchema = z.object({
  careerPath: z.string().describe('The chosen career path to aggregate resources for.'),
});
export type ResourceAggregatorInput = z.infer<typeof ResourceAggregatorInputSchema>;

const ResourceAggregatorOutputSchema = z.object({
  suggestedResources: z.array(z.string()).describe('A list of suggested resources for the career path, including YouTube videos, online courses, and tools.'),
});
export type ResourceAggregatorOutput = z.infer<typeof ResourceAggregatorOutputSchema>;

export async function resourceAggregator(input: ResourceAggregatorInput): Promise<ResourceAggregatorOutput> {
  return resourceAggregatorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'resourceAggregatorPrompt',
  input: {schema: ResourceAggregatorInputSchema},
  output: {schema: ResourceAggregatorOutputSchema},
  prompt: `You are an AI career counselor that will gather resources across the internet.

You will provide resources for the user's chosen career path, including YouTube videos, online courses (Udemy, Coursera, etc.), and tools.

Career Path: {{{careerPath}}}`,
});

const resourceAggregatorFlow = ai.defineFlow(
  {
    name: 'resourceAggregatorFlow',
    inputSchema: ResourceAggregatorInputSchema,
    outputSchema: ResourceAggregatorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
