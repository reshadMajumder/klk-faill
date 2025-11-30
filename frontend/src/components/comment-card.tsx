

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ApiComment } from '@/lib/data';
import { formatDistanceToNow } from 'date-fns';
import { Edit, Trash2 } from 'lucide-react';
import { getFullImageUrl } from '@/lib/data';

type CommentCardProps = {
  comment: ApiComment;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

export function CommentCard({ comment, isOwner, onEdit, onDelete }: CommentCardProps) {
  const userFallback = comment.user ? comment.user.charAt(0).toUpperCase() : '?';
  const formattedDate = comment.created_at ? formatDistanceToNow(new Date(comment.created_at), { addSuffix: true }) : 'some time ago';

  return (
    <Card className="p-4 bg-muted/50 border-0 shadow-none">
      <div className="flex gap-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={getFullImageUrl(comment.profile_picture)} />
          <AvatarFallback>{userFallback}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-baseline justify-between">
            <p className="font-semibold text-sm">{comment.user}</p>
            <p className="text-xs text-muted-foreground">{formattedDate}</p>
          </div>
          <p className="text-sm text-foreground/90 mt-1 whitespace-pre-wrap">{comment.comment}</p>
        </div>
        {isOwner && (
            <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
                    <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={onDelete}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        )}
      </div>
    </Card>
  );
}
