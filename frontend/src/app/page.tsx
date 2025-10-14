
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ContributionCard } from '@/components/contribution-card';
import { fetchContributions } from '@/app/contributions/actions';
import { ArrowRight, BookCheck, Users } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default async function Home() {
  const { contributions } = await fetchContributions();
  const featuredContributions = contributions.slice(0, 6);
  const heroImage = PlaceHolderImages.find(p => p.id === 'thumb1');

  return (
    <div className="animate-fade-in">
      <section className="relative bg-gradient-to-b from-secondary/60 via-background to-background py-16 md:py-24 overflow-hidden">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          {/* Decorative Shapes */}
          <div className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl opacity-50 animate-pulse-slow"></div>
          <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-96 h-96 bg-accent/10 rounded-full filter blur-3xl opacity-50 animate-pulse-slow animation-delay-2000"></div>

          <div className="relative z-10 text-center md:text-left">
            <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-6 animate-slide-in-up">
              Master Your Exams, <span className="text-primary">Together</span>.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto md:mx-0 mb-8 animate-slide-in-up animation-delay-300">
              CG Swap is the peer-to-peer learning platform where students share their best study materials. Upload your notes, find the perfect course, and ace that last-night prep.
            </p>
            <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4 animate-slide-in-up animation-delay-600">
              <Button asChild size="lg" className="shadow-lg">
                <Link href="/contributions">
                  Explore Contributions <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/contributions/new">
                  Share Your Knowledge
                </Link>
              </Button>
            </div>
            <div className="mt-12 flex justify-center md:justify-start gap-8 text-muted-foreground animate-fade-in animation-delay-900">
                <div className='flex items-center gap-2'>
                    <Users className='text-primary'/>
                    <span className='font-semibold'>Community Powered</span>
                </div>
                <div className='flex items-center gap-2'>
                    <BookCheck className='text-primary'/>
                    <span className='font-semibold'>Verified Materials</span>
                </div>
            </div>
          </div>
          
          <div className="relative hidden md:flex items-center justify-center h-96">
            {/* 3D Design Element */}
             <div className="absolute w-72 h-72 bg-primary/20 rounded-full animate-[spin_20s_linear_infinite]" style={{ animationDirection: 'reverse' }}></div>
             <div className="absolute w-96 h-96 bg-accent/20 rounded-full animate-[spin_25s_linear_infinite]"></div>
             <div className="absolute w-[28rem] h-[28rem] border-2 border-dashed border-primary/50 rounded-full animate-[spin_30s_linear_infinite]" style={{ animationDirection: 'reverse' }}></div>
             <div className="absolute w-72 h-72 flex items-center justify-center animate-fade-in animation-delay-500">
                 <BookCheck className="w-24 h-24 text-primary" strokeWidth={1.5} />
             </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="font-headline text-3xl font-semibold tracking-tight text-center mb-10">
            Featured Contributions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredContributions.map((contribution) => (
              <ContributionCard key={contribution.id} contribution={contribution} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Button asChild variant="link" className="text-lg">
              <Link href="/contributions">
                See all contributions <ArrowRight className="ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
