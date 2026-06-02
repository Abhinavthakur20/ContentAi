import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';
import { getUserFromCookies } from '@/lib/auth';

export default async function DashboardPage() {
  const user = await getUserFromCookies();

  if (!user) {
    redirect('/login?redirect=/dashboard');
  }

  return <DashboardClient />;
}
