
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { enrollInContribution } from './actions';

export function EnrollButton({ contributionId }: { contributionId: string }) {
  const { tokens, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleEnroll = async () => {
    if (!isAuthenticated || !tokens?.access) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    try {
      await enrollInContribution(contributionId, tokens.access);
      toast({
        title: 'Enrollment Successful!',
        description: "You have been enrolled in this contribution.",
      });
      // Optionally, you can redirect or refresh the page
      router.refresh();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Enrollment Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleEnroll} disabled={isLoading} size="lg" className="w-full md:w-auto">
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Enrolling...
        </>
      ) : (
        'Enroll Now'
      )}
    </Button>
  );
}
