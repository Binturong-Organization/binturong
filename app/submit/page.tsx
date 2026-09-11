'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import { FileText, Link2, ArrowLeft, Sparkles, Send } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { Community } from '@/components/community/CommunityCard';

type PostType = 'text' | 'image' | 'link';

function CreatePostContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCommunityId = searchParams.get('community') || '';

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data: communitiesData } = useSWR<{ communities: Community[] }>('/communities');

  const [type, setType] = useState<PostType>('text');
  const [communityId, setCommunityId] = useState(preselectedCommunityId);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (preselectedCommunityId) {
      setCommunityId(preselectedCommunityId);
    } else if (communitiesData?.communities?.[0]?.id && !communityId) {
      setCommunityId(communitiesData.communities[0].id);
    }
  }, [preselectedCommunityId, communitiesData, communityId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !communityId) return;
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/posts', {
        title: title.trim(),
        type,
        body: type === 'text' ? body : '',
        url: type === 'link' ? url : undefined,
        community_id: communityId,
      });

      const newPost = res.data.data;
      router.push(`/post/${newPost.id}`);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error || 'Failed to submit post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[--border] bg-[--surface] text-xs text-[--muted] hover:text-[--foreground] hover:border-[--primary]/40 font-semibold transition-all shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[--primary]" />
          <span>Back to feed</span>
        </Link>
      </div>

      <div className="bg-[--surface] rounded-3xl border border-[--border] p-6 sm:p-8 shadow-sm flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[--primary-light] text-[--primary] flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[--foreground]">Create a Post</h1>
            <p className="text-xs text-[--muted]">Publish discussions or share links with the community</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-[--danger] rounded-2xl px-4 py-3 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Community Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[--foreground]">Target Community</label>
            <select
              value={communityId}
              onChange={(e) => setCommunityId(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-[--border] bg-[--surface-subtle] text-xs sm:text-sm font-semibold text-[--foreground] focus:outline-none focus:ring-2 focus:ring-[--primary]/30 focus:border-[--primary] transition-all cursor-pointer"
              required
            >
              <option value="" disabled>
                Choose where to post...
              </option>
              {communitiesData?.communities?.map((c) => (
                <option key={c.id} value={c.id}>
                  b/{c.name} ({c.member_count} members)
                </option>
              ))}
            </select>
          </div>

          {/* Post Type Selector Tabs */}
          <div className="flex rounded-2xl bg-[--surface-subtle] p-1.5 border border-[--border] gap-1.5">
            <button
              type="button"
              onClick={() => setType('text')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                type === 'text'
                  ? 'bg-[--surface] text-[--foreground] shadow-sm border border-[--border]'
                  : 'text-[--muted] hover:text-[--foreground]'
              }`}
            >
              <FileText className="w-4 h-4 text-[--primary]" />
              <span>Post Discussion</span>
            </button>
            <button
              type="button"
              onClick={() => setType('link')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                type === 'link'
                  ? 'bg-[--surface] text-[--foreground] shadow-sm border border-[--border]'
                  : 'text-[--muted] hover:text-[--foreground]'
              }`}
            >
              <Link2 className="w-4 h-4 text-[--secondary]" />
              <span>Share Link</span>
            </button>
          </div>

          {/* Title input */}
          <div>
            <Input
              label="Post Title"
              placeholder="Give your post a descriptive and compelling headline"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={300}
            />
            <div className="text-right mt-1">
              <span className="text-[10px] text-[--muted]">{title.length}/300</span>
            </div>
          </div>

          {/* Content field */}
          {type === 'text' && (
            <Textarea
              label="Body Text (Optional)"
              placeholder="Add more details, insights, or format with markdown..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
            />
          )}

          {type === 'link' && (
            <Input
              label="Web Address (URL)"
              type="url"
              placeholder="https://example.com/article"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          )}

          <div className="flex items-center justify-between pt-4 border-t border-[--border]">
            <Link href="/">
              <Button type="button" variant="ghost" size="sm">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={!title.trim() || !communityId}
              className="gap-1.5 shadow-md shadow-[--primary]/20 bg-gradient-to-r from-[--primary] to-[--accent] border-0"
            >
              <Send className="w-4 h-4" />
              <span>Publish Post</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreatePostPage() {
  return (
    <Suspense fallback={<div className="h-64 bg-[--surface] rounded-3xl border border-[--border] animate-pulse" />}>
      <CreatePostContent />
    </Suspense>
  );
}
