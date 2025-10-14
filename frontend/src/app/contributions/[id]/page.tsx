
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  getContributionById,
  getReviewsForContribution,
} from '@/lib/data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StarRating } from '@/components/star-rating';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { FileText, Video } from 'lucide-react';
import { EnrollButton } from './enroll-button';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

function getAverageRating(ratingString: string | undefined) {
  if (!ratingString) return 0;
  return parseFloat(ratingString);
}


export default async function ContributionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const contribution = await getContributionById(params.id);
  if (!contribution) {
    notFound();
  }

  const reviews = await getReviewsForContribution(params.id);
  const averageRating = getAverageRating(contribution.ratings);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
        <div className="md:col-span-2">
          <header className="mb-6">
            <h1 className="font-headline text-4xl font-bold tracking-tight mb-2">
              {contribution.title}
            </h1>
            <p className="text-lg text-muted-foreground">
              {contribution.department.name} - {contribution.related_University.name}
            </p>
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              <Link href={`/public-profile/${contribution.user}`} className="flex items-center gap-2 hover:underline">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{contribution.user.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>{contribution.user}</span>
              </Link>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-1">
                <StarRating rating={averageRating} />
                <span>
                  {averageRating.toFixed(1)} ({reviews.length} reviews)
                </span>
              </div>
            </div>
             <div className="mt-4 flex flex-wrap gap-2">
                {contribution.tags.map(tag => <Badge key={tag.id} variant="secondary">{tag.name}</Badge>)}
            </div>
          </header>

          {contribution.thumbnail_image && (
             <Card className="mb-6 aspect-video overflow-hidden relative">
                <Image
                    src={contribution.thumbnail_image}
                    alt={contribution.title}
                    fill
                    className="object-cover"
                    unoptimized
                />
            </Card>
          )}

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Description</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-blue max-w-none">
                <p>{contribution.description}</p>
            </CardContent>
          </Card>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Course Materials</CardTitle>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible defaultValue="videos">
                    <AccordionItem value="videos">
                        <AccordionTrigger className='text-lg font-semibold'>Videos ({contribution.videos.length})</AccordionTrigger>
                        <AccordionContent>
                           <ul className='space-y-3'>
                               {contribution.videos.map(video => (
                                   <li key={video.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
                                       <Video className='text-primary' />
                                       <span>{video.title}</span>
                                   </li>
                               ))}
                           </ul>
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="notes">
                        <AccordionTrigger className='text-lg font-semibold'>Notes ({contribution.notes.length})</AccordionTrigger>
                        <AccordionContent>
                           <ul className='space-y-3'>
                               {contribution.notes.map(note => (
                                   <li key={note.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted">
                                       <FileText className='text-primary' />
                                       <span>{note.title}</span>
                                   </li>
                               ))}
                           </ul>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='font-headline text-2xl'>Reviews ({reviews.length})</CardTitle>
              <CardDescription>See what other students are saying.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <h3 className="font-semibold mb-4">Leave a Review</h3>
                <div className="space-y-4">
                  <StarRating rating={0} starClassName='h-6 w-6 cursor-pointer' />
                  <Textarea placeholder="Share your thoughts on this contribution..." />
                  <Button>Submit Review</Button>
                </div>
              </div>
              <Separator />
              <div className="space-y-6">
                {reviews.length > 0 ? (
                  reviews.map(review => (
                    <div key={review.id} className="flex gap-4">
                      <Avatar>
                        <AvatarImage src={review.user?.avatarUrl} />
                        <AvatarFallback>{review.user?.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{review.user?.name}</span>
                          <span className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                        <StarRating rating={review.rating} className="my-1" />
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className='text-sm text-muted-foreground text-center'>No reviews yet. Be the first to leave one!</p>
                )}
              </div>
            </CardContent>
          </Card>

        </div>

        <div className="md:col-span-1">
            <Card className="sticky top-24">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold">${contribution.price}</CardTitle>
                    <CardDescription>Get full access to all materials.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   <EnrollButton contributionId={contribution.id} />
                    <div className='text-sm text-muted-foreground space-y-2'>
                        <p>Course Code: {contribution.course_code || 'Not specified'}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
