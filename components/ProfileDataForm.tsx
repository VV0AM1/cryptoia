'use client';

import { useState, useEffect, useMemo } from 'react';
import { User as UserIcon, Image as ImageIcon, Trash2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const MAX_BYTES = 4 * 1024 * 1024;
const ACCEPT = ['image/png', 'image/jpeg', 'image/webp'];

export default function ProfileDataForm() {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null); 
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/profile', { cache: 'no-store' });
      const json = await res.json();
      setName(json.name || '');
      setAvatar(json.avatar || null);
    })();
  }, []);

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  const onPick = (f: File | null) => {
    if (!f) return;
    if (!ACCEPT.includes(f.type)) {
      toast.error('Only PNG, JPG, or WEBP files are allowed.');
      return;
    }
    if (f.size > MAX_BYTES) {
      toast.error('Max file size is 4 MB.');
      return;
    }
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Pick a file first.');
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const res = await fetch('/api/profile/avatar', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Upload failed');

      setAvatar(json.avatar);
      setFile(null);
      toast.success('Avatar updated!');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to upload');
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/profile/avatar', { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed');
      setAvatar(null);
      setFile(null);
      toast.success('Avatar removed');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to remove');
    } finally {
      setBusy(false);
    }
  };

  const handleSave = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/profile/update-name', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error('Failed to update name');
      toast.success('Username updated!');
    } catch (e: any) {
      toast.error(e?.message || 'Failed to update name');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="personal" className="bg-zinc-800 text-white rounded-2xl p-4 sm:p-6 border border-zinc-700">
      <h2 className="text-xl font-semibold mb-4">Personal Data</h2>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-zinc-700 flex items-center justify-center">
            {previewUrl ? (
              <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
            ) : avatar ? (
              <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-10 h-10 text-zinc-400" />
            )}
          </div>

          <label className="absolute -bottom-2 -right-2">
            <input
              type="file"
              accept={ACCEPT.join(',')}
              className="hidden"
              onChange={(e) => onPick(e.target.files?.[0] || null)}
            />
            <span className="inline-flex items-center gap-1 text-xs bg-zinc-700 hover:bg-zinc-600 px-2 py-1 rounded cursor-pointer border border-zinc-600">
              <ImageIcon className="w-3.5 h-3.5" /> Change
            </span>
          </label>
        </div>

        <div className="text-xs text-zinc-400">
          <p>Recommended: 256×256px PNG/JPG/WEBP</p>
          <p>Max size: 4MB</p>
        </div>

        <div className="ml-auto flex gap-2">
          {avatar && (
            <button
              onClick={handleRemove}
              disabled={busy}
              className="inline-flex items-center gap-2 text-xs px-3 py-2 rounded bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remove
            </button>
          )}
          {file && (
            <button
              onClick={handleUpload}
              disabled={busy}
              className="inline-flex items-center gap-2 text-xs px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" /> Upload
            </button>
          )}
        </div>
      </div>

      <div className="mb-6">
        <label className="block mb-1 text-sm">Username</label>
        <input
          type="text"
          maxLength={30}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-zinc-700 rounded px-3 py-2 text-white outline-none focus:ring-2 focus:ring-blue-500/40"
        />
        <p className="text-xs text-zinc-500 mt-1">Max 30 characters</p>
      </div>

      <button
        onClick={handleSave}
        disabled={!name.trim() || busy}
        className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        Save Profile
      </button>
    </section>
  );
}