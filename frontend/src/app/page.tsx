
import { ArrowRight, BookCopy, Share2, Target, Coffee } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import Image from 'next/image';
import { placeholderImages, contributions } from '@/lib/data';
import { ContributionCard } from '@/components/contribution-card';
import { AppFooter } from '@/components/footer';
import { SiteHeader } from '@/components/site-header';
import { TypewriterEffect } from '@/components/typewriter-effect';

export default function LandingPage() {
  const features = [
    {
      icon: <BookCopy className="w-8 h-8 text-primary" />,
      title: 'Resource Library',
      description: 'Access a vast library of study materials, notes, and resources shared by fellow students.',
    },
    {
      icon: <Share2 className="w-8 h-8 text-primary" />,
      title: 'Share & Showcase',
      description: 'Share your own study materials to help others and showcase your teaching ability to the community.',
    },
    {
      icon: <Target className="w-8 h-8 text-primary" />,
      title: 'Last-Night Prep Tools',
      description: 'Find concise notes and key resources perfect for last-minute exam preparation and revision.',
    },
  ];

  const heroImage = placeholderImages.find(p => p.id === 'landing-hero');
  const recommendedContributions = contributions.slice(0, 3);
  const featuredContributions = contributions.slice(3, 6);


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative w-full h-screen flex items-center">
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent z-10" />
          <div className="container px-4 md:px-6 text-left relative z-20">
            <TypewriterEffect texts={["Share Resources.", "Get Study Help.", "Ace Your Exams."]} />
            <p className="max-w-[600px] text-white/80 md:text-xl mt-6">
              The ultimate student hub for sharing educational resources, finding last-minute exam prep tools, and getting the study help you need to succeed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Get Started for Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" asChild variant="outline" className="bg-transparent text-white hover:bg-white/10 hover:text-white border-white/50 hover:border-white/80">
                <Link href="/contributions">
                  Explore Resources
                </Link>
              </Button>
            </div>
          </div>
          {heroImage && (
            <Image 
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="absolute inset-0 w-full h-full object-cover"
              data-ai-hint={heroImage.imageHint}
              priority
            />
          )}
        </section>

        {/* <section id="personalized-section" className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-primary font-medium">Recommended For You</div>
                        <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl">Personalized Suggestions</h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            Courses picked just for you to help you on your learning journey.
                        </p>
                    </div>
                </div>
                <div className="mx-auto grid max-w-5xl gap-6 pt-12 sm:grid-cols-2 lg:grid-cols-3 lg:max-w-none">
                    {recommendedContributions.map((contribution) => (
                        <ContributionCard key={contribution.id} contribution={contribution} />
                    ))}
                </div>
            </div>
        </section> */}

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-background px-3 py-1 text-sm text-primary font-medium">Key Features</div>
                <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl">Your Academic Swiss Army Knife</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Everything you need to succeed, all in one place. Powered by community and collaboration.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none mt-12">
              {features.map((feature) => (
                <div key={feature.title} className="grid gap-4 p-6 rounded-lg bg-card shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
                  {feature.icon}
                  <div className="grid gap-1">
                    <h3 className="font-headline text-xl font-bold">{feature.title}</h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Ready to Explore?</h2>
                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                  Discover study materials, notes, and resources shared by students.
                </p>
              </div>
              <Button size="lg" asChild>
                <Link href="/contributions">
                  Browse All Resources
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-4xl text-center bg-card border rounded-2xl p-8 md:p-12 lg:p-16 relative overflow-hidden">
                <div className="relative">
                    <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-primary font-medium mb-4">Community Powered</div>
                    <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Help Me Grow</h2>
                    <p className="mt-4 max-w-xl mx-auto text-lg text-muted-foreground">
                        This platform was built for the benefit of all students. If you find it useful, consider showing your support.
                    </p>
                    <div className="mt-8">
                        <Button size="lg" asChild>
                            <Link href="/contact?subject=sponsor">
                                <Coffee className="mr-2 h-4 w-4" />
                                Buy me a Coffee
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
          </div>
        </section>

        {/* <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-4xl text-center bg-gray-900 text-white rounded-2xl p-8 md:p-12 lg:p-16 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 via-transparent to-primary/20 opacity-30"></div>
                <div className="relative">
                    <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Unlock Premium Access</h2>
                    <p className="mt-4 max-w-xl mx-auto text-lg text-gray-300">
                        Gain access to exclusive content, personalized recommendations, and advanced features.
                    </p>
                    <div className="mt-8">
                        <Button size="lg" asChild>
                            <Link href="/signup">
                                Get Started
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
          </div>
        </section> */}

        {/* <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-background px-3 py-1 text-sm text-primary font-medium">Featured Contributions</div>
                <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl">Start Your Learning Journey</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Explore some of our most popular contributions and find your next passion.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 pt-12 sm:grid-cols-2 lg:grid-cols-3 lg:max-w-none">
              {featuredContributions.map((contribution) => (
                <ContributionCard key={contribution.id} contribution={contribution} />
              ))}
            </div>
             <div className="text-center mt-12">
                <Button size="lg" asChild>
                    <Link href="/contributions">
                        Explore All Contributions
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
          </div>
        </section> */}
      </main>
      <AppFooter />
    </div>
  );
}
