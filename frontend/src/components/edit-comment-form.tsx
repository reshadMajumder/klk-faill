
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { updateComment } from '@/lib/api';
import { ApiComment } from '@/lib/data';

const formSchema = z.object({
  comment: z.string().min(1, 'Comment cannot be empty.'),
});

type EditCommentFormValues = z.infer<typeof formSchema>;

type EditCommentFormProps = {
  contributionId: string;
  comment: ApiComment;
  onCommentUpdated: (comment: ApiComment) => void;
};

export function EditCommentForm({ contributionId, comment, onCommentUpdated }: EditCommentFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<EditCommentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      comment: comment.comment,
    }
  });

  async function onSubmit(values: EditCommentFormValues) {
    setIsLoading(true);
    
    try {
      const response = await updateComment(contributionId, comment.id, values.comment);
      
      toast({
        title: 'Success!',
        description: 'Your comment has been updated.',
      });
      
      // The API response has the updated comment nested in a `data` property.
      if (response && response.data) {
        onCommentUpdated(response.data);
      } else {
        // Fallback in case API response is not as expected, to prevent crashes
        onCommentUpdated({ ...comment, ...values });
      }

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
                name="comment"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Edit Your Comment</FormLabel>
                    <FormControl>
                        <Textarea rows={4} {...field} disabled={isLoading} />
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
