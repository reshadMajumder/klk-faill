
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { createContribution } from './actions';
import type { University, Department } from './actions';
import { useAuth } from '@/context/auth-context';


const contributionSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long.'),
  description: z.string().min(10, 'Description must be at least 10 characters long.'),
  price: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().min(0, 'Price must be a positive number.')
  ),
  course_code: z.string().optional(),
  thumbnail_image: z.string().url('Please enter a valid URL for the thumbnail image.'),
  related_University: z.string().uuid('Please select a university.'),
  department: z.string().uuid('Please select a department.'),
});

type ContributionFormValues = z.infer<typeof contributionSchema>;

export function NewContributionForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { tokens } = useAuth();
  const [universities, setUniversities] = useState<University[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContributionFormValues>({
    resolver: zodResolver(contributionSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0.0,
      course_code: '',
      thumbnail_image: '',
    },
  });

  useEffect(() => {
    async function fetchUniversities() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/institutions/universities/`);
        if (!response.ok) throw new Error('Failed to fetch universities');
        const data = await response.json();
        setUniversities(data);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error fetching data',
          description: 'Could not load universities.',
        });
      }
    }
    fetchUniversities();
  }, [toast]);

  const handleUniversityChange = (universityId: string) => {
    const selectedUniversity = universities.find(u => u.id === universityId);
    setDepartments(selectedUniversity?.departments || []);
    form.setValue('department', '' as any); // Reset department on university change
  };

  const onSubmit: SubmitHandler<ContributionFormValues> = async (data) => {
    if (!tokens?.access) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to create a contribution.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createContribution(data, tokens.access);

      toast({
        title: 'Contribution Created!',
        description: 'Your contribution has been successfully submitted.',
      });
      router.push('/profile');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 'Calculus 101 Final Exam Study Guide'" {...field} />
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
                <Textarea placeholder="Describe what this contribution covers..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} value={field.value ?? '0.00'} />
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
                  <Input placeholder="e.g., 'MATH101'" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="thumbnail_image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thumbnail Image URL</FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://example.com/image.jpg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="related_University"
            render={({ field }) => (
              <FormItem>
                <FormLabel>University</FormLabel>
                <Select onValueChange={(value) => {
                  field.onChange(value);
                  handleUniversityChange(value);
                }} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your university" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {universities.map(uni => <SelectItem key={uni.id} value={uni.id}>{uni.name}</SelectItem>)}
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
                <Select onValueChange={field.onChange} value={field.value} disabled={departments.length === 0}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a department" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {departments.map(dep => <SelectItem key={dep.id} value={dep.id}>{dep.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Contribution
          </Button>
        </div>
      </form>
    </Form>
  );
}
