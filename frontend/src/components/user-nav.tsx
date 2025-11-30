
"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from 'next/link';
import { LogOut, User, Settings, CreditCard } from "lucide-react";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import { Skeleton } from "./ui/skeleton";
import { authFetch, logout } from "@/lib/auth";

type UserProfile = {
  first_name: string | null;
  last_name: string | null;
  username: string;
  email: string;
  profile_picture: string | null;
};

export function UserNav() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUserProfile() {
      // Check for token existence synchronously
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const data: UserProfile = await authFetch('/api/accounts/user-profile/');
        setUserProfile(data);
      } catch (error) {
        console.error("Failed to fetch user profile, logging out.", error);
        logout();
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed", error);
      // Even if server-side logout fails, clear client-side data
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
  };

  if (isLoading) {
    return <Skeleton className="h-9 w-9 rounded-full" />;
  }
  
  if (!userProfile) {
     // This case is for when loading is done but there's no user profile (e.g., no token)
     // The SiteHeader component will handle showing Login/SignUp buttons.
     return null;
  }

  const getFullImageUrl = (path: string | null | undefined) => {
    if (!path) return undefined;
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}${path}`;
  };

  const displayName = (userProfile.first_name && userProfile.last_name) 
    ? `${userProfile.first_name} ${userProfile.last_name}` 
    : userProfile.username;

  const fallbackLetter = userProfile.first_name 
    ? userProfile.first_name.charAt(0).toUpperCase() 
    : (userProfile.username ? userProfile.username.charAt(0).toUpperCase() : '?');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={getFullImageUrl(userProfile.profile_picture) || ''} alt={userProfile.username} />
            <AvatarFallback>{fallbackLetter}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userProfile.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
