
import { Suspense } from 'react';
import type { ApiContribution } from '@/lib/data';
import { API_BASE_URL } from '@/lib/api';
import { ContributionsContent } from '@/components/contributions-content';

type ApiResponse = {
  results: ApiContribution[];
  next: string | null;
  previous: string | null;
  count: number;
};

async function fetchContributions(query: string): Promise<ApiResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/contributions/all-contributions/?${query}`, { cache: 'no-store' });
    if (!res.ok) {
      console.error("Failed to fetch contributions:", res.status, res.statusText);
      return { results: [], next: null, previous: null, count: 0 };
    }
    return res.json();
  } catch (error) {
    console.error("Error fetching contributions:", error);
    return { results: [], next: null, previous: null, count: 0 };
  }
}

export default async function ContributionsPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const sanitizedSearchParams = searchParams ? JSON.parse(JSON.stringify(searchParams)) : {};
  const params = new URLSearchParams(sanitizedSearchParams as Record<string, string>);

  if (!params.has('page')) {
    params.set('page', '1');
  }
  const initialContributions = await fetchContributions(params.toString());

  return (
    <Suspense fallback={<div className="container mx-auto text-center">Loading contributions...</div>}>
      <ContributionsContent initialData={initialContributions} />
    </Suspense>
  );
}
