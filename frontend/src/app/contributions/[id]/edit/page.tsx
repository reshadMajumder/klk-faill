
import { notFound } from 'next/navigation';
import { getContributionById } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EditContributionForm } from './form';
import { cookies } from 'next/headers';


export default async function EditContributionPage({ params }: { params: { id: string }}) {
  const cookieStore = cookies();
  const tokens = cookieStore.get('authTokens');
  const accessToken = tokens ? JSON.parse(tokens.value).access : undefined;
  
  // The API requires authentication to get the editable details.
  const contribution = await getContributionById(params.id, accessToken);

  if (!contribution) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Edit Contribution</CardTitle>
          <CardDescription>Update the details of your contribution below.</CardDescription>
        </CardHeader>
        <CardContent>
            <EditContributionForm contribution={contribution} />
        </CardContent>
      </div>
    </div>
  );
}
