
'use client';

import { useState, useEffect, useCallback } from 'react';
import { ContributionCard } from "@/components/contribution-card";
import { Button } from '@/components/ui/button';
import { fetchContributions, type ContributionFilters } from './actions';
import type { Contribution } from '@/lib/types';
import { Loader2, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { University, Department } from '@/app/contributions/new/actions';
import { useDebounce } from '@/hooks/use-debounce';

export default function ContributionsPage() {
  const { toast } = useToast();
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [prevPageUrl, setPrevPageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filter state
  const [filters, setFilters] = useState<ContributionFilters>({});
  const debouncedTitleFilter = useDebounce(filters.title, 500);

  // State for filter dropdowns
  const [universities, setUniversities] = useState<University[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  
  useEffect(() => {
    async function fetchUniversities() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/institutions/universities/`);
        if (!response.ok) throw new Error('Failed to fetch universities');
        setUniversities(await response.json());
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error fetching data',
          description: 'Could not load universities for filtering.',
        });
      }
    }
    fetchUniversities();
  }, [toast]);

  const handleUniversityChange = (universityId: string) => {
    handleFilterChange('university', universityId);
    const selectedUniversity = universities.find(u => u.id === universityId);
    setDepartments(selectedUniversity?.departments || []);
    handleFilterChange('department', undefined); // Reset department on university change
  };


  const loadContributions = useCallback(async (url?: string, newFilters?: ContributionFilters) => {
    setIsLoading(true);
    const effectiveFilters = newFilters ?? { ...filters, title: debouncedTitleFilter };

    try {
        const { contributions: newContributions, next, previous } = await fetchContributions(url, effectiveFilters);
        setContributions(newContributions);
        setNextPageUrl(next);
        setPrevPageUrl(previous);
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load contributions.' });
    } finally {
        setIsLoading(false);
    }
  }, [filters, debouncedTitleFilter, toast]);

  useEffect(() => {
    // This effect triggers the search when filters change.
    // The debounce on the title filter prevents excessive API calls while typing.
    loadContributions(undefined, { ...filters, title: debouncedTitleFilter });
  }, [debouncedTitleFilter, filters.university, filters.department]); // re-run when filters change


  const handleFilterChange = (name: keyof ContributionFilters, value: string | undefined) => {
    // When clearing a filter, we pass `undefined` to remove it from the state
    setFilters(prev => {
        const newFilters = { ...prev };
        if (value) {
            newFilters[name] = value;
        } else {
            delete newFilters[name];
        }
        return newFilters;
    });
  };

  const handlePageChange = (url: string | null) => {
    if (url) {
       loadContributions(url, filters);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <header className="mb-8">
        <h1 className="font-headline text-4xl font-bold tracking-tight">
          Explore All Contributions
        </h1>
        <p className="text-muted-foreground mt-2">
          Find the perfect study guide for your next exam.
        </p>
      </header>

      <Card className="mb-8 p-4 md:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="lg:col-span-2">
                <label htmlFor="search" className="block text-sm font-medium text-foreground mb-1">Search by Title</label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="search"
                        placeholder="e.g., 'Calculus Finals'"
                        className="pl-9"
                        value={filters.title || ''}
                        onChange={(e) => handleFilterChange('title', e.target.value)}
                    />
                </div>
            </div>
            <div>
                 <label htmlFor="university" className="block text-sm font-medium text-foreground mb-1">University</label>
                 <Select
                    value={filters.university}
                    onValueChange={(value) => handleUniversityChange(value === 'all' ? '' : value)}
                  >
                    <SelectTrigger id="university">
                        <SelectValue placeholder="All Universities" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Universities</SelectItem>
                        {universities.map(uni => <SelectItem key={uni.id} value={uni.id}>{uni.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div>
                 <label htmlFor="department" className="block text-sm font-medium text-foreground mb-1">Department</label>
                 <Select
                    value={filters.department}
                    onValueChange={(value) => handleFilterChange('department', value === 'all' ? undefined : value)}
                    disabled={!filters.university || departments.length === 0}
                 >
                    <SelectTrigger id="department">
                        <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {departments.map(dep => <SelectItem key={dep.id} value={dep.id}>{dep.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
        </div>
      </Card>

      {isLoading ? (
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-80 w-full" />
            ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {contributions.map((contribution) => (
              <ContributionCard key={contribution.id} contribution={contribution} />
            ))}
          </div>
          {contributions.length === 0 && !isLoading && (
            <Card className="col-span-full">
              <CardContent className="p-12 text-center">
                  <h3 className="font-headline text-2xl">No Contributions Found</h3>
                  <p className="text-muted-foreground mt-2">
                      No contributions matched your filter criteria. Try adjusting your search.
                  </p>
              </CardContent>
            </Card>
          )}
          <div className="flex justify-center items-center gap-4 mt-12">
            {prevPageUrl && (
              <Button onClick={() => handlePageChange(prevPageUrl)} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Previous
              </Button>
            )}
            {nextPageUrl && (
              <Button onClick={() => handlePageChange(nextPageUrl)} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Next
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
