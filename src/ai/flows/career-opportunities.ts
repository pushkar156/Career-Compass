
// src/ai/flows/career-opportunities.ts
'use server';

/**
 * @fileOverview Provides a detailed analysis of career opportunities for a specific job role.
 *
 * - getCareerOpportunities - A function that returns job market insights.
 * - CareerOpportunitiesInput - The input type for the getCareerOpportunities function.
 * - CareerOpportunitiesOutput - The return type for the getCareerOpportunities function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CareerOpportunitiesInputSchema = z.object({
  specificRole: z.string().describe('The specific job title or role to analyze, e.g., "UX Designer".'),
});
export type CareerOpportunitiesInput = z.infer<typeof CareerOpportunitiesInputSchema>;


const CareerOpportunitiesOutputSchema = z.object({
    upcomingOpportunities: z.string().describe("A summary of future trends, emerging technologies, and the long-term outlook for this career. Explain what will be in demand in the future."),
    existingJobMarket: z.string().describe("An overview of the current job market, including the types of industries hiring for this role and key responsibilities."),
    payScale: z.string().describe("General information on the typical salary range for this role, considering different levels of experience (entry-level, mid-level, senior). Provide a realistic range, not a single number."),
    globalOpportunities: z.string().describe("An analysis of both national and international job opportunities, including key regions or countries where this role is in high demand."),
});
export type CareerOpportunitiesOutput = z.infer<typeof CareerOpportunitiesOutputSchema>;


export async function getCareerOpportunities(input: CareerOpportunitiesInput): Promise<CareerOpportunitiesOutput> {
  return careerOpportunitiesFlow(input);
}

const careerOpportunitiesPrompt = ai.definePrompt({
  name: 'careerOpportunitiesPrompt',
  input: {schema: CareerOpportunitiesInputSchema},
  output: {schema: CareerOpportunitiesOutputSchema},
  prompt: `You are an expert AI career analyst. A user wants to understand the career landscape for a specific role: {{{specificRole}}}.

Your task is to provide a comprehensive analysis covering four key areas. Your tone should be informative, realistic, and encouraging.

1.  **Upcoming Opportunities (upcomingOpportunities):**
    *   Analyze future trends and the long-term outlook for this role.
    *   Discuss emerging technologies or skills that will be important.
    *   Provide insight into how the role is expected to evolve.

2.  **Existing Job Market (existingJobMarket):**
    *   Describe the current landscape for this role.
    *   Mention the primary industries that hire for this position.
    *   Summarize the core day-to-day responsibilities and common job requirements.

3.  **Pay Scale (payScale):**
    *   Provide a realistic and general salary range for this career.
    *   Break it down by experience level (e.g., Entry-Level, Mid-Level, Senior).
    *   **IMPORTANT:** Do not give a single, definitive number. Instead, describe a typical range (e.g., "$50,000 to $70,000 for entry-level"). Frame this as an estimate that can vary by location, company, and skills.

4.  **National & International Opportunities (globalOpportunities):**
    *   Discuss the demand for this role both domestically and globally.
    *   Highlight any key countries, regions, or cities where there is a high concentration of opportunities.
    *   Mention any factors that might influence international prospects (e.g., language skills, visa requirements).

Return the entire response in a single, valid JSON object that adheres to the defined output schema.`,
});

const careerOpportunitiesFlow = ai.defineFlow(
  {
    name: 'careerOpportunitiesFlow',
    inputSchema: CareerOpportunitiesInputSchema,
    outputSchema: CareerOpportunitiesOutputSchema,
  },
  async input => {
    const {output} = await careerOpportunitiesPrompt(input);
    return output!;
  }
);
