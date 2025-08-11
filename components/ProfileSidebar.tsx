'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { User as UserIcon, ShieldCheck, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast'; // Optional: remove if you're not using toasts

export default function ProfileSidebar() {
  const router = useRouter();

  const handleDelete = async () => {
    const confirmed = confirm('Are you sure you want to delete your account? This action is irreversible.');

    if (!confirmed) return;

    try {
      const res = await fetch('/api/profile/delete', { method: 'DELETE' });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error?.error || 'Failed to delete account');
        return;
      }

      toast.success('Account deleted successfully');
      await signOut({ callbackUrl: '/' });
    } catch (err) {
      toast.error('Something went wrong');
    }
  };

  return (
    <aside className="hidden md:block w-[240px] border-r border-zinc-800 pr-4">
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Profile Settings</h2>
        <nav className="mt-4 space-y-2">
          <button className="flex items-center gap-2 p-2 bg-blue-600 rounded text-white">
            <UserIcon className="w-4 h-4" /> Personal Data
          </button>
          <button className="flex items-center gap-2 p-2 hover:text-white text-zinc-400">
            <ShieldCheck className="w-4 h-4" /> Login & Security
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 p-2 text-red-500 hover:text-red-400"
          >
            <Trash2 className="w-4 h-4" /> Delete Account
          </button>
        </nav>
      </div>
    </aside>
  );
}