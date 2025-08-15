'use client';

import ProfileSidebar from '@/components/ProfileSidebar';
import ProfileHeader from '@/components/ProfileHeader';
import ProfileDataForm from '@/components/ProfileDataForm';
import LinkedAccounts from '@/components/LinkedAccounts';
import { useSidebar } from '@/app/context/SidebarContext';

export default function ProfilePage() {
  const { isOpened } = useSidebar();
  const marginLeft = isOpened ? 'md:ml-[300px]' : 'md:ml-[190px]';
  const contentWidth = 'w-full lg:w-[calc(100%-300px)]';

  return (
    <div
      className={`
        min-h-screen w-full bg-zinc-900
        
        px-4 sm:px-6 lg:px-10
        pt-12 pb-10
      `}
    >
      <div className="md:hidden sticky top-16 z-30 -mx-4 px-4 py-2 bg-zinc-900/90 backdrop-blur border-b border-zinc-800">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <a href="#personal" className="px-3 py-1.5 rounded-full text-sm bg-zinc-800 border border-zinc-700 text-zinc-200">Personal</a>
          <a href="#security" className="px-3 py-1.5 rounded-full text-sm bg-zinc-800 border border-zinc-700 text-zinc-200">Security</a>
          <a href="#links" className="px-3 py-1.5 rounded-full text-sm bg-zinc-800 border border-zinc-700 text-zinc-200">Linked</a>
        </div>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-12 ${marginLeft} ${contentWidth} gap-6`}>
        <div className="hidden md:block md:col-span-3">
          <ProfileSidebar />
        </div>

        <main className="md:col-span-9 min-w-0">
          <ProfileHeader />
          <div className="mt-6 space-y-6 max-w-4xl">
            <ProfileDataForm />
            <section id="security" className="bg-zinc-800 text-white rounded-2xl p-4 sm:p-6 border border-zinc-700">
              <h2 className="text-xl font-semibold">Login & Security</h2>
              <p className="text-sm text-zinc-400 mt-2">Manage password, 2FA, and sessions (coming soon).</p>
            </section>
            <section id="links">
              <LinkedAccounts />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}