
// src/ai/flows/career-explorer.ts
'use server';

/**
 * @fileOverview Explores a given career field to provide a description and list of specific roles.
 *
 * - exploreCareer - A function that returns details about a career field.
 * - CareerExplorationInput - The input type for the exploreCareer function.
 * - CareerExplorationOutput - The return type for the exploreCareer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CareerExplorationInputSchema = z.object({
  career: z.string().describe('The general career field the user is interested in, e.g., "Software Engineering".'),
});
export type CareerExplorationInput = z.infer<typeof CareerExplorationInputSchema>;

const CareerExplorationOutputSchema = z.object({
    description: z.string().describe("A detailed overview of the career field."),
    specificRoles: z.array(z.string()).describe("A list of specific, in-depth job titles or roles that exist within this career field."),
});
export type CareerExplorationOutput = z.infer<typeof CareerExplorationOutputSchema>;

export async function exploreCareer(input: CareerExplorationInput): Promise<CareerExplorationOutput> {
  return careerExplorationFlow(input);
}

const careerExplorationPrompt = ai.definePrompt({
  name: 'careerExplorationPrompt',
  input: {schema: CareerExplorationInputSchema},
  output: {schema: CareerExplorationOutputSchema},
  prompt: `You are an expert AI career counselor. A user wants to learn about a specific career field.

Your task is to provide a comprehensive and clear overview of the requested career field: {{{career}}}.

Your response must include two parts:
1.  **Description (description):** A detailed but easy-to-understand summary of what the career field entails. Cover the main responsibilities, the industry landscape, and what makes the field unique.
2.  **Specific Roles (specificRoles):** A list of distinct and concrete job titles or specializations that exist within this broader field. For example, if the user asks about "Marketing," you might list roles like "SEO Specialist," "Content Marketing Manager," "Social Media Manager," etc.

**IMPORTANT:** If the user provides a very broad, general field (like "Designing," "Business," "Medicine," or "Art"), your primary goal for the \`specificRoles\` is to break that down into more specific, actionable career fields. For example:
*   If the input is "Designing," the \`specificRoles\` should be a list like: ["Graphic Design", "UI/UX Design", "Interior Design", "Fashion Design", "Product Design"].
*   If the input is "Business," the \`specificRoles\` should be a list like: ["Finance", "Marketing", "Human Resources", "Operations Management", "Entrepreneurship"].

Only provide granular job titles if the user has already provided a sufficiently specific field (e.g., "Software Engineering").

Return the entire response in a single, valid JSON object that adheres to the defined output schema.`,
});

const careerExplorationFlow = ai.defineFlow(
  {
    name: 'careerExplorationFlow',
    inputSchema: CareerExplorationInputSchema,
    outputSchema: CareerExplorationOutputSchema,
  },
  async input => {
    const {output} = await careerExplorationPrompt(input);
    return output!;
  }
);
