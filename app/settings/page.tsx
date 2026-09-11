'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import api from '@/lib/api';

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, updateUser } = useAuthStore();

  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (user) {
      setUsername(user.username || '');
      setBio(user.bio || '');
    }
  }, [isAuthenticated, user, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await api.patch('/users/me', {
        username: username.trim(),
        bio: bio.trim(),
      });
      updateUser(res.data.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-6">
      <div className="bg-[--surface] rounded-3xl border border-[--border] p-6 sm:p-8 shadow-sm">
        <h1 className="text-xl font-bold text-[--foreground] mb-1">User Settings</h1>
        <p className="text-xs text-[--muted] mb-6">Update your account information and public profile</p>

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl px-4 py-2.5 text-xs mb-4">
            Profile successfully saved!
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-[--danger] rounded-xl px-4 py-2.5 text-xs mb-4">
            {error}
          </div>
        )}

        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[--border]">
          <Avatar src={user?.avatar_url} username={username || 'user'} size={60} />
          <div>
            <h2 className="text-sm font-bold">u/{user?.username}</h2>
            <p className="text-xs text-[--muted]">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            maxLength={30}
          />

          <Textarea
            label="About You / Bio"
            placeholder="Tell the community about yourself..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            maxLength={500}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="submit" variant="primary" loading={loading}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
