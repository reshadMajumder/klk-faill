
import type { User, Contribution, Review } from './types';
import { PlaceHolderImages } from './placeholder-images';
import type { Enrollment } from '@/app/profile/enrollments/actions';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const universities = [
    { id: '981a4e97-d597-4c37-bbd3-ff63a39f935d', name: 'University of Example' },
    { id: 'another-uuid-for-testing-1', name: 'Metropolitan University' },
    { id: 'another-uuid-for-testing-2', name: 'State College' },
    { id: 'another-uuid-for-testing-3', name: 'Tech Institute' },
];

const users: User[] = [
  {
    id: 'user1',
    name: 'Alex Johnson',
    email: 'alex.j@example.com',
    avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar1')?.imageUrl ?? '',
    bio: 'Computer Science major with a passion for algorithms and data structures. I believe in making complex topics simple and accessible.',
    expertise: ['Algorithms', 'Web Development', 'Calculus'],
    username: 'alexj',
    phoneNumber: '1234567890',
    dateOfBirth: '1999-01-01',
    university: '981a4e97-d597-4c37-bbd3-ff63a39f935d',
    isEmailVerified: true,
    dateJoined: '2023-01-15T10:00:00.000Z',
    isActive: true,
  },
  {
    id: 'user2',
    name: 'Maria Garcia',
    email: 'maria.g@example.com',
    avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar2')?.imageUrl ?? '',
    bio: 'Biology enthusiast and future doctor. My notes are detailed and visually organized to help with memorization.',
    expertise: ['Biology', 'Organic Chemistry', 'Anatomy'],
    username: 'mariag',
    phoneNumber: '1234567890',
    dateOfBirth: '1999-01-01',
    university: '981a4e97-d597-4c37-bbd3-ff63a39f935d',
    isEmailVerified: true,
    dateJoined: '2023-01-15T10:00:00.000Z',
    isActive: true,
  },
  {
    id: 'user3',
    name: 'Chen Wei',
    email: 'chen.w@example.com',
    avatarUrl: PlaceHolderImages.find(p => p.id === 'avatar3')?.imageUrl ?? '',
    bio: 'History and Political Science student. I focus on creating timelines and narrative-driven content to understand the past.',
    expertise: ['World History', 'Political Theory', 'Economics'],
    username: 'chenw',
    phoneNumber: '1234567890',
    dateOfBirth: '1999-01-01',
    university: '981a4e97-d597-4c37-bbd3-ff63a39f935d',
    isEmailVerified: true,
    dateJoined: '2023-01-15T10:00:00.000Z',
    isActive: true,
  },
];

const reviews: Review[] = [
  {
    id: 'review1',
    userId: 'user2',
    rating: 5,
    comment: 'These notes were a lifesaver! So well organized and easy to follow. I finally understood the concepts I was struggling with.',
    createdAt: '2024-05-20T14:30:00.000Z',
  },
  {
    id: 'review2',
    userId: 'user3',
    rating: 4,
    comment: 'Really great study guide. It covered all the main topics for the final. A few more examples would have made it perfect.',
    createdAt: '2024-05-21T10:00:00.000Z',
  }
];


export async function getContributions(): Promise<Contribution[]> {
  try {
    const response = await fetch(`${BASE_URL}/api/contributions/all-contributions/`);
    if (!response.ok) {
      throw new Error('Failed to fetch contributions');
    }
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching contributions:", error);
    return [];
  }
}

export async function getContributionById(id: string, accessToken?: string): Promise<Contribution | undefined> {
  try {
    const headers: HeadersInit = {};
    // The user-specific endpoint is for *editing* and requires the contribution ID.
    const url = `${BASE_URL}/api/contributions/contributions/${id}/`;
    
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, { headers, cache: 'no-store' });

    if (response.status === 404) {
        return undefined;
    }
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Failed to fetch contribution with id ${id}`, errorData);
      throw new Error(`Failed to fetch contribution with id ${id}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching contribution ${id}:`, error);
    return undefined;
  }
}

export async function getEnrollmentById(id: string, accessToken: string): Promise<Enrollment | undefined> {
    try {
        const response = await fetch(`${BASE_URL}/api/enrollment/detail/${id}/`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            cache: 'no-store'
        });
        if (response.status === 404) {
            return undefined;
        }
        if (!response.ok) {
            throw new Error(`Failed to fetch enrollment with id ${id}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching enrollment ${id}:`, error);
        return undefined;
    }
}


export async function getUserById(id: string): Promise<User | undefined> {
  return Promise.resolve(users.find((u) => u.id === id));
}

export async function getReviewsForContribution(contributionId: string): Promise<(Review & { user: User | undefined })[]> {
  // In a real app, you would fetch reviews for the specific contributionId.
  // For now, we return dummy reviews with user data.
  const populatedReviews = reviews.map(review => ({
    ...review,
    user: users.find(u => u.id === review.userId),
  }));
  return Promise.resolve(populatedReviews);
}
