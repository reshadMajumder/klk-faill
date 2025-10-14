
'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ContributionCard } from '@/components/contribution-card';
import { useAuth } from '@/context/auth-context';
import type { Contribution } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { fetchUserContributions } from './actions';


const profileFormSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters long.'),
  phone_number: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, tokens, refetchUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [userContributions, setUserContributions] = useState<Contribution[]>([]);
  const [contributionsLoading, setContributionsLoading] = useState(true);
  const [currentContributionsUrl, setCurrentContributionsUrl] = useState<string | undefined>(undefined);
  const [nextContributionsUrl, setNextContributionsUrl] = useState<string | null>(null);
  const [prevContributionsUrl, setPrevContributionsUrl] = useState<string | null>(null);


  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: '',
      phone_number: '',
    },
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const loadContributions = useCallback(async (url?: string) => {
    if (tokens?.access) {
      setContributionsLoading(true);
      try {
        const { contributions, next, previous } = await fetchUserContributions(tokens.access, url);
        setUserContributions(contributions);
        setNextContributionsUrl(next);
        setPrevContributionsUrl(previous);
      } catch (error) {
          console.error('Failed to fetch user contributions', error);
          toast({
              variant: 'destructive',
              title: 'Error',
              description: 'Could not load your contributions.'
          })
      } finally {
          setContributionsLoading(false);
      }
    }
  }, [tokens, toast]);

  useEffect(() => {
    if (user) {
      // Populate form with user data
      form.reset({
        username: user.username,
        phone_number: user.phoneNumber || '',
      });
    }
    // Initial load of contributions
    if (tokens?.access) {
      loadContributions(currentContributionsUrl);
    }
  }, [user, tokens, form, loadContributions, currentContributionsUrl]);

    const handleContributionsPageChange = (url: string | null) => {
        if (url) {
            setCurrentContributionsUrl(url);
        }
    };
  
  const onProfileUpdate: SubmitHandler<ProfileFormValues> = async (data) => {
    if (!tokens) {
        toast({ variant: 'destructive', title: 'Authentication Error', description: 'You are not logged in.' });
        return;
    }
    
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/accounts/user-profile/`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokens.access}`
                },
                body: JSON.stringify(data)
            }
        );
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Failed to update profile.");
        }
        
        toast({ title: 'Profile Updated', description: 'Your information has been saved successfully.' });
        refetchUser(); // refetch user data to show updated info

    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
    }
  };

  const profileHeaderImage = PlaceHolderImages.find(p => p.id === 'profileHeader');

  if (isLoading || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-48 w-full" />
        <div className="flex items-end gap-4 -mt-16">
          <Skeleton className="h-32 w-32 rounded-full border-4 border-background" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
          </div>
        </div>
        <Skeleton className="mt-6 h-24 w-full" />
        <Skeleton className="mt-8 h-96 w-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="relative h-48 md:h-64 w-full">
        {profileHeaderImage && (
          <Image
            src={profileHeaderImage.imageUrl}
            alt="Profile header"
            fill
            className="object-cover"
            data-ai-hint={profileHeaderImage.imageHint}
            unoptimized
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>
      <div className="container mx-auto px-4 -mt-16 sm:-mt-20 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback className="text-4xl">{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="py-2">
            <h1 className="font-headline text-3xl sm:text-4xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground">User since {new Date(user.dateJoined).toLocaleDateString()}</p>
          </div>
        </div>
        
        <Tabs defaultValue="contributions" className="mt-8">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="contributions">My Contributions</TabsTrigger>
            <TabsTrigger value="settings">Profile Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="contributions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Your Contributions</CardTitle>
                <CardDescription>
                  Here are the study guides you've shared with the community.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {contributionsLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-64 w-full" />
                    ))}
                  </div>
                ) : userContributions.length > 0 ? (
                  <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userContributions.map(contribution => (
                      <ContributionCard key={contribution.id} contribution={contribution} showEditButton={true} />
                    ))}
                  </div>
                  <div className="flex justify-center items-center gap-4 mt-12">
                        {prevContributionsUrl && (
                        <Button onClick={() => handleContributionsPageChange(prevContributionsUrl)} disabled={contributionsLoading}>
                            {contributionsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Previous
                        </Button>
                        )}
                        {nextContributionsUrl && (
                        <Button onClick={() => handleContributionsPageChange(nextContributionsUrl)} disabled={contributionsLoading}>
                            {contributionsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Next
                        </Button>
                        )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                      <p className="text-muted-foreground mb-4">You haven't made any contributions yet.</p>
                      <div className="flex justify-center gap-4">
                        <Button asChild variant="outline">
                            <Link href="/contributions">Explore Contributions</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/contributions/new">Create Contribution</Link>
                        </Button>
                      </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Profile Settings</CardTitle>
                <CardDescription>
                  Update your personal information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onProfileUpdate)} className="space-y-6 max-w-lg">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Your username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Your phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="space-y-2">
                        <FormLabel>Email</FormLabel>
                        <Input defaultValue={user.email} disabled />
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                          {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Save Changes
                        </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
