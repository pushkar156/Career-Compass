// src/services/google.ts
'use server';

/**
 * @fileOverview A service for interacting with Google's Custom Search API.
 * 
 * - googleSearchTool: A Genkit tool to search Google.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { google } from 'googleapis';

const GoogleSearchInputSchema = z.object({
    query: z.string().describe('The search query for Google.'),
});

const SearchResultSchema = z.object({
    title: z.string(),
    url: z.string().url(),
    description: z.string(),
});

const GoogleSearchOutputSchema = z.array(SearchResultSchema);

export const googleSearchTool = ai.defineTool(
    {
        name: 'googleSearchTool',
        description: 'Performs a Google search using the Custom Search API to find relevant web pages.',
        inputSchema: GoogleSearchInputSchema,
        outputSchema: GoogleSearchOutputSchema,
    },
    async (input) => {
        const apiKey = process.env.GOOGLE_API_KEY;
        const cseId = process.env.GOOGLE_CSE_ID;

        if (!apiKey || !cseId) {
            console.error('GOOGLE_API_KEY or GOOGLE_CSE_ID is not set in the environment variables.');
            return [];
        }

        const customsearch = google.customsearch('v1');

        try {
            const response = await customsearch.cse.list({
                auth: apiKey,
                cx: cseId,
                q: input.query,
                num: 5, // Fetch top 5 results
            });

            const items = response.data.items;
            if (!items) {
                return [];
            }

            return items.map((item) => ({
                title: item.title || '',
                url: item.link || '',
                description: item.snippet || '',
            })).filter(item => item.url);

        } catch (error) {
            console.error('Failed to fetch from Google Custom Search API:', error);
            return [];
        }
    }
);
