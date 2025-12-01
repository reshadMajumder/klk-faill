
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { addVideoToContribution } from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  video_url: z.string().url('Must be a valid URL'),
});


type AddVideoFormValues = z.infer<typeof formSchema>;

export function AddVideoForm({ contributionId, onVideoAdded }: { contributionId: string; onVideoAdded: (video: any) => void }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  // Only URL upload is allowed now

  const form = useForm<AddVideoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      video_url: '',
    }
  });

  async function onSubmit(values: AddVideoFormValues) {
    setIsLoading(true);

    const apiData: { title: string; video_url?: string; } = { title: values.title, video_url: values.video_url };
    
    try {
      const newVideo = await addVideoToContribution(contributionId, apiData);
      
      toast({
        title: 'Success!',
        description: 'Your video has been added.',
      });
      
      onVideoAdded(newVideo);
      form.reset();

    } catch (error: any) {
       const errorMessages = error.data ? Object.values(error.data).flat().join(' ') : (error.message || 'An error occurred.');
       toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: errorMessages,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>Add a New Video</CardTitle>
            <CardDescription>Upload a file or link to an external video.</CardDescription>
        </CardHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="grid gap-6">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Video Title</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., Introduction to Derivatives" {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                   
                    <FormField
                      control={form.control}
                      name="video_url"
                      render={({ field }) => (
                      <FormItem>
                        <FormLabel>Video URL</FormLabel>
                        <FormControl>
                        <Input placeholder="e.g., https://youtube.com/watch?v=..." {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                      )}
                    />
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add Video
                    </Button>
                </CardFooter>
            </form>
        </Form>
    </Card>
  );
}
