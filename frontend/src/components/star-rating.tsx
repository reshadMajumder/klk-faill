import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

type StarRatingProps = {
  rating: number;
  className?: string;
  starClassName?: string;
};

export function StarRating({ rating, className, starClassName }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const partialStar = rating % 1;
  const emptyStars = 5 - Math.ceil(rating);

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {[...Array(fullStars)].map((_, i) => (
        <Star
          key={`full-${i}`}
          className={cn('h-4 w-4 text-primary fill-primary', starClassName)}
        />
      ))}
      {partialStar > 0 && (
        <div className="relative">
            <Star
                key="partial"
                className={cn('h-4 w-4 text-primary', starClassName)}
            />
            <div className="absolute top-0 left-0 overflow-hidden" style={{ width: `${partialStar * 100}%` }}>
                <Star
                    key="partial-fill"
                    className={cn('h-4 w-4 text-primary fill-primary', starClassName)}
                />
            </div>
        </div>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star
          key={`empty-${i}`}
          className={cn('h-4 w-4 text-muted-foreground/50', starClassName)}
        />
      ))}
    </div>
  );
}
