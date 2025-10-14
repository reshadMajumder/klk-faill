
'use server';

import type { Contribution } from '@/lib/types';

interface PaginatedContributions {
  contributions: Contribution[];
  next: string | null;
  previous: string | null;
  count: number;
}

export interface ContributionFilters {
    title?: string;
    university?: string;
    department?: string;
}

export async function fetchContributions(url?: string, filters?: ContributionFilters): Promise<PaginatedContributions> {
  let fetchUrl: URL;

  if (url) {
    fetchUrl = new URL(url);
  } else {
    fetchUrl = new URL(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/contributions/all-contributions/`);
  }
  
  // Add filters to the URL if provided
  if (filters) {
    if (filters.title) fetchUrl.searchParams.set('title__icontains', filters.title);
    if (filters.university) fetchUrl.searchParams.set('related_University', filters.university);
    if (filters.department) fetchUrl.searchParams.set('department', filters.department);
  }

  try {
    const response = await fetch(fetchUrl.toString());
    if (!response.ok) {
      throw new Error(`Failed to fetch contributions from ${fetchUrl}`);
    }
    const data = await response.json();
    return {
      contributions: data.results,
      next: data.next,
      previous: data.previous,
      count: data.count,
    };
  } catch (error) {
    console.error("Error in fetchContributions server action:", error);
    return { contributions: [], next: null, previous: null, count: 0 };
  }
}
