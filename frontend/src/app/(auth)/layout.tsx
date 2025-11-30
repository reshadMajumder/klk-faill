import { Logo } from "@/components/logo";
import Image from "next/image";
import Link from "next/link";
import { placeholderImages } from "@/lib/placeholder-images-data";
import { Button } from "@/components/ui/button";
import { AppFooter } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const authImage = placeholderImages.find(p => p.id === 'auth-image');

  return (
    <div className="flex flex-col min-h-screen bg-background">
       <SiteHeader />
      <main className="flex-1 flex items-center justify-center py-8 md:py-12">
        <div className="w-full grid grid-cols-1 md:grid-cols-2 container">
          <div className="flex items-center justify-center p-4 sm:p-8">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            {children}
            </div>
          </div>
          <div className="relative flex-col items-center justify-center hidden bg-muted p-10 text-white dark:border-r md:flex rounded-lg overflow-hidden">
            {authImage && (
                <Image
                src={authImage.imageUrl}
                alt={authImage.description}
                fill
                className="absolute inset-0 object-cover w-full h-full"
                data-ai-hint={authImage.imageHint}
              />
            )}
            <div className="absolute inset-0 bg-primary/80" />
            <div className="relative z-20 flex items-center text-lg font-medium">
              <Logo className="h-8 w-auto text-white"/>
            </div>
            <div className="relative z-20 mt-auto">
              <blockquote className="space-y-2">
                <p className="text-lg">
                  &ldquo;This platform has revolutionized the way I study and collaborate with my peers. A must-have for any student.&rdquo;
                </p>
                <footer className="text-sm">Sofia Davis</footer>
              </blockquote>
            </div>
          </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
