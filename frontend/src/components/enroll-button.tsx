
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { authFetch } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

type EnrollButtonProps = {
  contributionId: string;
};

export function EnrollButton({ contributionId }: EnrollButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // Simple check if user might be logged in.
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);

    // TODO: A more robust check would be to see if the user is already enrolled in this course
    // This would require an endpoint like /api/enrollment/status?contributionId=...
  }, []);

  const handleEnroll = async () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    setIsLoading(true);
    try {
      await authFetch('/api/enrollment/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contribution: contributionId,
        }),
      });
      
      toast({
        title: 'Success!',
        description: "You have successfully enrolled in this contribution.",
      });
      setIsEnrolled(true);

    } catch (error: any) {
      console.error('Enrollment failed', error);
      toast({
        variant: 'destructive',
        title: 'Enrollment Failed',
        description: error.message || 'Could not enroll in this contribution.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isEnrolled) {
    return (
        <Button size="lg" className="w-full" disabled>
            <CheckCircle className="mr-2 h-4 w-4" />
            Enrolled
        </Button>
    );
  }

  return (
    <Button size="lg" className="w-full" onClick={handleEnroll} disabled={isLoading}>
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
