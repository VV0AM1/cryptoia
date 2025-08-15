'use client';

import { signOut } from 'next-auth/react';
import { User as UserIcon, ShieldCheck, Trash2, LogOut, Settings } from 'lucide-react';

export default function ProfileSidebar() {
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your account? This action is irreversible.')) return;
    const res = await fetch('/api/profile/delete', { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err?.error || 'Failed to delete account');
      return;
    }
    await signOut({ callbackUrl: '/' });
  };

  const nav = [
    { label: 'Personal Data', href: '#personal', icon: UserIcon },
    { label: 'Login & Security', href: '#security', icon: ShieldCheck },
    { label: 'General Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="pr-6 border-r border-zinc-800">
      <div className="sticky top-24 space-y-3">
        <h2 className="text-lg font-semibold text-white">Settings</h2>
        <nav className="space-y-2">
          {nav.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800/70 transition"
            >
              <Icon className="w-4 h-4" />
              {label}
            </a>
          ))}

          <button
            onClick={handleDelete}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:text-white hover:bg-red-600/20 transition"
          >
            <Trash2 className="w-4 h-4" />
            Delete Account
          </button>

          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800/70 transition"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </nav>
      </div>
    </aside>
  );
}