
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Star } from 'lucide-react';
import { postRating } from '@/lib/api';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  rating: z.number().min(1, 'Please select a rating.'),
});

type RateContributionFormValues = z.infer<typeof formSchema>;

export function RateContributionForm({ contributionId }: { contributionId: string }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredStars, setHoveredStars] = useState(0);

  const form = useForm<RateContributionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rating: 0,
    },
  });

  const rating = form.watch('rating');

  async function onSubmit(values: RateContributionFormValues) {
    setIsLoading(true);
    try {
      await postRating(contributionId, values.rating);
      toast({
        title: 'Rating Submitted!',
        description: 'Thank you for your feedback.',
      });
      form.reset();
    } catch (error: any) {
      const errorMessages = error.data ? Object.values(error.data).flat().join(' ') : (error.message || 'An error occurred.');
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: errorMessages,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate this Contribution</CardTitle>
        <CardDescription>Let others know what you think.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Rating</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2" onMouseLeave={() => setHoveredStars(0)}>
                      {[1, 2, 3, 4, 5].map((starValue) => (
                        <Star
                          key={starValue}
                          className={cn(
                            'h-8 w-8 cursor-pointer transition-colors',
                            (hoveredStars >= starValue || (rating && rating >= starValue))
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-muted-foreground'
                          )}
                          onMouseEnter={() => setHoveredStars(starValue)}
                          onClick={() => field.onChange(starValue === rating ? 0 : starValue)}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Rating
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
