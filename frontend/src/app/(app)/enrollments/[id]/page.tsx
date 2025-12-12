'use client';

import { useState, useEffect } from 'react';
import { notFound, useParams } from "next/navigation";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Star, PlayCircle, FileText, Clock, X, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ApiContributionDetail, getFullImageUrl } from '@/lib/data';
import { formatDistanceToNow } from 'date-fns';
import { authFetch } from "@/lib/auth";
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RateContributionForm } from '@/components/enrollments/rate-contribution-form';
import { CommentContributionForm } from '@/components/enrollments/comment-contribution-form';
import { ContributionComments } from '@/components/contribution-comments';

type EnrollmentDetail = {
    id: string;
    contribution: ApiContributionDetail;
    enrolled_at: string;
};

type VideoDetail = {
    video_id: string;
    title: string;
    video_url: string;
    total_views: number;
}

type NoteDetail = {
    note_id: string;
    title: string;
    note_url: string;
}

function getEmbedUrl(url: string): string | null {
    let embedUrl: string | null = null;
    
    try {
        const urlObject = new URL(url);
        
        if (urlObject.hostname.includes('youtube.com') || urlObject.hostname.includes('youtu.be')) {
            const videoId = urlObject.searchParams.get('v') || urlObject.pathname.split('/').pop();
            if (videoId) {
                embedUrl = `https://www.youtube.com/embed/${videoId}`;
            }
        } else if (urlObject.hostname.includes('drive.google.com')) {
            if (urlObject.pathname.includes('/file/d/')) {
                 const fileId = urlObject.pathname.split('/d/')[1].split('/')[0];
                 if(fileId) {
                    embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
                 }
            }
        }
    } catch(e) {
        // Not a valid URL, will be treated as direct link
    }

    return embedUrl;
}


