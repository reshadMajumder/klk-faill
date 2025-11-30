
'use client';

import { PageHeader } from "@/components/page-header";
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowRight, BookMarked, PlusCircle, Edit, Library } from "lucide-react";
import { useEffect, useState } from "react";
import { authFetch } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";
import type { ApiContribution } from "@/lib/data";
import { Button } from "@/components/ui/button";

const dashboardLinks = [
    {
        title: "My Enrollments",
        description: "View all the contributions you are enrolled in.",
        href: "/dashboard/my-enrollments",
        icon: <BookMarked className="h-6 w-6 text-primary" />
    },
    {
        title: "My Contributions",
        description: "Manage all the contributions you have created.",
        href: "/dashboard/my-contributions",
        icon: <Edit className="h-6 w-6 text-primary" />
    },
    {
        title: "Create New Contribution",
        description: "Share your knowledge with the community.",
        href: "/dashboard/create-contribution",
        icon: <PlusCircle className="h-6 w-6 text-primary" />
    }
]

type UserProfile = {
  first_name: string | null;
  last_name: string | null;
  username: string;
};

type Enrollment = {
  id: string;
  contribution: ApiContribution;
};


export default function DashboardPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [contributions, setContributions] = useState<ApiContribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [profileData, enrollmentsData, contributionsData] = await Promise.all([
          authFetch('/api/accounts/user-profile/'),
          authFetch('/api/enrollment/list/'),
          authFetch('/api/contributions/user/')
        ]);
        setUserProfile(profileData);
        setEnrollments(enrollmentsData.data || []);
        setContributions(contributionsData.data || []);

      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  const welcomeName = userProfile?.username || 'User';

  const stats = [
    {
      title: "Total Enrollments",
      value: isLoading ? <Skeleton className="h-6 w-10" /> : enrollments.length,
      icon: <BookMarked className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: "Contributions Created",
      value: isLoading ? <Skeleton className="h-6 w-10" /> : contributions.length,
      icon: <Library className="h-5 w-5 text-muted-foreground" />,
    }
  ];

  return (
    <div className="container mx-auto">
      {isLoading ? (
        <div className="space-y-2 mb-8">
            <Skeleton className="h-10 w-full md:w-1/2" />
            <Skeleton className="h-6 w-3/4" />
        </div>
      ) : (
        <PageHeader 
          title={`Welcome back, ${welcomeName}!`} 
          description="Here's a quick overview of your account." 
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardLinks.map((link) => (
          <Card key={link.href} className="h-full flex flex-col hover:border-primary transition-colors group">
            <Link href={link.href} className="flex flex-col flex-grow">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        {link.icon}
                        <CardTitle className="text-lg font-semibold">{link.title}</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground">{link.description}</p>
                </CardContent>
                 <CardFooter className="pt-0">
                    <Button asChild variant="outline" className="w-full justify-start group-hover:bg-primary group-hover:text-primary-foreground">
                        <Link href={link.href}>
                            Go to section
                            <ArrowRight className="h-4 w-4 ml-auto" />
                        </Link>
                    </Button>
                </CardFooter>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
