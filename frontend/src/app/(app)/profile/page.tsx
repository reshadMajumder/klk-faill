
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/api';
import { Loader2, Eye, Library, MessageSquare, Star } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { authFetch } from '@/lib/auth';
import { ChangePasswordForm } from '@/components/profile/change-password-form';

const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email address').optional(),
  profile_picture_url: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  profile_picture_file: z.any().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

type UserStats = {
  total_views: number;
  total_contributions: number;
  total_contribution_comments: number;
  total_contribution_ratings: number;
};

export default function ProfilePage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [stats, setStats] = useState<UserStats | null>(null);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      username: '',
      email: '',
      profile_picture_url: '',
    },
  });

  const profilePictureUrl = form.watch('profile_picture_url');
  const firstName = form.watch('first_name');

  const getFullImageUrl = (path: string | null | undefined) => {
    if (!path) return undefined;
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}${path}`;
  };

  useEffect(() => {
    async function fetchProfileData() {
      try {
        const [profileData, statsData] = await Promise.all([
          authFetch('/api/accounts/user-profile/'),
          authFetch('/api/user/stats/')
        ]);
        
        form.reset({
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          username: profileData.username,
          email: profileData.email,
          profile_picture_url: profileData.profile_picture || '',
        });
        setStats(statsData);

      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Authentication Error',
          description: 'Could not load your profile data. Please log in again.',
        });
      } finally {
        setIsFetching(false);
      }
    }

    fetchProfileData();
  }, [form, toast]);

  async function onSubmit(values: ProfileFormValues) {
    setIsLoading(true);

    const formData = new FormData();
    formData.append('first_name', values.first_name);
    formData.append('last_name', values.last_name);
    formData.append('username', values.username);
    
    if (values.profile_picture_file && values.profile_picture_file[0]) {
      formData.append('profile_picture', values.profile_picture_file[0]);
    }

    try {
      const responseData = await authFetch('/api/accounts/user-profile/', {
        method: 'PUT',
        body: formData,
      });

      toast({
        title: 'Success!',
        description: 'Your profile has been updated successfully.',
      });
      
      form.reset({
        ...form.getValues(),
        first_name: responseData.first_name || '',
        last_name: responseData.last_name || '',
        username: responseData.username,
        profile_picture_url: responseData.profile_picture || '',
      });

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const statItems = [
    { title: "Total Views", value: stats?.total_views, icon: <Eye className="h-5 w-5 text-muted-foreground" /> },
    { title: "Contributions", value: stats?.total_contributions, icon: <Library className="h-5 w-5 text-muted-foreground" /> },
    { title: "Comments", value: stats?.total_contribution_comments, icon: <MessageSquare className="h-5 w-5 text-muted-foreground" /> },
    { title: "Ratings Given", value: stats?.total_contribution_ratings, icon: <Star className="h-5 w-5 text-muted-foreground" /> },
  ];

  if (isFetching) {
    return (
      <div className="container mx-auto space-y-8">
        <PageHeader title="Profile Settings" description="Manage your account details." />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({length: 4}).map((_, index) => (
                <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-5 w-5" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-1/3" />
                    </CardContent>
                </Card>
            ))}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Your Information</CardTitle>
            <CardDescription>View and edit your personal details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="flex-grow space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-full" />
                </div>
             </div>
             <Skeleton className="h-10 w-full" />
             <Skeleton className="h-10 w-full" />
             <Skeleton className="h-10 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-24" />
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto space-y-8">
      <PageHeader title="Profile Settings" description="Manage your account details." />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statItems.map((item) => (
          <Card key={item.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
              {item.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {item.value !== undefined ? item.value : <Skeleton className="h-8 w-10" />}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
                <CardHeader>
                <CardTitle>Your Information</CardTitle>
                <CardDescription>View and edit your personal details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={getFullImageUrl(profilePictureUrl) || undefined} />
                            <AvatarFallback>{firstName?.charAt(0).toUpperCase() || '?'}</AvatarFallback>
                        </Avatar>
                        <FormField
                            control={form.control}
                            name="profile_picture_file"
                            render={({ field }) => (
                                <FormItem className="flex-grow w-full">
                                <FormLabel>Update Profile Picture</FormLabel>
                                <FormControl>
                                    <Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files)} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="first_name"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                <Input placeholder="Your first name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="last_name"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                <Input placeholder="Your last name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
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
                    name="email"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                        <Input placeholder="your.email@example.com" {...field} disabled />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                </CardContent>
                <CardFooter>
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
                </CardFooter>
            </Card>
            </form>
        </Form>
      </div>

      <div className="md:col-span-1">
        <ChangePasswordForm />
      </div>

    </div>
    </div>
  );
}
