
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const tagSchema = z.object({
  name: z.string(),
});

const videoSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  video_file: z.string().url(),
});

const noteSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  note_file: z.string().url(),
});

const contributionEditSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long.'),
  description: z.string().min(10, 'Description must be at least 10 characters long.'),
  price: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().min(0, 'Price must be a positive number.')
  ),
  course_code: z.string().optional(),
  thumbnail_image: z.string().url('Please enter a valid URL for the thumbnail image.'),
  related_University: z.string().uuid('Please select a university.'),
  department: z.string().uuid('Please select a department.'),
  tags: z.array(tagSchema).optional(),
  videos: z.array(videoSchema).optional(),
  notes: z.array(noteSchema).optional(),
});

export type ContributionEditFormValues = z.infer<typeof contributionEditSchema>;


export async function updateContribution(
    contributionId: string, 
    data: ContributionEditFormValues, 
    accessToken: string
) {
    const payload = {
        ...data,
        price: data.price.toString(),
    };
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/contributions/contributions/${contributionId}/edit/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("Update error response:", errorData);
        const errorMessage = Object.entries(errorData).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join('; ');
        throw new Error(errorMessage || 'Failed to update contribution.');
    }

    revalidatePath('/profile');
    revalidatePath(`/contributions/${contributionId}`);
    revalidatePath(`/contributions/${contributionId}/edit`);

    return await response.json();
}
