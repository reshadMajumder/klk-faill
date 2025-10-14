
'use server';

import { revalidatePath } from "next/cache";

export async function enrollInContribution(contributionId: string, accessToken: string) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/enrollment/create/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ contribution: contributionId }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = 'Failed to enroll in the contribution.';
        
        if (Array.isArray(errorData) && errorData.includes('User is already enrolled in this contribution.')) {
            errorMessage = 'You are already enrolled in this contribution.';
        } else if (errorData.message) {
            errorMessage = errorData.message;
        }

        throw new Error(errorMessage);
    }
    
    revalidatePath(`/contributions/${contributionId}`);
    return await response.json();
}
