

import { notFound } from 'next/navigation';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ContributionCard } from '@/components/contribution-card';
import type { Contribution } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, BookOpenText, Eye } from 'lucide-react';
import type { TopContributor } from '@/app/top-contributors/actions';


async function getContributorByUsername(username: string): Promise<TopContributor | undefined> {
    const dummyContributors: TopContributor[] = [
        { id: 'user1', username: 'alex_the_great', total_contributions: 25, total_views: 15200 },
        { id: 'user2', username: 'maria_studies', total_contributions: 21, total_views: 12450 },
        { id: 'user3', username: 'chen_codes', total_contributions: 18, total_views: 9800 },
        { id: 'user4', username: 'sam_history_buff', total_contributions: 15, total_views: 7600 },
        { id: 'user5', username: 'jenna_bio_wiz', total_contributions: 12, total_views: 5300 },
    ];
    return dummyContributors.find(user => user.username === username);
}

// In a real app, you would fetch this data from your API
async function getContributionsByUserId(userId: string): Promise<Contribution[]> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/contributions/all-contributions/`);
    const data = await response.json();
    // Filter contributions by user ID (or username, depending on API)
    // Since the public endpoint does not contain user info, we can't filter.
    // We'll just return a slice of all contributions as dummy data.
    if (userId === 'user1') return data.results.slice(0, 3);
    if (userId === 'user2') return data.results.slice(3, 5);
    return data.results.slice(1, 4);
}


export default async function PublicProfilePage({ params }: { params: { username: string } }) {
  const user = await getContributorByUsername(params.username);

  if (!user) {
    notFound();
  }

  const userContributions = await getContributionsByUserId(user.id);
  const profileHeaderImage = PlaceHolderImages.find(p => p.id === 'profileHeader');
  const avatarUrl = `https://ui-avatars.com/api/?name=${user.username.replace('_', '+')}&background=random&color=fff`

  return (
    <div className="bg-muted/30 py-12 md:py-20">
      <div className="container mx-auto px-4">
        <Card className="max-w-5xl mx-auto shadow-2xl border-primary/20 border-2 bg-background overflow-hidden">
            <div className="p-8 md:p-12 bg-card">
                 <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                    <Avatar className="h-28 w-28 border-4 border-primary/50">
                        <AvatarImage src={avatarUrl} alt={user.username} />
                        <AvatarFallback className="text-4xl">{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className='flex-1'>
                        <h1 className="font-headline text-4xl font-bold text-primary">{user.username}</h1>
                        <p className="text-muted-foreground text-lg mt-1">Valued Community Contributor</p>
                    </div>
                    <div className='hidden md:flex flex-col items-center gap-2'>
                        <Award className="h-16 w-16 text-primary/80" strokeWidth={1.5} />
                        <Badge variant="secondary">Top Contributor</Badge>
                    </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 text-center'>
                    <div className="bg-secondary/50 p-6 rounded-lg">
                        <CardTitle className='font-headline text-xl flex items-center justify-center gap-2'>
                            <BookOpenText className="h-5 w-5 text-primary" />
                            Total Contributions
                        </CardTitle>
                        <p className='text-5xl font-bold text-foreground mt-2'>{user.total_contributions}</p>
                    </div>
                    <div className="bg-secondary/50 p-6 rounded-lg">
                        <CardTitle className='font-headline text-xl flex items-center justify-center gap-2'>
                             <Eye className="h-5 w-5 text-primary" />
                            Community Impact
                        </CardTitle>
                        <p className='text-5xl font-bold text-foreground mt-2'>{user.total_views.toLocaleString()}</p>
                        <p className='text-sm text-muted-foreground mt-1'>Total Views</p>
                    </div>
                </div>

            </div>
           
            <div className="p-8 md:p-12 bg-background">
                <CardHeader className="px-0 pt-0">
                    <CardTitle className="font-headline text-2xl border-b pb-4">Portfolio of Contributions</CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                    {userContributions.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {userContributions.map(contribution => (
                        <ContributionCard key={contribution.id} contribution={contribution} />
                        ))}
                    </div>
                    ) : (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">This user hasn't made any contributions yet.</p>
                    </div>
                    )}
                </CardContent>
            </div>
        </Card>
      </div>
    </div>
  );
}

