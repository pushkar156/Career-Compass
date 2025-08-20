'use server';

import { z } from 'zod';
import { careerPathGenerator, type CareerPathOutput } from '@/ai/flows/career-path-generator';

const inputSchema = z.object({
  career: z.string().min(3, { message: 'Career must be at least 3 characters long.' }),
});

export async function generateCareerPathAction(input: { career: string }): Promise<{ success: true; data: CareerPathOutput } | { success: false; error: string }> {
  const validation = inputSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message };
  }
  
  try {
    const result = await careerPathGenerator({ career: validation.data.career });
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}
