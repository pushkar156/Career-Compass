
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

const ResourceSchema = z.object({
  title: z.string().describe('The title of the resource.'),
  url: z.string().url().describe('The URL for the resource.'),
  type: z.enum(['video', 'course', 'book', 'article', 'website']).describe('The type of the resource.'),
});

const RoadmapSchema = z.object({
  beginnerToIntermediate: z.array(z.string()).describe('A list of steps for the beginner to intermediate level.'),
  intermediateToPro: z.array(z.string()).describe('A list of steps for the intermediate to pro level.'),
  proToAdvanced: z.array(z.string()).describe('A list of steps for the pro to advanced level.'),
});

const CareerPathOutputSchema = z.object({
  roadmap: RoadmapSchema.describe('A personalized learning roadmap segmented by skill level.'),
  knowledgeAreas: z.array(z.string()).describe('List of required knowledge areas.'),
  resources: z.array(ResourceSchema).describe('List of relevant resources (e.g., YouTube videos, online courses).'),
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
  prompt: `You are an AI career counselor. Generate a personalized learning roadmap, a list of required knowledge areas, a list of relevant resources, and required tools for the career: {{{career}}}. 
  
  For the roadmap, provide a step-by-step guide segmented into three levels: 'beginnerToIntermediate', 'intermediateToPro', and 'proToAdvanced'. Each segment should be a list of strings.
  For resources, provide a title, a valid URL, and the type of resource.
  For tools, provide a simple list of names.
  
  Return the response in JSON format.`,
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
