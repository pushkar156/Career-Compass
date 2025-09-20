
'use server';

import { z } from 'zod';
import { careerPathGenerator, type CareerPathOutput } from '@/ai/flows/career-path-generator';
import { exploreCareer, type CareerExplorationOutput } from '@/ai/flows/career-explorer';
import { getCareerOpportunities, type CareerOpportunitiesOutput } from '@/ai/flows/career-opportunities';


const careerPathSchema = z.object({
  career: z.string().min(3, { message: 'Career must be at least 3 characters long.' }),
  currentRole: z.string().optional(),
  interests: z.string().optional(),
});

export async function generateCareerPathAction(input: {
  career: string,
  currentRole?: string,
  interests?: string
}): Promise<{ success: true; data: CareerPathOutput } | { success: false; error: string }> {
  const validation = careerPathSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message };
  }
  
  try {
    const result = await careerPathGenerator(validation.data);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}

const exploreCareerSchema = z.object({
    career: z.string().min(3, { message: 'Career must be at least 3 characters long.' }),
    currentRole: z.string().optional(),
    interests: z.string().optional(),
});

export async function exploreCareerAction(input: { career: string, currentRole?: string, interests?: string }): Promise<{ success: true; data: CareerExplorationOutput } | { success: false; error: string }> {
    const validation = exploreCareerSchema.safeParse(input);
    if (!validation.success) {
        return { success: false, error: validation.error.errors[0].message };
    }
    
    try {
        const result = await exploreCareer(validation.data);
        return { success: true, data: result };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
}

const opportunitiesSchema = z.object({
    specificRole: z.string().min(3, { message: 'Role must be at least 3 characters long.' }),
});

export async function getCareerOpportunitiesAction(input: { specificRole: string }): Promise<{ success: true; data: CareerOpportunitiesOutput } | { success: false; error: string }> {
    const validation = opportunitiesSchema.safeParse(input);
    if (!validation.success) {
        return { success: false, error: validation.error.errors[0].message };
    }
    
    try {
        const result = await getCareerOpportunities({ specificRole: validation.data.specificRole });
        return { success: true, data: result };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
}


const updateProfileSchema = z.object({
    displayName: z.string().min(2, { message: "Name must be at least 2 characters."})
});

// This action is a placeholder. It needs to be implemented with the actual user update logic.
// For now, it will simulate a successful update.
export async function updateUserProfileAction(input: { displayName: string }): Promise<{ success: true } | { success: false, error: string }> {
    const validation = updateProfileSchema.safeParse(input);
    if (!validation.success) {
        return { success: false, error: validation.error.errors[0].message };
    }

    // In a real app, you would get the current user and call the update function from your auth hook/service.
    // For example: `await updateUserProfile({ displayName: validation.data.displayName });`
    console.log("Updating user profile with:", validation.data.displayName);

    // This is a server action, but we are calling a client-side hook logic inside it,
    // which is not correct. The logic should be handled by the auth provider context.
    // This is a simplified example.
    
    return { success: true };
}
