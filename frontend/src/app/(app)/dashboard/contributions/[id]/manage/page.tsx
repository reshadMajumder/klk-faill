
'use client';

import { useParams, useRouter, notFound } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { EditContributionForm } from './edit-contribution-form';
import { Button } from '@/components/ui/button';
import { Video, StickyNote } from 'lucide-react';
import Link from 'next/link';

export default function ManageContributionPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  if (!id) {
    return notFound();
  }

  return (
    <div className="container mx-auto">
      <PageHeader 
        title="Manage Contribution" 
        description="Edit details, add videos, and manage notes for your contribution." 
      />
      <div className="mb-8 p-6 border rounded-lg bg-card flex flex-col sm:flex-row items-center gap-4">
        <h3 className="text-lg font-semibold flex-grow">Content Management</h3>
        <div className="flex gap-2">
            <Button asChild variant="outline">
                <Link href={`/dashboard/contributions/${id}/videos`}>
                    <Video className="h-4 w-4 mr-2"/>
                    Manage Videos
                </Link>
            </Button>
            <Button asChild variant="outline">
                <Link href={`/dashboard/contributions/${id}/notes`}>
                    <StickyNote className="h-4 w-4 mr-2"/>
                    Manage Notes
                </Link>
            </Button>
        </div>
      </div>
      <EditContributionForm contributionId={id} />
    </div>
  );
}
