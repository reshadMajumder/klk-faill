
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
import { addNoteToContribution } from '@/lib/api';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  note_file: z.string().url('Must be a valid URL'),
});

type AddNoteFormValues = z.infer<typeof formSchema>;

export function AddNoteForm({ contributionId, onNoteAdded }: { contributionId: string; onNoteAdded: (note: any) => void }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AddNoteFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      note_file: '',
    }
  });

  async function onSubmit(values: AddNoteFormValues) {
    setIsLoading(true);
    
    try {
      const newNote = await addNoteToContribution(contributionId, values);
      
      toast({
        title: 'Success!',
        description: 'Your note has been added.',
      });
      
      onNoteAdded(newNote);
      form.reset();

    } catch (error: any) {
       const errorMessages = error.data ? Object.values(error.data).flat().join(' ') : (error.message || 'An error occurred.');
       toast({
        variant: 'destructive',
        title: 'Creation Failed',
        description: errorMessages,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>Add a New Note</CardTitle>
            <CardDescription>Link to an external note document (e.g., Google Doc, Notion page).</CardDescription>
        </CardHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="grid gap-6">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Note Title</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., Chapter 1 Summary" {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="note_file"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Note URL</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., https://docs.google.com/..." {...field} disabled={isLoading} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add Note
                    </Button>
                </CardFooter>
            </form>
        </Form>
    </Card>
  );
}
