
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { getEnrollmentById } from '@/lib/data';
import { EnrollmentDetailClientPage } from './enrollment-detail-client-page';

export default async function EnrolledContributionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const cookieStore = cookies();
  const tokens = cookieStore.get('authTokens');
  const accessToken = tokens ? JSON.parse(tokens.value).access : undefined;

  if (!accessToken) {
    // Redirect to login or show an error if not authenticated
    // This check could be handled by middleware, but for now it's here.
    notFound();
  }

  const enrollment = await getEnrollmentById(params.id, accessToken);
  
  if (!enrollment) {
    notFound();
  }
  
  return <EnrollmentDetailClientPage enrollment={enrollment} />;
}
