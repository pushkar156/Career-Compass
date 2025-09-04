
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
  currentRole: z.string().optional().describe("The user's current role or educational background (e.g., '12th class', 'UG student')."),
  interests: z.string().optional().describe("A comma-separated list of the user's interests to provide personalized suggestions."),
});
export type CareerExplorationInput = z.infer<typeof CareerExplorationInputSchema>;

const AcademicSuggestionSchema = z.object({
    title: z.string().describe("The name of the exam, subject stream, or competition (e.g., 'JEE Mains & Advanced', 'Commerce Stream', 'Google Summer of Code')."),
    description: z.string().describe("A brief, clear explanation of what it is and why it's relevant for the user's desired career."),
});

const InterestBasedSuggestionSchema = z.object({
    interest: z.string().describe("The specific interest this suggestion is based on (e.g., 'Art', 'Technology')."),
    guidance: z.string().describe("Personalized guidance explaining how this specific interest aligns with potential career avenues related to the main desired career."),
    relatedRoles: z.array(z.string()).describe("A list of specific job titles or career paths that align well with this particular interest."),
});

const CareerExplorationOutputSchema = z.object({
    description: z.string().describe("A detailed overview of the career field."),
    specificRoles: z.array(z.string()).describe("A comprehensive list of specific, in-depth job titles or roles that exist within this career field."),
    academicSuggestions: z.array(AcademicSuggestionSchema).optional().describe("Actionable academic or competitive suggestions based on the user's educational stage."),
    interestSuggestions: z.array(InterestBasedSuggestionSchema).optional().describe("A list of personalized career suggestions, with each object in the list corresponding to a single interest provided by the user."),
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

User's desired career: {{{career}}}
{{#if currentRole}}User's current background: {{{currentRole}}}{{/if}}
{{#if interests}}User's interests: {{{interests}}}{{/if}}

Your task is to provide a comprehensive and clear overview of the requested career field. Your response must include the following parts:

1.  **Description (description):** A detailed but easy-to-understand summary of what the career field entails. Cover the main responsibilities, the industry landscape, and what makes the field unique.

2.  **Interest-Based Suggestions (interestSuggestions):**
    *   **This section is conditional.** Only generate it if the user has provided their 'interests'.
    *   The user's interests will be a comma-separated string. You must process each interest individually.
    *   For **each** interest, create a separate object in the 'interestSuggestions' array.
    *   Each object must contain:
        *   **interest:** The single interest from the user's list that this suggestion is about.
        *   **guidance:** A brief, encouraging paragraph that connects this specific interest to their desired career or related fields. Suggest how this passion could translate into a fulfilling profession.
        *   **relatedRoles:** Based on this single interest, list a few specific job titles or alternative career paths they might also find appealing. This should be distinct from the main 'specificRoles' list.

3.  **Academic Suggestions (academicSuggestions):**
    *   This is a critical step. Based on the user's 'currentRole', provide highly relevant, popular, and actionable academic suggestions.
    *   **If the user is in 10th class/grade:** Suggest the most relevant subject streams (e.g., Science with PCM, Commerce, Arts) for their desired career.
    *   **If the user is in 11th or 12th class/grade:** Suggest the most important and popular undergraduate entrance exams, both in India and internationally, that are gateways to the desired career. Examples: JEE for Engineering, NEET for Medicine, UCEED for Design, SAT/ACT for US universities.
    *   **If the user is an undergraduate student (e.g., 'B.Tech student', 'UG student'):** Suggest popular postgraduate entrance exams (e.g., CAT for MBA, GATE for M.Tech, GRE for MS abroad) or prestigious competitions/programs (e.g., Google Summer of Code, ACM-ICPC) that would boost their profile for this career.
    *   **IMPORTANT:** Only provide suggestions that are genuinely popular, well-regarded, and directly pursuable. Avoid obscure or irrelevant options. Be precise. If no 'currentRole' is provided or it's not a student role, you can omit this section.
    *   Format each suggestion as an object with a 'title' and a 'description'.

4.  **Specific Roles (specificRoles):**
    *   A comprehensive list of distinct and concrete job titles or specializations that exist within this broader field.
    *   If the user provides a very broad field (like "Designing," "Business"), your primary goal for 'specificRoles' is to break that down into more specific, actionable career fields (e.g., for "Designing", list ["Graphic Design", "UI/UX Design", "Fashion Design"]).
    *   Only provide granular job titles if the user has already provided a sufficiently specific field (e.g., "Software Engineering").

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
