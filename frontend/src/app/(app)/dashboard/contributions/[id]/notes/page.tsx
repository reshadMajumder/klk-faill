
'use client';

import { useParams, notFound, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { AddNoteForm } from './add-note-form';
import { useState, useEffect } from 'react';
import { authFetch } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Trash2, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { EditNoteForm } from './edit-note-form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { deleteNoteFromContribution } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';


type Note = {
  id: string;
  title: string;
  note_file: string;
  created_at: string;
  updated_at: string;
};

export default function AddNotesPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { toast } = useToast();
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [contributionTitle, setContributionTitle] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  if (!id) {
    return notFound();
  }

  const fetchNotes = async () => {
    try {
        const responseData = await authFetch(`/api/contributions/user/${id}/details/`);
        setNotes(responseData.data.contributionNotes || []);
        setContributionTitle(responseData.data.title);
    } catch (error) {
        console.error('Failed to fetch notes', error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not load note data.',
        });
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchNotes();
    }
  }, [id, toast]);


  const onNoteAdded = (newNote: Note) => {
    setNotes(prev => [...prev, newNote]);
    fetchNotes(); // Refetch to get the latest list from server
  };

  const onNoteUpdated = (updatedNote: Note) => {
    setNotes(prev => prev.map(n => n.id === updatedNote.id ? { ...n, ...updatedNote } : n));
    setEditingNote(null);
  }

  const handleDelete = async (noteId: string) => {
    try {
      await deleteNoteFromContribution(id, noteId);
      toast({
        title: 'Success',
        description: 'Note has been deleted.'
      });
      setNotes(prev => prev.filter(n => n.id !== noteId));
    } catch(error: any) {
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: error.message || 'Could not delete the note.'
      })
    }
  }

  return (
    <div className="container mx-auto">
      <PageHeader 
        title={`Manage Notes for "${contributionTitle || '...'}"`}
        description="Add, edit, or delete notes for your contribution." 
      >
        <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2"/>
            Back to Management
        </Button>
      </PageHeader>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Existing Notes</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                         <div className="space-y-4">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : notes.length > 0 ? (
                        <ul className="space-y-3">
                            {notes.map((note) => (
                                <li key={note.id} className="flex items-center justify-between p-3 rounded-md border bg-muted/50">
                                    <div className="flex items-center gap-4">
                                        <FileText className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">{note.title}</p>
                                            <p className="text-sm text-muted-foreground">Updated {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Dialog open={editingNote?.id === note.id} onOpenChange={(isOpen) => !isOpen && setEditingNote(null)}>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="icon" onClick={() => setEditingNote(note)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Edit Note</DialogTitle>
                                                </DialogHeader>
                                                {editingNote && <EditNoteForm contributionId={id} note={editingNote} onNoteUpdated={onNoteUpdated} />}
                                            </DialogContent>
                                        </Dialog>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="icon">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete the note.
                                                </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(note.id)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">No notes have been added yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
        <div>
            <AddNoteForm contributionId={id} onNoteAdded={onNoteAdded} />
        </div>
      </div>
    </div>
  );
}
