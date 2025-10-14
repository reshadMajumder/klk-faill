
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { fetchEnrollments, type Enrollment } from './actions';
import { ContributionCard } from '@/components/contribution-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function MyEnrollmentsPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading, tokens } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthLoading, isAuthenticated, router]);

  const loadEnrollments = useCallback(async () => {
    if (tokens?.access) {
      setIsLoading(true);
      try {
        const data = await fetchEnrollments(tokens.access);
        setEnrollments(data);
      } catch (error) {
        console.error('Failed to fetch enrollments', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load your enrollments.',
        });
      } finally {
        setIsLoading(false);
      }
    }
  }, [tokens, toast]);

  useEffect(() => {
    if (isAuthenticated) {
      loadEnrollments();
    }
  }, [isAuthenticated, loadEnrollments]);

  if (isAuthLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        <header className="mb-8">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-4 w-2/3 mt-2" />
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-80 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="mb-8">
        <h1 className="font-headline text-4xl font-bold tracking-tight">
          My Enrollments
        </h1>
        <p className="text-muted-foreground mt-2">
          The contributions you are currently enrolled in.
        </p>
      </header>
      
      {enrollments.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {enrollments.map(enrollment => (
            <ContributionCard 
              key={enrollment.id} 
              contribution={enrollment.contribution} 
              enrollmentId={enrollment.id}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
            <h3 className="font-headline text-2xl mb-2">No Enrollments Yet</h3>
            <p className="text-muted-foreground mb-4">You haven't enrolled in any contributions.</p>
            <Button asChild>
                <Link href="/contributions">Explore Contributions</Link>
            </Button>
        </div>
      )}
    </div>
  );
}
