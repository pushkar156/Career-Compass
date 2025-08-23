
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
import {findYoutubeVideosTool} from '@/services/youtube';

const CareerPathInputSchema = z.object({
  career: z.string().describe('The career or field of study the user is interested in.'),
  currentRole: z.string().optional().describe("The user's current role or educational background."),
  interests: z.string().optional().describe("A list of the user's interests."),
});
export type CareerPathInput = z.infer<typeof CareerPathInputSchema>;

const ResourceSchema = z.object({
  title: z.string().describe("The title of the resource. For websites, include the domain name in parentheses, e.g., 'Official React Docs (react.dev)'."),
  url: z.string().url().describe('A valid and working URL for the resource.'),
  type: z.enum(['video', 'course', 'book', 'article', 'website']).describe('The type of the resource.'),
  videoId: z.string().optional().describe('If the resource is a YouTube video, provide its unique video ID.'),
});

const RoadmapSchema = z.object({
  beginnerToIntermediate: z.array(z.string()).describe('A list of steps for the beginner to intermediate level.'),
  intermediateToPro: z.array(z.string()).describe('A list of steps for the intermediate to pro level.'),
  proToAdvanced: z.array(z.string()).describe('A list of steps for the pro to advanced level.'),
});

const ToolSchema = z.object({
    name: z.string().describe("The name of the tool."),
    description: z.string().describe("A brief, one-sentence description of the tool's primary purpose."),
    cost: z.enum(['Free', 'Paid', 'Freemium']).describe("The cost model of the tool."),
});

const CareerPathOutputSchema = z.object({
  roadmap: RoadmapSchema.describe('A personalized learning roadmap segmented by skill level.'),
  knowledgeAreas: RoadmapSchema.describe('List of required knowledge areas, segmented by skill level.'),
  resources: z.array(ResourceSchema).describe('List of relevant, high-quality resources.'),
  tools: z.array(ToolSchema).describe('List of the essential tools for the field, ordered from most to least recommended.'),
});
export type CareerPathOutput = z.infer<typeof CareerPathOutputSchema>;

export async function careerPathGenerator(input: CareerPathInput): Promise<CareerPathOutput> {
  return careerPathFlow(input);
}

const careerPathPrompt = ai.definePrompt({
  name: 'careerPathPrompt',
  input: {schema: CareerPathInputSchema},
  output: {schema: CareerPathOutputSchema},
  tools: [findYoutubeVideosTool],
  prompt: `You are an expert AI career counselor and content curator. Your goal is to provide a comprehensive, high-quality, and actionable guide for a user aspiring to enter the field of: {{{career}}}.

Consider the user's background:
{{#if currentRole}}Current Role: {{{currentRole}}}{{/if}}
{{#if interests}}Interests: {{{interests}}}{{/if}}

Your response must be structured and detailed, following these strict guidelines:

1.  **Roadmap (roadmap):**
    *   Create a step-by-step learning roadmap.
    *   Organize the roadmap into three distinct sections: 'beginnerToIntermediate', 'intermediateToPro', and 'proToAdvanced'.
    *   Each step should be a clear, concise action item.

2.  **Knowledge Areas (knowledgeAreas):**
    *   Identify the key knowledge areas required for this career.
    *   Structure these areas into the same three sections as the roadmap: 'beginnerToIntermediate', 'intermediateToPro', and 'proToAdvanced'.
    *   This should outline the concepts and skills to master at each level.

3.  **Resources (resources):**
    *   Provide a curated list of the **best available and most popular resources**. Quality and popularity are more important than quantity.
    *   **For websites and articles:** Prioritize authoritative sources like MDN Web Docs, GeeksforGeeks, W3Schools, official documentation, and top-tier blogs. When providing the title, include the domain name in parentheses, e.g., 'Official React Docs (react.dev)'.
    *   **For online courses:** Include highly-rated courses from major platforms like Coursera and Udemy. Ensure the links are direct and valid.
    *   **For YouTube videos:** For each major learning topic identified in the knowledge areas, you **MUST** use the \`findYoutubeVideosTool\` to find relevant videos.
        *   For each call to the tool, generate search queries that will find the most helpful, highly-regarded, and popular videos in both **English** and **Hindi**.
        *   The tool will return valid, publicly-accessible videos with their IDs. You must include these in your response. Do not hallucinate or guess video details.

4.  **Tools (tools):**
    *   List the most essential, industry-standard software and tools for this career.
    *   **Order the list from the most recommended tool to the least recommended.**
    *   For each tool, you must provide its name, a brief one-sentence description, and its cost model ('Free', 'Paid', or 'Freemium').

Return the entire response in a single, valid JSON object that adheres to the defined output schema. Every single URL must be a valid, working, direct link to the resource.`,
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
