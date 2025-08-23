
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
    existingJobMarket: z.object({
        summary: z.string().describe("An overview of the current job market, including the types of industries hiring for this role and key responsibilities."),
        industryDistribution: z.array(z.object({
            name: z.string().describe("The name of the industry."),
            value: z.number().describe("The percentage of jobs in this industry for the role."),
        })).describe("A breakdown of the top 5 industries hiring for this role by percentage. The percentages must sum to 100."),
    }).describe("Details about the existing job market."),
    payScale: z.object({
        summary: z.string().describe("General information and context about the typical salary for this role, mentioning factors like location and skills."),
        ranges: z.object({
            entry: z.object({ min: z.number(), max: z.number() }).describe("The salary range for an entry-level position."),
            mid: z.object({ min: z.number(), max: z.number() }).describe("The salary range for a mid-level position."),
            senior: z.object({ min: z.number(), max: z.number() }).describe("The salary range for a senior-level position."),
        }).describe("Salary ranges in USD, broken down by experience level."),
    }).describe("Detailed pay scale information."),
    globalOpportunities: z.object({
        summary: z.string().describe("An analysis of both national and international job opportunities, including factors that influence international prospects."),
        topRegions: z.array(z.object({
            name: z.string().describe("The name of the country or region."),
            demand: z.enum(['High', 'Medium', 'Low']).describe("The level of demand for the role in this region."),
        })).describe("A list of up to 5 key regions or countries where this role is in high demand."),
    }).describe("An analysis of job opportunities broken down by geography."),
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

Your task is to provide a comprehensive analysis with structured data. Your tone should be informative, realistic, and encouraging.

1.  **Upcoming Opportunities (upcomingOpportunities):**
    *   Analyze future trends and the long-term outlook.
    *   Discuss emerging technologies or skills.
    *   Provide insight into how the role is expected to evolve.

2.  **Existing Job Market (existingJobMarket):**
    *   **summary:** Describe the current landscape, primary industries, and core responsibilities.
    *   **industryDistribution:** Provide a list of the top 5 industries hiring for this role, with the percentage for each. The percentages **must** sum to 100.

3.  **Pay Scale (payScale):**
    *   **summary:** Provide context on salary variations based on location, company, and skills.
    *   **ranges:** Provide realistic salary ranges in USD for entry, mid, and senior levels. Give a min and max for each.

4.  **National & International Opportunities (globalOpportunities):**
    *   **summary:** Discuss the demand for this role both domestically and globally.
    *   **topRegions:** List up to 5 key countries or regions and classify their demand as 'High', 'Medium', or 'Low'.

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
