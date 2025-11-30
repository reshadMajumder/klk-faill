
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createContribution } from '@/lib/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { API_BASE_URL } from '@/lib/api';
import { Switch } from '@/components/ui/switch';

type Department = {
  id: string;
  name: string;
};

type University = {
  id: string;
  name: string;
  departments: Department[];
};

type FormData = {
  title: string;
  description: string;
  course_code: string;
  department: string;
  related_university: string;
  thumbnail_image: File | null;
  active: boolean;
};

export function CreateContributionForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    course_code: '',
    department: '',
    related_university: '',
    thumbnail_image: null,
    active: true,
  });
  
  const [universities, setUniversities] = useState<University[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchUniversities() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/institutions/universities/`);
        if (!response.ok) {
          throw new Error('Failed to fetch universities');
        }
        const data = await response.json();
        setUniversities(data);
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load university data.',
        });
      }
    }
    fetchUniversities();
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (name: keyof Omit<FormData, 'active' | 'thumbnail_image'>, value: string) => {
    setFormData((prev) => {
      const newState = { ...prev, [name]: value };
      if (name === 'related_university') {
        // Reset department when university changes
        newState.department = '';
      }
      return newState;
    });
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, active: checked }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, thumbnail_image: e.target.files[0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const apiData = new FormData();
      apiData.append('title', formData.title);
      apiData.append('description', formData.description);
      apiData.append('price', "0.00");
      apiData.append('course_code', formData.course_code);
      apiData.append('department', formData.department);
      apiData.append('related_University', formData.related_university);
      apiData.append('active', String(formData.active));
      if (formData.thumbnail_image) {
        apiData.append('thumbnail_image', formData.thumbnail_image);
      }
      await createContribution(apiData);
      toast({ title: 'Success', description: 'Contribution created successfully.' });
      router.push('/dashboard');
      router.refresh(); // Refresh the page to show the updated list
    } catch (error: any) {
        const errorMessages = error.data ? Object.values(error.data).flat().join(' ') : (error.message || 'An error occurred.');
        toast({ 
            variant: 'destructive', 
            title: 'Error',
            description: errorMessages
        });
    } finally {
        setIsLoading(false);
    }
  };

  const departmentsForSelectedUniversity = useMemo(() => {
    const selectedUni = universities.find(uni => uni.id === formData.related_university);
    return selectedUni ? selectedUni.departments : [];
  }, [formData.related_university, universities]);

  return (
    <Card className="max-w-3xl mx-auto">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Create Contribution</CardTitle>
          <CardDescription>
            Fill out the form to add a new study resource. You can add content after creation.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
           <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={formData.title} onChange={handleInputChange} placeholder="e.g., Advanced Calculus Cheat Sheet" disabled={isLoading} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="course_code">Course Code (Optional)</Label>
            <Input id="course_code" value={formData.course_code} onChange={handleInputChange} placeholder="e.g., SE222" disabled={isLoading} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
             <div className="grid gap-2">
              <Label htmlFor="related_university">University</Label>
               <Select 
                name="related_university"
                value={formData.related_university}
                onValueChange={(value) => handleSelectChange('related_university', value)}
                disabled={universities.length === 0 || isLoading}
               >
                <SelectTrigger>
                  <SelectValue placeholder="Select a university" />
                </SelectTrigger>
                <SelectContent>
                  {universities.map(uni => (
                    <SelectItem key={uni.id} value={uni.id}>{uni.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="department">Department</Label>
              <Select 
                name="department"
                value={formData.department}
                onValueChange={(value) => handleSelectChange('department', value)}
                disabled={!formData.related_university || departmentsForSelectedUniversity.length === 0 || isLoading}
              >
                <SelectTrigger>
                    <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  {departmentsForSelectedUniversity.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={formData.description} onChange={handleInputChange} placeholder="Provide a brief summary..." disabled={isLoading} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="thumbnail_image">Thumbnail Image</Label>
            <Input id="thumbnail_image" type="file" onChange={handleFileChange} disabled={isLoading} />
          </div>
           <div className="flex items-center space-x-2">
            <Switch id="active" checked={formData.active} onCheckedChange={handleSwitchChange} disabled={isLoading} />
            <Label htmlFor="active">Make contribution active immediately</Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>Create Contribution</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
