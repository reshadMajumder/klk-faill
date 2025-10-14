
import Link from 'next/link';
import Image from 'next/image';
import type { Contribution } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StarRating } from './star-rating';
import { Button } from './ui/button';
import { Pencil } from 'lucide-react';

type ContributionCardProps = {
  contribution: Contribution;
  showEditButton?: boolean;
  enrollmentId?: string;
};

export function ContributionCard({ contribution, showEditButton = false, enrollmentId }: ContributionCardProps) {
  // The API provides `ratings` as a string like "0.00".
  const averageRating = parseFloat(contribution.ratings || '0');

  // The new API doesn't link contributions to authors directly in the list view.
  // We will display university info instead.
  const universityName = contribution.related_University.name;

  const cardLink = enrollmentId 
    ? `/profile/enrollments/${enrollmentId}`
    : `/contributions/${contribution.id}`;

  return (
    <Card className="h-full flex flex-col transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 group">
        <Link href={cardLink} className="flex flex-col flex-1">
            <CardHeader className="p-0">
            <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                <Image
                src={contribution.thumbnail_image || '/placeholder.svg'}
                alt={contribution.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint="course thumbnail"
                unoptimized // Use this if the image source is external and not configured in next.config.js
                />
            </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-4">
            <CardTitle className="font-headline text-lg leading-tight mb-2">
                {contribution.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground flex-1">{contribution.department.name}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
                <span className="text-xs font-semibold">{universityName}</span>
            </div>
            <div className="flex items-center gap-1">
                <StarRating rating={averageRating} />
                <span className="text-xs">({averageRating.toFixed(1)})</span>
            </div>
            </CardFooter>
        </Link>
        {showEditButton && (
            <div className="p-4 pt-0 border-t mt-auto">
                <Button asChild variant="outline" className="w-full">
                    <Link href={`/contributions/${contribution.id}/edit`}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Contribution
                    </Link>
                </Button>
            </div>
        )}
    </Card>
  );
}
