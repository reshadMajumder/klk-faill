
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
  video_file: z.any().optional(),
  video_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
}).refine(data => !!data.video_file || !!data.video_url, {
    message: "Either a video file or a URL is required",
    path: ["video_file"],
});


type AddVideoFormValues = z.infer<typeof formSchema>;

export function AddVideoForm({ contributionId, onVideoAdded }: { contributionId: string; onVideoAdded: (video: any) => void }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadType, setUploadType] = useState<'file' | 'url'>('file');

  const form = useForm<AddVideoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      video_url: '',
    }
  });

  async function onSubmit(values: AddVideoFormValues) {
    setIsLoading(true);

    const apiData: { title: string; video_file?: File; video_url?: string; } = { title: values.title };

    if (uploadType === 'file' && values.video_file && values.video_file[0]) {
      apiData.video_file = values.video_file[0];
    } else if (uploadType === 'url' && values.video_url) {
      apiData.video_url = values.video_url;
    } else {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'You must provide either a video file or a URL.'
        });
        setIsLoading(false);
        return;
    }
    
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
                   
                    <Tabs defaultValue="file" onValueChange={(value) => setUploadType(value as 'file' | 'url')}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="file">Upload File</TabsTrigger>
                            <TabsTrigger value="url">Link URL</TabsTrigger>
                        </TabsList>
                        <TabsContent value="file" className="pt-4">
                            <FormField
                                control={form.control}
                                name="video_file"
                                render={({ field: { onChange, value, ...rest }}) => (
                                    <FormItem>
                                    <FormLabel>Video File</FormLabel>
                                    <FormControl>
                                        <Input type="file" accept="video/*" {...rest} onChange={(e) => onChange(e.target.files)} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </TabsContent>
                        <TabsContent value="url" className="pt-4">
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
                        </TabsContent>
                    </Tabs>
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
