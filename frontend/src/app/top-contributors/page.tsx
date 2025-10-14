
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchTopContributors } from './actions';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default async function TopContributorsPage() {
  const contributors = await fetchTopContributors();

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        <CardHeader className='px-0'>
          <CardTitle className="font-headline text-3xl">Top Contributors</CardTitle>
          <CardDescription>Our community's most impactful members, ranked by their contributions.</CardDescription>
        </CardHeader>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 text-center">Rank</TableHead>
                  <TableHead>Contributor</TableHead>
                  <TableHead className="text-center">Contributions</TableHead>
                  <TableHead className="text-center">Total Views</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contributors.map((contributor, index) => (
                  <TableRow key={contributor.id} className="cursor-pointer hover:bg-muted">
                    <TableCell className="font-bold text-center text-lg">
                       <Link href={`/public-profile/${contributor.username}`} className="block w-full h-full">
                            {index + 1}
                       </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={`/public-profile/${contributor.username}`} className="flex items-center gap-3 group">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{contributor.username.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium group-hover:underline">{contributor.username}</span>
                      </Link>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                        <Link href={`/public-profile/${contributor.username}`} className="block w-full h-full">
                            {contributor.total_contributions}
                        </Link>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                         <Link href={`/public-profile/${contributor.username}`} className="block w-full h-full">
                            {contributor.total_views}
                        </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
             {contributors.length === 0 && (
                <div className="text-center p-8 text-muted-foreground">
                    No contributors found yet. Be the first!
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
