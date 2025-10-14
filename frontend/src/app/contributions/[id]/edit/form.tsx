
"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2 } from 'lucide-react';
import type { Contribution } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import type { University, Department } from '@/app/contributions/new/actions';
import { updateContribution } from './actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const tagSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Tag name cannot be empty.'),
});

const videoSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Video title cannot be empty.'),
  video_file: z.string().url('Please enter a valid URL.'),
});

const noteSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Note title cannot be empty.'),
  note_file: z.string().url('Please enter a valid URL.'),
});

const contributionEditSchema = z.object({
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
  tags: z.array(z.object({ name: z.string() })).optional(),
  videos: z.array(videoSchema).optional(),
  notes: z.array(noteSchema).optional(),
});

export type ContributionEditFormValues = z.infer<typeof contributionEditSchema>;


export function EditContributionForm({ contribution }: { contribution: Contribution }) {
  const router = useRouter();
  const { toast } = useToast();
  const { tokens } = useAuth();
  const [universities, setUniversities] = useState<University[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContributionEditFormValues>({
    resolver: zodResolver(contributionEditSchema),
    defaultValues: {
      title: contribution.title,
      description: contribution.description,
      price: parseFloat(contribution.price),
      course_code: contribution.course_code || '',
      thumbnail_image: contribution.thumbnail_image,
      related_University: contribution.related_University.id,
      department: contribution.department.id,
      tags: contribution.tags.map(t => ({ name: t.name })),
      videos: contribution.videos.map(v => ({ id: v.id, title: v.title, video_file: v.video_file })),
      notes: contribution.notes.map(n => ({ id: n.id, title: n.title, note_file: n.note_file })),
    },
  });

  const { fields: tagFields, append: appendTag, remove: removeTag } = useFieldArray({ control: form.control, name: "tags" });
  const { fields: videoFields, append: appendVideo, remove: removeVideo } = useFieldArray({ control: form.control, name: "videos" });
  const { fields: noteFields, append: appendNote, remove: removeNote } = useFieldArray({ control: form.control, name: "notes" });

  useEffect(() => {
    async function fetchUniversities() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/institutions/universities/`);
        if (!response.ok) throw new Error('Failed to fetch universities');
        const data = await response.json();
        setUniversities(data);
        
        const selectedUniversity = data.find((u: University) => u.id === contribution.related_University.id);
        if (selectedUniversity) {
          setDepartments(selectedUniversity.departments || []);
        }

      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error fetching data',
          description: 'Could not load universities.',
        });
      }
    }
    fetchUniversities();
    
  }, [contribution, toast]);

  const handleUniversityChange = (universityId: string) => {
    const selectedUniversity = universities.find(u => u.id === universityId);
    setDepartments(selectedUniversity?.departments || []);
    form.setValue('department', '' as any);
  };

  const onSubmit: SubmitHandler<ContributionEditFormValues> = async (data) => {
    if (!tokens?.access) {
      toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await updateContribution(contribution.id, data, tokens.access);

      toast({
        title: 'Contribution Updated!',
        description: 'Your changes have been saved.',
      });
      router.push('/profile');
      router.refresh();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
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

        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
            <CardDescription>Add keywords to help others find your contribution.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {tagFields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-2">
                <FormField
                  control={form.control}
                  name={`tags.${index}.name`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                       <FormLabel className="sr-only">Tag Name</FormLabel>
                       <FormControl>
                         <Input {...field} placeholder="e.g., 'Finals'" />
                       </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeTag(index)} className="mt-2">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => appendTag({ name: '' })}>
              Add Tag
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Videos</CardTitle>
            <CardDescription>Link to video materials.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {videoFields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-md space-y-4 relative">
                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeVideo(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <FormField
                      control={form.control}
                      name={`videos.${index}.title`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Video Title</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Video title" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                   <FormField
                      control={form.control}
                      name={`videos.${index}.video_file`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Video URL</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://example.com/video.mp4" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => appendVideo({ title: '', video_file: '' })}>
              Add Video
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
            <CardDescription>Link to written notes or documents.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {noteFields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-md space-y-4 relative">
                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeNote(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <FormField
                      control={form.control}
                      name={`notes.${index}.title`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Note Title</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Note title" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                   <FormField
                      control={form.control}
                      name={`notes.${index}.note_file`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Note URL</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://example.com/notes.pdf" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => appendNote({ title: '', note_file: '' })}>
              Add Note
            </Button>
          </CardContent>
        </Card>


        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
