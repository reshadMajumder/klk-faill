
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NewContributionForm } from './form';

export default function NewContributionPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Create a New Contribution</CardTitle>
          <CardDescription>Fill out the form below to share your study materials with the community.</CardDescription>
        </CardHeader>
        <CardContent>
          <NewContributionForm />
        </CardContent>
      </Card>
    </div>
  );
}
