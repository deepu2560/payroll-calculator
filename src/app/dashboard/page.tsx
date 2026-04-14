import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { authCookieName, verifyToken } from '@/lib/auth';
import { DashboardClient } from '@/components/DashboardClient';

export default async function DashboardPage() {
  const token = cookies().get(authCookieName)?.value;

  if (!token) {
    redirect('/login');
  }

  try {
    const payload = await verifyToken(token);
    return <DashboardClient userEmail={payload.email} />;
  } catch {
    redirect('/login');
  }
}
