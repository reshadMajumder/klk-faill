
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ContributionCard } from "@/components/contribution-card";
import { PageHeader } from "@/components/page-header";
import type { ApiContribution } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { ContributionFilters } from '@/components/contribution-filters';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/lib/api';

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

export function ContributionsContent({ initialData }: { initialData: ApiResponse }) {
  const [data, setData] = useState<ApiResponse>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const query = searchParams.toString();
    fetchContributions(query).then(newData => {
        setData(newData);
        setIsLoading(false);
    });
  }, [searchParams]);

  const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const params = new URLSearchParams(searchParams.toString());
      if (searchTerm) {
        params.set('search', searchTerm);
      } else {
        params.delete('search');
      }
      params.delete('page');
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  const handlePageChange = (url: string | null) => {
    if (!url) return;
    const pageQuery = url.split('?')[1];
    if (pageQuery) {
        router.push(`${pathname}?${pageQuery}`);
    }
  };

  const contributions = data.results;

  return (
    <div className="container mx-auto">
      <PageHeader 
        title="Explore Contributions"
        description="Find your next learning adventure from our extensive library."
      >
        {isClient && (
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
            <div className="relative w-full flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by title or course code..." 
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>
            <ContributionFilters />
          </div>
        )}
      </PageHeader>
      
      {isLoading ? (
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="rounded-lg overflow-hidden border">
                    <Skeleton className="h-40 w-full" />
                    <div className="p-4 space-y-3">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-1/2" />
                        <div className="flex justify-between items-center pt-2">
                           <Skeleton className="h-6 w-16" />
                           <Skeleton className="h-6 w-12" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
      ) : contributions.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {contributions.map((contribution) => (
              <ContributionCard key={contribution.id} contribution={contribution} />
            ))}
          </div>
          <div className="flex justify-center items-center gap-4 mt-12">
            <Button 
              onClick={() => handlePageChange(data.previous)} 
              disabled={!data.previous}
              variant="outline"
            >
              Previous
            </Button>
             <span className="text-sm text-muted-foreground">
                Page {new URLSearchParams(searchParams).get('page') || '1'}
             </span>
            <Button 
              onClick={() => handlePageChange(data.next)} 
              disabled={!data.next}
              variant="outline"
            >
              Next
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center py-20 bg-muted rounded-lg">
            <h3 className="text-xl font-semibold">No Contributions Found</h3>
            <p className="text-muted-foreground mt-2">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
}
