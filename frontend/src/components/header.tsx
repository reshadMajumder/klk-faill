
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, GraduationCap, LogIn, LogOut, PlusCircle, Search, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Logo } from './logo';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';

export function Header() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      // The router push is now handled within the logout function of the auth context
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Logout Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Logo />
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium ml-6">
          <Link href="/contributions" className="transition-colors hover:text-primary">
            Discover
          </Link>
           <Link href="/top-contributors" className="transition-colors hover:text-primary">
            Top Contributors
          </Link>
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2 md:space-x-4">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <form>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search contributions..."
                  className="w-full pl-9 md:w-[250px] lg:w-[300px]"
                />
              </div>
            </form>
          </div>
          {isLoading ? (
            <Skeleton className="h-9 w-24 rounded-md" />
          ) : isAuthenticated && user ? (
            <>
              <Button asChild>
                <Link href="/contributions/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                   <DropdownMenuItem asChild>
                    <Link href="/profile/enrollments">
                      <GraduationCap className="mr-2 h-4 w-4" />
                      <span>My Enrollments</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
             <Button asChild>
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
