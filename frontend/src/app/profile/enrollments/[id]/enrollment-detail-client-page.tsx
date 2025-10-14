
'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { StarRating } from '@/components/star-rating';
import { FileText, Video } from 'lucide-react';
import type { Enrollment } from '@/app/profile/enrollments/actions';


function getAverageRating(ratingString: string | undefined) {
  if (!ratingString) return 0;
  return parseFloat(ratingString);
}

export function EnrollmentDetailClientPage({ enrollment }: { enrollment: Enrollment }) {

  const { contribution } = enrollment;
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
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{contribution.user.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>{contribution.user}</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-1">
                <StarRating rating={averageRating} />
                <span>
                  {averageRating.toFixed(1)} ({contribution.ratings || 0})
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
          
          <Card>
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
                                       <Link href={video.video_file} target="_blank" rel="noopener noreferrer" className='hover:underline'>
                                         {video.title}
                                       </Link>
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
                                       <Link href={note.note_file} target="_blank" rel="noopener noreferrer" className='hover:underline'>
                                         {note.title}
                                       </Link>
                                   </li>
                               ))}
                           </ul>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-1">
            <Card className="sticky top-24">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold">Enrolled</CardTitle>
                    <CardDescription>You have access to these materials.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className='text-sm text-muted-foreground space-y-2'>
                        <p>Course Code: {contribution.course_code || 'Not specified'}</p>
                        <p>Enrolled on: {new Date(enrollment.enrolled_at).toLocaleDateString()}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
