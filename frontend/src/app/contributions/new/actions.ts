
'use server';

import { revalidatePath } from 'next/cache';

interface ContributionPayload {
    title: string;
    description: string;
    price: number;
    course_code?: string;
    thumbnail_image: string;
    related_University: string;
    department: string;
}

export async function createContribution(data: ContributionPayload, accessToken: string) {
    const payload = {
        ...data,
        price: data.price.toString(), // Ensure price is a string
    };
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/contributions/contributions/create/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = Object.entries(errorData).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join('; ');
        throw new Error(errorMessage || 'Failed to create contribution.');
    }

    revalidatePath('/contributions');
    revalidatePath('/profile');

    return await response.json();
}

export interface University {
    id: string;
    name: string;
    departments: Department[];
}

export interface Department {
    id: string;
    name: string;
}
