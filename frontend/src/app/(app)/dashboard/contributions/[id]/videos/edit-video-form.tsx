
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { updateVideoInContribution } from '@/lib/api';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  video_url: z.string().url('Must be a valid URL'),
});

type EditVideoFormValues = z.infer<typeof formSchema>;

type Video = {
  id: string;
  title: string;
  video_file: string; // This holds the URL
};

type EditVideoFormProps = {
  contributionId: string;
  video: Video;
  onVideoUpdated: (video: Video) => void;
};

export function EditVideoForm({ contributionId, video, onVideoUpdated }: EditVideoFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<EditVideoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: video.title,
      video_url: video.video_file,
    }
  });

  async function onSubmit(values: EditVideoFormValues) {
    setIsLoading(true);
    
    try {
      const updatedVideoData = await updateVideoInContribution(contributionId, video.id, { 
        title: values.title,
        video_url: values.video_url,
      });
      
      const updatedVideoResponse = {
        id: video.id,
        title: updatedVideoData.title,
        video_file: updatedVideoData.video_url, // API returns video_url
      }

      toast({
        title: 'Success!',
        description: 'Your video has been updated.',
      });
      
      onVideoUpdated(updatedVideoResponse);
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

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
            <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </div>
        </form>
    </Form>
  );
}
