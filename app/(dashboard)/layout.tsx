import { redirect } from 'next/navigation';
import { db } from '@/lib/data';
import { getSessionUserId } from '@/lib/session';
import { Sidebar } from '@/components/dashboard/Sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const userId = await getSessionUserId();
  if (!userId) redirect('/login');

  const agent = await db.agentProfile.get(userId);
  if (!agent) redirect('/login');

  return (
    <div className="dash">
      <Sidebar active="dashboard" agent={agent} />
      <main className="dash__main">{children}</main>
    </div>
  );
}
