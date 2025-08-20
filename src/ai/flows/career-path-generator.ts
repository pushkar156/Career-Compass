// src/ai/flows/career-path-generator.ts
'use server';

/**
 * @fileOverview Generates a personalized learning roadmap for a specified career or field of study.
 *
 * - careerPathGenerator - A function that generates the career path.
 * - CareerPathInput - The input type for the careerPathGenerator function.
 * - CareerPathOutput - The return type for the careerPathGenerator function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CareerPathInputSchema = z.object({
  career: z.string().describe('The career or field of study the user is interested in.'),
});
export type CareerPathInput = z.infer<typeof CareerPathInputSchema>;

const CareerPathOutputSchema = z.object({
  roadmap: z.string().describe('A personalized learning roadmap for the specified career.'),
  knowledgeAreas: z.array(z.string()).describe('List of required knowledge areas.'),
  resources: z.array(z.string()).describe('List of relevant resources (e.g., YouTube videos, online courses).'),
  tools: z.array(z.string()).describe('List of the required tools for the field.'),
});
export type CareerPathOutput = z.infer<typeof CareerPathOutputSchema>;

export async function careerPathGenerator(input: CareerPathInput): Promise<CareerPathOutput> {
  return careerPathFlow(input);
}

const careerPathPrompt = ai.definePrompt({
  name: 'careerPathPrompt',
  input: {schema: CareerPathInputSchema},
  output: {schema: CareerPathOutputSchema},
  prompt: `You are an AI career counselor. Generate a personalized learning roadmap, a list of required knowledge areas, a list of relevant resources, and required tools for the career: {{{career}}}. Return the response in JSON format.`, 
});

const careerPathFlow = ai.defineFlow(
  {
    name: 'careerPathFlow',
    inputSchema: CareerPathInputSchema,
    outputSchema: CareerPathOutputSchema,
  },
  async input => {
    const {output} = await careerPathPrompt(input);
    return output!;
  }
);
