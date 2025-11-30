
'use client';

import { useParams, notFound, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { AddVideoForm } from './add-video-form';
import { useState, useEffect } from 'react';
import { authFetch } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PlayCircle, Trash2, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { EditVideoForm } from './edit-video-form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { API_BASE_URL } from '@/lib/api';

type Video = {
  id: string;
  title: string;
  video_file: string;
  created_at: string;
  total_views: number;
};

export default function AddVideosPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { toast } = useToast();
  
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [contributionTitle, setContributionTitle] = useState('');
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);

  if (!id) {
    return notFound();
  }

  const fetchVideos = async () => {
    try {
        const responseData = await authFetch(`/api/contributions/user/${id}/details/`);
        setVideos(responseData.data.contributionVideos || []);
        setContributionTitle(responseData.data.title);
    } catch (error) {
        console.error('Failed to fetch videos', error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not load video data.',
        });
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchVideos();
    }
  }, [id]);


  const onVideoAdded = (newVideo: Video) => {
    setVideos(prev => [...prev, newVideo]);
    fetchVideos(); // Refetch to get the latest list from server
  };

  const onVideoUpdated = (updatedVideo: Video) => {
    setVideos(prev => prev.map(v => v.id === updatedVideo.id ? { ...v, ...updatedVideo } : v));
    setEditingVideo(null);
  }

  const handleDelete = async (videoId: string) => {
    try {
      await authFetch(`/api/contributions/${id}/videos/${videoId}/`, {
        method: 'DELETE',
      });
      toast({
        title: 'Success',
        description: 'Video has been deleted.'
      });
      setVideos(prev => prev.filter(v => v.id !== videoId));
    } catch(error: any) {
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: error.message || 'Could not delete the video.'
      })
    }
  }

  return (
    <div className="container mx-auto">
      <PageHeader 
        title={`Add Videos to "${contributionTitle || '...'}"`}
        description="Upload new videos or link to external video URLs." 
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
                    <CardTitle>Existing Videos</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                         <div className="space-y-4">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : videos.length > 0 ? (
                        <ul className="space-y-3">
                            {videos.map((video, index) => (
                                <li key={video.id} className="flex items-center justify-between p-3 rounded-md border bg-muted/50">
                                    <div className="flex items-center gap-4">
                                        <PlayCircle className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">{video.title}</p>
                                            <p className="text-sm text-muted-foreground">Views: {video.total_views}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Dialog open={editingVideo?.id === video.id} onOpenChange={(isOpen) => !isOpen && setEditingVideo(null)}>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="icon" onClick={() => setEditingVideo(video)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Edit Video</DialogTitle>
                                                </DialogHeader>
                                                {editingVideo && <EditVideoForm contributionId={id} video={editingVideo} onVideoUpdated={onVideoUpdated} />}
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
                                                    This action cannot be undone. This will permanently delete the video.
                                                </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(video.id)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">No videos have been added yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
        <div>
            <AddVideoForm contributionId={id} onVideoAdded={onVideoAdded} />
        </div>
      </div>
    </div>
  );
}
