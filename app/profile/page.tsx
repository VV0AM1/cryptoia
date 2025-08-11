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
    <div className={`flex p-16 w-full min-h-screen bg-zinc-900`}>
        <div className={`${marginLeft} flex ${contentWidth}`}>
            <ProfileSidebar />
            <div className="flex-1 px-6 py-8">
                <ProfileHeader />
                <div className="mt-6 space-y-6 max-w-2xl">
                    <ProfileDataForm />
                    <LinkedAccounts />
                </div>
            </div>
        </div>
    </div>
  );
}