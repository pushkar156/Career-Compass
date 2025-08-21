// src/services/youtube.ts
'use server';

/**
 * @fileOverview A service for interacting with the YouTube Data API.
 * 
 * - findYoutubeVideosTool: A Genkit tool to search for YouTube videos.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const YoutubeSearchInputSchema = z.object({
    query: z.string().describe('The search query for YouTube.'),
    lang: z.enum(['en', 'hi']).default('en').describe('The language to search for.'),
    limit: z.number().default(1).describe('The maximum number of results to return.'),
});

const VideoResourceSchema = z.object({
    title: z.string(),
    url: z.string().url(),
    type: z.literal('video'),
    videoId: z.string(),
});

const YoutubeSearchOutputSchema = z.array(VideoResourceSchema);

export const findYoutubeVideosTool = ai.defineTool(
    {
        name: 'findYoutubeVideosTool',
        description: 'Searches YouTube for relevant videos based on a query.',
        inputSchema: YoutubeSearchInputSchema,
        outputSchema: YoutubeSearchOutputSchema,
    },
    async (input) => {
        const apiKey = process.env.YOUTUBE_API_KEY;

        if (!apiKey) {
            console.error('YOUTUBE_API_KEY is not set in the environment variables.');
            return [];
        }

        const { query, lang, limit } = input;
        const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
        searchUrl.searchParams.set('part', 'snippet');
        searchUrl.searchParams.set('q', query);
        searchUrl.searchParams.set('type', 'video');
        searchUrl.searchParams.set('maxResults', limit.toString());
        searchUrl.searchParams.set('key', apiKey);
        searchUrl.searchParams.set('relevanceLanguage', lang);
        searchUrl.searchParams.set('videoEmbeddable', 'true');

        try {
            const response = await fetch(searchUrl.toString());
            if (!response.ok) {
                const errorData = await response.json();
                console.error('YouTube API Error:', errorData);
                return [];
            }
            const data = await response.json();

            return (data.items || []).map((item: any) => ({
                title: item.snippet.title,
                url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
                type: 'video' as const,
                videoId: item.id.videoId,
            }));

        } catch (error) {
            console.error('Failed to fetch from YouTube API:', error);
            return [];
        }
    }
);
