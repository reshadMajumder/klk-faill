
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { postComment } from '@/lib/api';

const formSchema = z.object({
  comment: z.string().min(1, 'Comment cannot be empty.'),
});

type CommentContributionFormValues = z.infer<typeof formSchema>;

export function CommentContributionForm({ contributionId, onCommentPosted }: { contributionId: string; onCommentPosted: () => void; }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CommentContributionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      comment: '',
    },
  });

  async function onSubmit(values: CommentContributionFormValues) {
    setIsLoading(true);
    try {
      await postComment(contributionId, values.comment);
      toast({
        title: 'Comment Posted!',
        description: 'Thank you for your feedback.',
      });
      form.reset();
      onCommentPosted();
    } catch (error: any) {
      const errorMessages = error.data ? Object.values(error.data).flat().join(' ') : (error.message || 'An error occurred.');
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: errorMessages,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave a Comment</CardTitle>
        <CardDescription>Share your thoughts with the community.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Comment</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about your experience..."
                      {...field}
                      disabled={isLoading}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Post Comment
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
