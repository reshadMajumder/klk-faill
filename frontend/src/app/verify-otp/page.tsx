
'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/logo';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

const otpSchema = z.object({
  otp: z.string().min(4, 'OTP must be at least 4 characters.'),
});

type OtpFormValues = z.infer<typeof otpSchema>;

function VerifyOtpComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  });
  
  if (!email) {
    // maybe redirect to signup or show an error
    return (
        <div className="flex items-center justify-center py-12 px-4 h-full">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Error</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>No email address provided. Please sign up first.</p>
                </CardContent>
            </Card>
        </div>
    )
  }

  const onSubmit: SubmitHandler<OtpFormValues> = async (data) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/accounts/verify-otp/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, otp: data.otp }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Something went wrong');
      }

      if (result.access && result.refresh) {
        localStorage.setItem('authTokens', JSON.stringify({ access: result.access, refresh: result.refresh }));

        toast({
          title: 'Account Verified!',
          description: 'You are now logged in.',
        });
        
        // Redirect to home page, AuthProvider will handle user state.
        router.push('/');
        // Force a refresh to ensure layout and auth state are updated.
        router.refresh(); 
      } else {
        throw new Error('Verification successful, but no tokens were provided.');
      }

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: error.message || 'Invalid or expired OTP.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center py-12 px-4 h-full">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Logo />
          </div>
          <CardTitle className="font-headline text-2xl">Verify Your Account</CardTitle>
          <CardDescription>
            An OTP has been sent to <strong>{email}</strong>. Please enter it below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>One-Time Password (OTP)</FormLabel>
                    <FormControl>
                      <Input placeholder="1234" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Verify Account
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyOtpPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyOtpComponent />
        </Suspense>
    )
}
