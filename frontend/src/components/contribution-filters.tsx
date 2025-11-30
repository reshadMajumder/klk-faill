
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { API_BASE_URL } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

type Department = {
  id: string;
  name: string;
};

type University = {
  id: string;
  name: string;
  departments: Department[];
};

export function ContributionFilters() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [selectedUniversity, setSelectedUniversity] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function fetchFilterData() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/institutions/universities/`);
        if (!response.ok) throw new Error('Failed to fetch filter data');
        const data = await response.json();
        setUniversities(data);
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load filter options.',
        });
      }
    }
    fetchFilterData();
  }, [toast]);

  useEffect(() => {
    const university = searchParams.get('university') || '';
    const department = searchParams.get('department') || '';
    setSelectedUniversity(university);
    if(university) {
        const uni = universities.find(u => u.id === university);
        if(uni && uni.departments.find(d => d.id === department)) {
            setSelectedDepartment(department);
        } else {
            setSelectedDepartment('');
        }
    } else {
        setSelectedDepartment('');
    }
  }, [searchParams, universities]);

  const departments = useMemo(() => {
    if (!selectedUniversity) return [];
    const university = universities.find((uni) => uni.id === selectedUniversity);
    return university ? university.departments : [];
  }, [selectedUniversity, universities]);

  const handleFilterChange = (type: 'university' | 'department', value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Reset page when filter changes
    params.delete('page');

    // If the 'All' option is selected, remove the filter
    if (value === 'all' || !value) {
        params.delete(type);
        if (type === 'university') {
            params.delete('department'); // Also clear department when university is cleared
            setSelectedDepartment('');
            setSelectedUniversity('');
        } else {
            setSelectedDepartment('');
        }
    } else {
        params.set(type, value);
        if(type === 'university') {
            params.delete('department'); // Reset department when university changes
            setSelectedDepartment('');
        }
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Select
        value={selectedUniversity}
        onValueChange={(value) => handleFilterChange('university', value)}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="All Universities" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Universities</SelectItem>
          {universities.map((uni) => (
            <SelectItem key={uni.id} value={uni.id}>
              {uni.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={selectedDepartment}
        onValueChange={(value) => handleFilterChange('department', value)}
        disabled={!selectedUniversity || departments.length === 0}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="All Departments" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Departments</SelectItem>
          {departments.map((dept) => (
            <SelectItem key={dept.id} value={dept.id}>
              {dept.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
