

import Image from "next/image";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Star, PlayCircle, FileText, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ApiContributionDetail, getFullImageUrl } from '@/lib/data';
import { formatDistanceToNow } from 'date-fns';
import { API_BASE_URL } from "@/lib/api";
import { ContributionComments } from "@/components/contribution-comments";
import { EnrollButton } from "@/components/enroll-button";

async function getContribution(id: string): Promise<ApiContributionDetail | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/contributions/${id}/`, {
        cache: 'no-store',
    });

    if (!res.ok) {
      if (res.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch contribution: ${res.statusText}`);
    }
    return res.json();
  } catch (err: any) {
    console.error(err);
    return null;
  }
}

export default async function ContributionDetailPage({ params }: { params: { id: string } }) {
  const contribution = await getContribution(params.id);
  
  if (!contribution) {
    notFound();
  }
  
  const formattedDate = contribution.created_at ? formatDistanceToNow(new Date(contribution.created_at), { addSuffix: true }) : 'N/A';
  const authorFallback = contribution.author_name ? contribution.author_name.charAt(0).toUpperCase() : '?';


  return (
    <div className="container mx-auto">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
            <div>
                {contribution.course_code && (
                    <Badge variant="outline" className="mb-2 text-sm font-mono">{contribution.course_code}</Badge>
                )}
                <h1 className="font-headline text-3xl md:text-4xl font-bold mb-2">{contribution.title}</h1>
                <p className="text-lg text-muted-foreground mb-6">{contribution.description}</p>
                
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

            <Card>
                <CardHeader>
                    <CardTitle>Course Content</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                <h3 className="font-semibold mb-3 text-base flex items-center gap-2"><PlayCircle className="h-5 w-5 text-muted-foreground" /> Videos</h3>
                <ul className="space-y-2 mb-6">
                    {contribution.contributionVideos.map((video, index) => (
                    <li key={video.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground">{index + 1}.</span>
                        <span className="flex-1 text-sm">{video.title}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{video.total_views} views</span>
                    </li>
                    ))}
                    {contribution.contributionVideos.length === 0 && <p className="text-sm text-muted-foreground px-2">No videos available.</p>}
                </ul>

                <Separator className="my-4"/>

                <h3 className="font-semibold mb-3 text-base flex items-center gap-2"><FileText className="h-5 w-5 text-muted-foreground" /> Notes</h3>
                <ul className="space-y-2">
                    {contribution.contributionNotes.map((note, index) => (
                    <li key={note.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground">{index + 1}.</span>
                        <span className="flex-1 text-sm">{note.title}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">Updated {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}</span>
                    </li>
                    ))}
                    {contribution.contributionNotes.length === 0 && <p className="text-sm text-muted-foreground px-2">No notes available.</p>}
                </ul>
                </CardContent>
            </Card>

            <ContributionComments contributionId={params.id} />
        </div>

        <div className="md:col-span-1 space-y-4">
          <Card className="overflow-hidden sticky top-24">
            <div className="aspect-video w-full overflow-hidden">
                <Image
                src={getFullImageUrl(contribution.thumbnail_image)}
                alt={contribution.title}
                width={600}
                height={400}
                className="w-full h-full object-cover"
                data-ai-hint="course thumbnail"
                />
            </div>
            <CardContent className="p-4">
               <h2 className="text-3xl font-bold mb-2">
                {contribution.price === "0.00" ? "Free" : `$${contribution.price}`}
              </h2>
              <EnrollButton contributionId={contribution.id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

    