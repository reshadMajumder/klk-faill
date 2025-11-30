'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Progress } from '@/components/ui/progress';
import { authFetch } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { getFullImageUrl, type ApiContribution } from '@/lib/data';
import { ContributionCard } from '../contribution-card';
import { Skeleton } from '../ui/skeleton';

type Enrollment = {
  id: string;
  user: number;
  contribution: ApiContribution;
  enrolled_at: string;
};

export function MyEnrollments() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchEnrollments() {
      try {
        const response = await authFetch('/api/enrollment/list/');
        setEnrollments(response.data);
      } catch (error: any) {
        console.error('Failed to fetch enrollments', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'Could not load your enrollments.',
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchEnrollments();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
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

  if (enrollments.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <p className="text-muted-foreground">You are not enrolled in any contributions yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {enrollments.map((enrollment) => (
        <ContributionCard key={enrollment.id} contribution={enrollment.contribution} enrollmentId={enrollment.id} />
      ))}
    </div>
  );
}
