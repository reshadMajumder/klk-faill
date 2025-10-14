
'use server';

export interface TopContributor {
    id: string;
    username: string;
    total_contributions: number;
    total_views: number;
}

export async function fetchTopContributors(): Promise<TopContributor[]> {
  // Using dummy data for now as requested.
  // Replace this with the actual API call when ready.
  const dummyContributors: TopContributor[] = [
    { id: 'user1', username: 'alex_the_great', total_contributions: 25, total_views: 15200 },
    { id: 'user2', username: 'maria_studies', total_contributions: 21, total_views: 12450 },
    { id: 'user3', username: 'chen_codes', total_contributions: 18, total_views: 9800 },
    { id: 'user4', username: 'sam_history_buff', total_contributions: 15, total_views: 7600 },
    { id: 'user5', username: 'jenna_bio_wiz', total_contributions: 12, total_views: 5300 },
  ];

  return Promise.resolve(dummyContributors);
}