export default function EnrollmentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [enrollment, setEnrollment] = useState<EnrollmentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<VideoDetail | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const { toast } = useToast();
  const [commentCount, setCommentCount] = useState(0);

  // new state to surface playback/fetch errors for the selected video
  const [videoError, setVideoError] = useState<string | null>(null);
  
  // state for note viewing
  const [selectedNote, setSelectedNote] = useState<NoteDetail | null>(null);
  const [isNoteLoading, setIsNoteLoading] = useState(false);

  useEffect(() => {
    async function getEnrollment() {
      if (!id) return;
      try {
        const res = await authFetch(`/api/enrollment/detail/${id}/`);
        setEnrollment(res);
      } catch (err: any) {
        console.error(err);
        if (err.message.includes('404')) {
            notFound();
        }
      } finally {
        setIsLoading(false);
      }
    }
    getEnrollment();
  }, [id]);

  const handleCommentPosted = () => {
    // Increment comment count to trigger a re-render of ContributionComments
    setCommentCount(count => count + 1);
  };
  
  const handleWatchVideo = async (videoId: string) => {
    if (selectedVideo?.video_id === videoId) {
        setSelectedVideo(null);
        return;
    }
    
    setIsVideoLoading(true);
    setSelectedVideo(null);
    setVideoError(null);
    try {
        const videoData = await authFetch(`/api/enrollment/watch-video/${videoId}/`);
        setSelectedVideo(videoData);
    } catch (err: any) {
        toast({
            variant: 'destructive',
            title: 'Error loading video',
            description: err.message || 'Could not load the video. Please try again.'
        })
    } finally {
        setIsVideoLoading(false);
    }
  }

  const handleViewNote = async (noteId: string) => {
    if (selectedNote?.note_id === noteId) {
        setSelectedNote(null);
        return;
    }
    
    setIsNoteLoading(true);
    setSelectedNote(null);
    try {
        const noteData = await authFetch(`/api/enrollment/get-notes/${noteId}/`);
        setSelectedNote(noteData);
    } catch (err: any) {
        toast({
            variant: 'destructive',
            title: 'Error loading note',
            description: err.message || 'Could not load the note. Please try again.'
        })
    } finally {
        setIsNoteLoading(false);
    }
  }

  // Helper: extract YouTube ID (handles youtube.com/watch?v=.. and youtu.be/..)
  function extractYouTubeId(url: string) {
    try {
      const u = new URL(url);
      if (u.hostname.includes('youtu.be')) {
        return u.pathname.split('/').pop();
      }
      if (u.hostname.includes('youtube.com')) {
        return u.searchParams.get('v') || null;
      }
    } catch (e) {}
    return null;
  }

  // Helper: extract Google Drive file id
  function extractDriveId(url: string) {
    try {
      const u = new URL(url);
      // /file/d/<id>/...
      const parts = u.pathname.split('/');
      const fileIndex = parts.indexOf('d');
      if (fileIndex !== -1 && parts[fileIndex + 1]) return parts[fileIndex + 1];
      // ?id=<id>
      const id = u.searchParams.get('id');
      if (id) return id;
    } catch (e) {}
    return null;
  }

  // Accept many input shapes and return an embeddable URL or null
  function getEmbedUrl(url?: string | null): string | null {
    if (!url) return null;
    // plain youtube id or url
    const yt = extractYouTubeId(url);
    if (yt) return `https://www.youtube.com/embed/${yt}`;

    const driveId = extractDriveId(url);
    if (driveId) return `https://drive.google.com/file/d/${driveId}/preview`;

    // direct video file extensions
    const lower = url.toLowerCase();
    if (/\.(mp4|webm|ogg|mov)(\?.*)?$/.test(lower)) return url;

    // some Google Drive share links that don't parse as URL (e.g., wrapped strings), try naive match
    const matchDrive = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (matchDrive) return `https://drive.google.com/file/d/${matchDrive[1]}/preview`;

    return null;
  }

  const renderVideoPlayer = (video: VideoDetail) => {
    const embedUrl = getEmbedUrl(video.video_url ?? null);

    // Build iframe src with safe autoplay params for YouTube (muted autoplay more likely to succeed)
    let iframeSrc = embedUrl;
    if (embedUrl && embedUrl.includes('youtube.com/embed')) {
      // append autoplay and mute (do not break existing query params)
      iframeSrc = embedUrl.includes('?') ? `${embedUrl}&autoplay=1&mute=1` : `${embedUrl}?autoplay=1&mute=1`;
    }

    // iframe embed path (YouTube / Drive)
    if (iframeSrc && (iframeSrc.includes('youtube.com/embed') || iframeSrc.includes('drive.google.com'))){
      return (
        <div>
          <iframe
            src={iframeSrc}
            className="w-full aspect-video rounded-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={video.title}
            onLoad={() => setVideoError(null)}
            onError={() => setVideoError('Failed to load embedded player. You can open the video in a new tab.')}
          />

          <div className="mt-3 flex items-center gap-3">
            <a className="underline text-sm" target="_blank" rel="noreferrer" href={video.video_url || iframeSrc}>Open in new tab</a>
            <Button variant="secondary" size="sm" onClick={() => window.open(video.video_url || iframeSrc, '_blank')}>Open</Button>
            {videoError && <span className="text-sm text-red-500">{videoError}</span>}
          </div>
        </div>
      );
    }

    // direct video file path → use HTML5 player
    if (embedUrl) {
      return (
        <div>
          <video
            controls
            autoPlay
            src={embedUrl}
            className="w-full aspect-video rounded-lg bg-black"
            onError={() => setVideoError('Playback failed — the file may be blocked by CORS or inaccessible.')}
          >
            Your browser does not support the video tag.
          </video>

          <div className="mt-3 flex items-center gap-3">
            <a className="underline text-sm" target="_blank" rel="noreferrer" href={video.video_url || embedUrl}>Open in new tab</a>
            <Button variant="secondary" size="sm" onClick={() => window.open(video.video_url || embedUrl, '_blank')}>Open</Button>
            {videoError && <div className="text-sm text-red-500">{videoError}</div>}
          </div>
        </div>
      );
    }

    // last resort: if no recognizable embed or direct file, show fallback with open link
    return (
      <div className="p-4 bg-gray-800 rounded-md text-white">
        <p className="mb-2">Unable to embed this video automatically.</p>
        {video.video_url ? (
          <div className="flex items-center gap-3">
            <a className="underline" target="_blank" rel="noreferrer" href={video.video_url}>Open the video in a new tab</a>
            <Button variant="secondary" size="sm" onClick={() => window.open(video.video_url, '_blank')}>Open</Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No video URL available.</p>
        )}
      </div>
    );
  }


  if (isLoading) {
    return (
        <div className="container mx-auto">
             <div className="space-y-8">
                <Skeleton className="h-12 w-3/4 md:w-1/4" />
                <Skeleton className="h-8 w-full md:w-3/4" />
                <Skeleton className="h-6 w-full md:w-1/2" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/3" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
  }
  
  if (!enrollment) {
    return notFound();
  }
  
  const { contribution } = enrollment;
  const formattedDate = contribution.created_at ? formatDistanceToNow(new Date(contribution.created_at), { addSuffix: true }) : 'N/A';
  const authorFallback = contribution.author_name ? contribution.author_name.charAt(0).toUpperCase() : '?';

  return (
    <div className="container mx-auto">
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                <Image
                    src={getFullImageUrl(contribution.thumbnail_image)}
                    alt={contribution.title}
                    fill
                    className="object-cover"
                    data-ai-hint="course thumbnail"
                />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                 <div className="absolute bottom-0 left-0 p-4 md:p-6 z-10">
                    {contribution.course_code && (
                        <Badge variant="secondary" className="mb-2 text-sm font-mono">{contribution.course_code}</Badge>
                    )}
                    <h1 className="font-headline text-2xl md:text-4xl font-bold text-white mb-2">{contribution.title}</h1>
                 </div>
                 <Alert className="absolute top-4 right-4 z-10 w-auto bg-primary/20 border-primary/40 backdrop-blur-sm text-white">
                    <CheckCircle className="h-4 w-4 text-white" />
                    <AlertTitle className="font-bold text-white">You are enrolled!</AlertTitle>
                    <AlertDescription className="hidden sm:block">
                        Enrolled on {new Date(enrollment.enrolled_at).toLocaleDateString()}.
                    </AlertDescription>
                </Alert>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                    <div 
                      className="prose prose-sm max-w-none" 
                      dangerouslySetInnerHTML={{ __html: contribution.description }}
                    />
                </CardContent>
            </Card>

            <div>
                <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 mb-6">
                    <div className="flex items-center gap-2">
                    <Avatar>
                        <AvatarImage src={getFullImageUrl(contribution.author_image)} alt={contribution.author_name} />
                        <AvatarFallback>{authorFallback}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{contribution.author_name || 'Anonymous'}</span>
                    </div>
                    <Separator orientation="vertical" className="h-6 hidden sm:block" />
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{contribution.total_views} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Created {formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500">
                        <Star className="h-4 w-4 fill-amber-500" />
                        <span>{parseFloat(contribution.ratings).toFixed(1)}</span>
                    </div>
                    </div>
                </div>
            </div>

            { (selectedVideo || isVideoLoading) && (
                <Card className="mb-8 bg-black">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-white text-base md:text-xl">{selectedVideo?.title || 'Loading video...'}</CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedVideo(null)} className="text-white hover:bg-white/10 hover:text-white">
                            <X className="h-5 w-5"/>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {isVideoLoading && (
                            <div className="aspect-video w-full flex items-center justify-center bg-gray-900/50 rounded-lg">
                                <Loader2 className="h-8 w-8 animate-spin text-white" />
                            </div>
                        )}
                        {selectedVideo && renderVideoPlayer(selectedVideo)}
                    </CardContent>
                </Card>
            )}

            <Dialog open={!!selectedNote || isNoteLoading} onOpenChange={(open) => !open && setSelectedNote(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedNote?.title || 'Loading note...'}</DialogTitle>
                        <DialogDescription>
                            Access your study note
                        </DialogDescription>
                    </DialogHeader>
                    {isNoteLoading && (
                        <div className="w-full flex items-center justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    )}
                    {selectedNote && (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">Click the link below to open the note:</p>
                            <a 
                                href={selectedNote.note_url} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="inline-flex items-center gap-2 text-primary hover:underline font-medium break-all"
                            >
                                <FileText className="h-4 w-4 flex-shrink-0" />
                                {selectedNote.note_url}
                            </a>
                            <div className="flex gap-2">
                                <Button 
                                    variant="default" 
                                    size="sm" 
                                    onClick={() => window.open(selectedNote.note_url, '_blank')}
                                >
                                    Open Note
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setSelectedNote(null)}
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Card>
                <CardHeader>
                    <CardTitle>Course Content</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                <h3 className="font-semibold mb-3 text-base flex items-center gap-2"><PlayCircle className="h-5 w-5 text-muted-foreground" /> Videos</h3>
                <ul className="space-y-2 mb-6">
                    {[...contribution.contributionVideos].reverse().map((video, index) => (
                    <li key={video.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 rounded-md hover:bg-muted/50 gap-2">
                        <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground">{index + 1}.</span>
                        <span className="flex-1 text-sm">{video.title}</span>
                        </div>
                         <Button variant="secondary" size="sm" onClick={() => handleWatchVideo(video.id)} disabled={isVideoLoading && selectedVideo?.video_id !== video.id} className="w-full sm:w-auto">
                            {selectedVideo?.video_id === video.id ? <X className="h-4 w-4 mr-2"/> : <PlayCircle className="h-4 w-4 mr-2"/>}
                            {selectedVideo?.video_id === video.id ? 'Close' : 'Play'}
                        </Button>
                    </li>
                    ))}
                    {contribution.contributionVideos.length === 0 && <p className="text-sm text-muted-foreground px-2">No videos available.</p>}
                </ul>

                <Separator className="my-4"/>

                <h3 className="font-semibold mb-3 text-base flex items-center gap-2"><FileText className="h-5 w-5 text-muted-foreground" /> Notes</h3>
                <ul className="space-y-2">
                    {contribution.contributionNotes.map((note, index) => (
                    <li key={note.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 rounded-md hover:bg-muted/50 gap-2">
                        <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground">{index + 1}.</span>
                        <span className="flex-1 text-sm">{note.title}</span>
                        </div>
                        <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => handleViewNote(note.id)} 
                            disabled={isNoteLoading && selectedNote?.note_id !== note.id}
                            className="w-full sm:w-auto"
                        >
                            {selectedNote?.note_id === note.id ? <X className="h-4 w-4 mr-2"/> : <FileText className="h-4 w-4 mr-2"/>}
                            {selectedNote?.note_id === note.id ? 'Close' : 'View'}
                        </Button>
                    </li>
                    ))}
                    {contribution.contributionNotes.length === 0 && <p className="text-sm text-muted-foreground px-2">No notes available.</p>}
                </ul>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-8">
                <RateContributionForm contributionId={contribution.id} />
                <CommentContributionForm 
                  key={`comment-form-${commentCount}`}
                  contributionId={contribution.id} 
                  onCommentPosted={handleCommentPosted} 
                />
            </div>

            <ContributionComments key={`comments-${commentCount}`} contributionId={contribution.id} />

        </div>
    </div>
  );
}

