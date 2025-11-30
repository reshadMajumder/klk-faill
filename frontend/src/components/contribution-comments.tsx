

'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { authFetch } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { ApiComment } from '@/lib/data';
import { Loader2 } from 'lucide-react';
import { CommentCard } from './comment-card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { EditCommentForm } from './edit-comment-form';
import { deleteComment } from '@/lib/api';

type ContributionCommentsProps = {
  contributionId: string;
};

type UserProfile = {
    id: number;
    username: string;
}

export function ContributionComments({ contributionId }: ContributionCommentsProps) {
  const [comments, setComments] = useState<ApiComment[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingComment, setEditingComment] = useState<ApiComment | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchCommentsAndUser() {
      if (!contributionId) return;
      setIsLoading(true);
      try {
        const [commentsResponse, userResponse] = await Promise.all([
          authFetch(`/api/contributions/${contributionId}/get-comments/`),
          authFetch('/api/accounts/user-profile/').catch(() => null) // Allow guests to view comments
        ]);
        setComments(commentsResponse.data);
        if (userResponse) {
            setCurrentUser(userResponse);
        }
      } catch (error) {
        console.error('Failed to fetch comments', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load comments.',
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchCommentsAndUser();
  }, [contributionId, toast]);

  const handleCommentUpdated = (updatedComment: ApiComment) => {
    setComments(prev => prev.map(c => c.id === updatedComment.id ? updatedComment : c));
    setEditingComment(null);
  };
  
  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(contributionId, commentId);
      toast({
        title: 'Success',
        description: 'Your comment has been deleted.',
      });
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch(error: any) {
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: error.data?.error || error.message || 'Could not delete the comment.'
      })
    }
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Comments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Dialog open={!!editingComment} onOpenChange={(isOpen) => !isOpen && setEditingComment(null)}>
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <AlertDialog key={comment.id}>
                    <CommentCard
                        comment={comment}
                        isOwner={!!currentUser && currentUser.username === comment.user}
                        onEdit={() => setEditingComment(comment)}
                        onDelete={() => {
                            // This triggers the AlertDialog, which is a sibling
                            const trigger = document.getElementById(`delete-trigger-${comment.id}`);
                            trigger?.click();
                        }}
                    />
                    <AlertDialogTrigger asChild>
                        <button id={`delete-trigger-${comment.id}`} className="hidden" />
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your comment.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteComment(comment.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">No comments yet.</p>
            )}
          </div>
          <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Comment</DialogTitle>
            </DialogHeader>
            {editingComment && (
                <EditCommentForm 
                    contributionId={contributionId} 
                    comment={editingComment} 
                    onCommentUpdated={handleCommentUpdated}
                />
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
