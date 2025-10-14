
'use server';

import type { Contribution } from '@/lib/types';

interface PaginatedUserContributions {
  contributions: Contribution[];
  next: string | null;
  previous: string | null;
  count: number;
}


export async function fetchUserContributions(accessToken: string, url?: string): Promise<PaginatedUserContributions> {
  const fetchUrl = url || `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/contributions/contributions/user/`;
  
  try {
    const response = await fetch(fetchUrl, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch user contributions from ${fetchUrl}`);
    }
    const data = await response.json();
    return {
      contributions: data.results,
      next: data.next,
      previous: data.previous,
      count: data.count,
    };
  } catch (error) {
    console.error("Error in fetchUserContributions server action:", error);
    return { contributions: [], next: null, previous: null, count: 0 };
  }
}
