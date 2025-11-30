
'use client';

import { useState, useEffect } from 'react';
import { ContributionCard } from '@/components/contribution-card';
import { authFetch } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { type ApiContribution } from '@/lib/data';
import { Skeleton } from '../ui/skeleton';

type ApiResponse = {
    message: string;
    data: ApiContribution[];
};


export function MyContributions() {
  const [contributions, setContributions] = useState<ApiContribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchMyContributions() {
        setIsLoading(true);
        try {
            const response: ApiResponse = await authFetch('/api/contributions/user/');
            setContributions(response.data || []);
        } catch (error: any) {
            console.error('Failed to fetch user contributions', error);
            toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message || 'Could not load your contributions.',
            });
        } finally {
            setIsLoading(false);
        }
    }
    
    fetchMyContributions();
  }, [toast]);


  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
           <div key={index} className="space-y-2">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
        ))}
      </div>
    );
  }

  return (
    <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {contributions.length > 0 ? (
            contributions.map((contribution) => (
            <ContributionCard key={contribution.id} contribution={contribution} showManagementActions={true} />
            ))
        ) : (
            <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">You haven't created any contributions yet.</p>
            </div>
        )}
        </div>
    </>
  );
}
