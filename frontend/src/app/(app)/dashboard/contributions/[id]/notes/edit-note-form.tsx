
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
import { updateNoteInContribution } from '@/lib/api';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  note_file: z.string().url('Must be a valid URL'),
});

type EditNoteFormValues = z.infer<typeof formSchema>;

type Note = {
  id: string;
  title: string;
  note_file: string;
};

type EditNoteFormProps = {
  contributionId: string;
  note: Note;
  onNoteUpdated: (note: Note) => void;
};

export function EditNoteForm({ contributionId, note, onNoteUpdated }: EditNoteFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<EditNoteFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: note.title,
      note_file: note.note_file,
    }
  });

  async function onSubmit(values: EditNoteFormValues) {
    setIsLoading(true);
    
    try {
      const updatedNoteData = await updateNoteInContribution(contributionId, note.id, values);
      
      const updatedNoteResponse = {
        ...note,
        title: updatedNoteData.title,
        note_file: updatedNoteData.note_file, 
      }

      toast({
        title: 'Success!',
        description: 'Your note has been updated.',
      });
      
      onNoteUpdated(updatedNoteResponse);
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
                    <Input placeholder="e.g., https://docs.google.com/document/..." {...field} disabled={isLoading} />
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
