
'use client';

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ApiContribution } from "@/lib/data";
import { getFullImageUrl } from "@/lib/data";
import { Users, Star, Edit, BookOpen } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "./ui/button";

type ContributionCardProps = {
  contribution: ApiContribution;
  className?: string;
  enrollmentId?: string;
  showManagementActions?: boolean;
};

export function ContributionCard({ contribution, className, enrollmentId, showManagementActions = false }: ContributionCardProps) {
  const initialImageUrl = getFullImageUrl(contribution.thumbnail_image);
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setImageUrl(getFullImageUrl(contribution.thumbnail_image));
  }, [contribution.thumbnail_image]);
  
  const imageHint = "education";

  const isEnrollmentsPage = pathname.includes('/dashboard');
  const isMyContributionsPage = pathname.includes('/dashboard') && showManagementActions;
  
  const linkHref = isEnrollmentsPage && enrollmentId ? `/enrollments/${enrollmentId}` : `/contributions/${contribution.id}`;

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/dashboard/contributions/${contribution.id}/manage`);
  };

  return (
    <div className={className}>
      <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 group hover:shadow-lg">
        <Link href={linkHref} className="flex flex-col flex-grow">
          <CardHeader className="p-0 relative">
            <div className="aspect-[4/3] overflow-hidden">
                <Image
                src={imageUrl}
                alt={contribution.title}
                width={600}
                height={400}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                data-ai-hint={imageHint}
                onError={() => { setImageUrl('https://picsum.photos/seed/placeholder/600/400') }}
                />
            </div>
             {contribution.course_code && (
                <Badge variant="secondary" className="absolute top-3 left-3">{contribution.course_code}</Badge>
            )}
            <Badge className="absolute top-3 right-3">
              {contribution.price === "0.00" ? "Free" : `$${contribution.price}`}
            </Badge>
          </CardHeader>
          <CardContent className="p-4 flex-grow flex flex-col">
            <h3 className="font-headline text-base font-semibold mb-2 leading-tight line-clamp-2 flex-grow">{contribution.title}</h3>
            <div className="flex items-center gap-2 mt-2">
              <BookOpen className="h-4 w-4 text-muted-foreground"/>
              <span className="text-xs text-muted-foreground truncate">{contribution.related_University?.name || 'N/A'}</span>
            </div>
          </CardContent>
        </Link>
        <CardFooter className="p-4 pt-0 border-t mt-auto">
          {isMyContributionsPage ? (
            <div className="flex justify-end w-full gap-2">
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Manage
              </Button>
            </div>
          ) : (
            <div className="flex justify-between items-center w-full text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{contribution.total_views}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span className="font-semibold text-foreground">{parseFloat(contribution.ratings).toFixed(1)}</span>
              </div>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

