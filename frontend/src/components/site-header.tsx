
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { UserNav } from "@/components/user-nav";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Coffee, Menu, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

export function SiteHeader() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Check for token on client side
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);
  }, [pathname]); // Re-check on route change
  
  useEffect(() => {
    // Close sheet on route change
    setIsSheetOpen(false);
  }, [pathname]);

  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/verify-otp';

  const navLinks = [
    { href: "/contributions", label: "Contributions", loggedIn: 'either' },
    { href: "/dashboard", label: "Dashboard", loggedIn: true },
    { href: "/contact", label: "Contact", loggedIn: 'either' },
  ];

  return (
    <header className="px-4 lg:px-6 h-16 flex items-center border-b sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Link href="/" className="flex items-center justify-center mr-auto">
        <Logo className="h-6 w-auto" />
      </Link>
      
      {/* Desktop Nav */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
        {navLinks.map((link) => {
          if (link.loggedIn === true && !isLoggedIn) return null;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                  "transition-colors hover:text-foreground/80",
                  pathname.startsWith(link.href) ? "text-foreground" : "text-foreground/60"
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Desktop Buttons */}
      <div className="hidden md:flex ml-auto items-center gap-4 sm:gap-6">
        {isClient && (
            <Button variant="outline" asChild>
                <Link href="/contact?subject=sponsor">
                    <Coffee className="mr-2 h-4 w-4" />
                    Support Me
                </Link>
            </Button>
        )}
        {isClient && isLoggedIn ? (
          <UserNav />
        ) : (
          isClient && !isAuthPage && (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )
        )}
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden ml-4">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-3/4">
             <div className="flex justify-between items-center mb-8">
                 <Link href="/" className="flex items-center justify-center">
                    <Logo className="h-6 w-auto" />
                </Link>
                <SheetClose asChild>
                     <Button variant="ghost" size="icon">
                        <X />
                        <span className="sr-only">Close menu</span>
                    </Button>
                </SheetClose>
             </div>
            <nav className="flex flex-col gap-6 text-lg font-medium">
               {navLinks.map((link) => {
                if (link.loggedIn === true && !isLoggedIn) return null;
                return (
                    <SheetClose asChild key={link.href}>
                        <Link
                        href={link.href}
                        className={cn(
                            "transition-colors hover:text-foreground/80",
                            pathname.startsWith(link.href) ? "text-foreground" : "text-foreground/60"
                        )}
                        >
                        {link.label}
                        </Link>
                    </SheetClose>
                );
                })}
            </nav>
            <div className="mt-8 pt-8 border-t space-y-4">
                {isClient && (
                    <SheetClose asChild>
                        <Button variant="outline" asChild className="w-full">
                            <Link href="/contact?subject=sponsor">
                                <Coffee className="mr-2 h-4 w-4" />
                                Support Me
                            </Link>
                        </Button>
                    </SheetClose>
                )}
                {isClient && isLoggedIn ? (
                  <div>
                      <p className="text-sm text-muted-foreground mb-2">My Account</p>
                      <UserNav />
                  </div>
                ) : (
                  isClient && !isAuthPage && (
                    <div className="flex gap-4">
                      <SheetClose asChild>
                        <Button variant="ghost" asChild className="w-full">
                            <Link href="/login">Login</Link>
                        </Button>
                      </SheetClose>
                       <SheetClose asChild>
                        <Button asChild className="w-full">
                            <Link href="/signup">Sign Up</Link>
                        </Button>
                       </SheetClose>
                    </div>
                  )
                )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

    </header>
  );
}
