'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Logo } from '@/components/logo';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const signupSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  email: z.string().email('Please enter a valid email.'),
  password: z.string().min(8, 'Password must be at least 8 characters long.'),
  university: z.string().min(1, 'Please select a university.'),
});

type SignupFormValues = z.infer<typeof signupSchema>;

interface University {
  id: string;
  name: string;
}

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [universities, setUniversities] = useState<University[]>([]);

  useEffect(() => {
    async function fetchUniversities() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/institutions/universities/`);
        if (!response.ok) {
          throw new Error('Failed to fetch universities');
        }
        const data = await response.json();
        setUniversities(data);
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Could not load universities',
          description: 'There was an issue fetching the list of universities. Please try refreshing the page.',
        });
      }
    }
    fetchUniversities();
  }, [toast]);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      first_name: '',
      email: '',
      password: '',
      university: '',
    },
  });

  const onSubmit: SubmitHandler<SignupFormValues> = async (data) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/accounts/register/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        // The API might return errors in different formats
        let errorMessage = 'Something went wrong';
        if (typeof result.detail === 'string') {
          errorMessage = result.detail;
        } else if (result.email && Array.isArray(result.email)) {
          errorMessage = result.email[0];
        } else {
          errorMessage = JSON.stringify(result);
        }
        throw new Error(errorMessage);
      }

      toast({
        title: 'Success!',
        description: `An OTP has been sent to ${data.email}.`,
      });
      router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 h-full">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Logo />
          </div>
          <CardTitle className="font-headline text-2xl">Create an Account</CardTitle>
          <CardDescription>
            Join the community and start swapping knowledge.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="m@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="university"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>University</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your university" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {universities.length > 0 ? (
                          universities.map((uni) => (
                            <SelectItem key={uni.id} value={uni.id}>
                              {uni.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="loading" disabled>
                            Loading universities...
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Account
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
