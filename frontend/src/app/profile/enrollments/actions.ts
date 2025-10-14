
'use server';

import type { Contribution } from '@/lib/types';

export interface Enrollment {
  id: string;
  user: number;
  contribution: Contribution;
  enrolled_at: string;
}

export async function fetchEnrollments(accessToken: string): Promise<Enrollment[]> {
  const fetchUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/enrollment/list/`;
  
  try {
    const response = await fetch(fetchUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch enrollments from ${fetchUrl}`);
    }
    
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error("Error in fetchEnrollments server action:", error);
    return [];
  }
}
