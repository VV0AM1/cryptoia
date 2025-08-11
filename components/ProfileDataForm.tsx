'use client';

import { useState, useEffect } from 'react';
import { User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfileDataForm() {
  const [name, setName] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch('/api/profile');
      const json = await res.json();
      setName(json.name || '');
    };

    fetchProfile();
  }, []);

  const handleUpload = async () => {
    if (!avatarFile) return;

    const fd = new FormData();
    fd.append('avatar', avatarFile);

    const res = await fetch('/api/profile/avatar', {
      method: 'POST',
      body: fd,
    });

    const json = await res.json();
    if (json.success) toast.success('Avatar updated!');
    else toast.error('Failed to upload avatar');
  };

  const handleSave = async () => {
    const res = await fetch('/api/profile/update-name', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    if (res.ok) {
      toast.success('Username updated!');
      const updated = await fetch('/api/profile');
      const json = await updated.json();
      setName(json.name);
    } else {
      toast.error('Failed to update name');
    }
  };

  return (
    <div className="bg-zinc-800 text-white rounded-2xl p-6">
      <h2 className="text-xl font-semibold mb-4">Personal Data</h2>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-zinc-700 rounded-full flex items-center justify-center text-zinc-400">
          <UserIcon className="w-8 h-8" />
        </div>
        <div className="space-y-1 text-sm">
          <p>Profile Picture</p>
          <p className="text-xs text-zinc-500">Use JPG/PNG, ≥64×64px, ≤4MB</p>
          <label className="inline-block mt-2">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
            />
            <button
              onClick={handleUpload}
              className="bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-1 rounded text-sm"
            >
              Upload Profile Picture
            </button>
          </label>
        </div>
      </div>

      <div className="mb-6">
        <label className="block mb-1 text-sm">Username</label>
        <input
          type="text"
          maxLength={30}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-zinc-700 rounded px-3 py-2 text-white"
        />
        <p className="text-xs text-zinc-500 mt-1">Max 30 characters</p>
      </div>

      <button
        onClick={handleSave}
        disabled={!name.trim()}
        className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        Save Profile
      </button>
    </div>
  );
}