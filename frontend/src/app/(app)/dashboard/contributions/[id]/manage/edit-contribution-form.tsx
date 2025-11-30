
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { authFetch } from '@/lib/auth';
import { ApiContributionDetail } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { getFullImageUrl } from '@/lib/data';
import { updateContribution, API_BASE_URL } from '@/lib/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

type Department = {
  id: string;
  name: string;
};

type University = {
  id: string;
  name: string;
  departments: Department[];
};

const editContributionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  course_code: z.string().optional(),
  related_University: z.string().min(1, 'University is required'),
  department: z.string().min(1, 'Department is required'),
  thumbnail_image: z.any().optional(),
  active: z.boolean(),
});

type EditContributionFormValues = z.infer<typeof editContributionSchema>;

export function EditContributionForm({ contributionId }: { contributionId: string }) {
  const { toast } = useToast();
  const router = useRouter();
  const id = contributionId;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [contribution, setContribution] = useState<ApiContributionDetail | null>(null);
  const [universities, setUniversities] = useState<University[]>([]);

  const form = useForm<EditContributionFormValues>({
    resolver: zodResolver(editContributionSchema),
    defaultValues: {
      active: true,
    }
  });
  
  const selectedUniversityId = form.watch('related_University');

  const departmentsForSelectedUniversity = useMemo(() => {
    const selectedUni = universities.find(uni => uni.id === selectedUniversityId);
    return selectedUni ? selectedUni.departments : [];
  }, [selectedUniversityId, universities]);


  useEffect(() => {
    async function fetchUniversities() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/institutions/universities/`);
        if (!response.ok) {
          throw new Error('Failed to fetch universities');
        }
        const data = await response.json();
        setUniversities(data);
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load university data.',
        });
      }
    }
    
    async function fetchContribution() {
      if (!id) return;
      try {
        const responseData = await authFetch(`/api/contributions/user/${id}/details/`);
        const data = responseData.data;
        setContribution(data);
        form.reset({
          title: data.title,
          description: data.description,
          course_code: data.course_code || '',
          related_University: data.related_University?.id || '',
          department: data.department?.id || '',
          active: data.active,
        });
      } catch (error) {
        console.error('Failed to fetch contribution', error);
         toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not load your contribution data. You may not have permission or it may have been deleted.',
        });
      } finally {
        setIsFetching(false);
      }
    }

    fetchUniversities();
    fetchContribution();
  }, [id, form, toast]);

  async function onSubmit(values: EditContributionFormValues) {
    setIsLoading(true);

    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('description', values.description);
    formData.append('price', "0.00");
    formData.append('course_code', values.course_code || '');
    formData.append('related_University', values.related_University);
    formData.append('department', values.department);
    formData.append('active', String(values.active));

    if (values.thumbnail_image && values.thumbnail_image[0]) {
      formData.append('thumbnail_image', values.thumbnail_image[0]);
    }
    
    try {
      await updateContribution(id, formData);
      
      toast({
        title: 'Success!',
        description: 'Your contribution has been updated successfully.',
      });
      
      router.push('/dashboard/my-contributions');
      router.refresh();

    } catch (error: any) {
       const errorMessages = error.data ? Object.values(error.data).flat().join(' ') : (error.message || 'An error occurred.');
       toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: errorMessages,
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isFetching) {
    return (
        <Card className="max-w-3xl mx-auto">
            <CardHeader>
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent className="grid gap-6">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-10 w-full" />
                </div>
                 <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-20 w-full" />
                </div>
            </CardContent>
            <CardFooter>
                 <Skeleton className="h-10 w-32" />
            </CardFooter>
        </Card>
    );
  }

  if (!contribution) {
    return (
        <div className="text-center text-muted-foreground">
            Could not load contribution data. It might have been deleted or you do not have permission to view it.
        </div>
    );
  }
  
  const currentThumbnail = getFullImageUrl(contribution.thumbnail_image);

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>Edit Details</CardTitle>
              <CardDescription>
                Make changes to your contribution's core information below.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Advanced Calculus Cheat Sheet" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Provide a brief summary..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                  control={form.control}
                  name="course_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Code (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., SE222" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

               <div className="grid sm:grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="related_University"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>University</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={universities.length === 0 || isLoading}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a university" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {universities.map(uni => (
                              <SelectItem key={uni.id} value={uni.id}>{uni.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} disabled={!selectedUniversityId || departmentsForSelectedUniversity.length === 0 || isLoading}>
                            <FormControl>
                              <SelectTrigger>
                                  <SelectValue placeholder="Select a department" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {departmentsForSelectedUniversity.map(dept => (
                                <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                  />
              </div>

              <div className="grid gap-4">
                  <div>
                    <FormLabel>Current Thumbnail</FormLabel>
                    <div className="mt-2">
                        <Image src={currentThumbnail} alt="Current thumbnail" width={200} height={150} className="rounded-md object-cover" />
                    </div>
                  </div>
                <FormField
                    control={form.control}
                    name="thumbnail_image"
                    render={({ field: { onChange, value, ...rest }}) => (
                        <FormItem>
                        <FormLabel>Upload New Thumbnail</FormLabel>
                        <FormControl>
                            <Input type="file" accept="image/*" {...rest} onChange={(e) => onChange(e.target.files)} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
              </div>
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Active Status</FormLabel>
                      <CardDescription>
                        Make this contribution visible and enrollable to others.
                      </CardDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => router.push('/dashboard/my-contributions')}>Cancel</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
  );
}

    