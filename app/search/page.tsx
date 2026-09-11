'use client';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { useState } from 'react';
import { PostCard, Post } from '@/components/post/PostCard';
import { CommunityCard, Community } from '@/components/community/CommunityCard';
import { Avatar } from '@/components/ui/Avatar';
import { Search, FileText, Users, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { formatKarma } from '@/lib/utils';

interface SearchResults {
  posts?: Post[];
  communities?: Community[];
  users?: Array<{
    id: string;
    username: string;
    bio: string;
    avatar_url?: string;
    karma: number;
  }>;
}

import { Suspense } from 'react';

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const [tab, setTab] = useState<'posts' | 'communities' | 'users'>('posts');

  const { data, isLoading } = useSWR<{ data: SearchResults }>(
    q.length >= 2 ? `/search?q=${encodeURIComponent(q)}&type=all` : null
  );

  const results = data?.data;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-[--surface] rounded-3xl border border-[--border] p-6 shadow-xs">
        <div className="flex items-center gap-2 text-xs text-[--muted] uppercase tracking-wider mb-1">
          <Search className="w-4 h-4 text-[--primary]" />
          <span>Search Results</span>
        </div>
        <h1 className="text-xl font-bold text-[--foreground]">
          {q ? `Results for "${q}"` : 'Enter a search term'}
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-[--surface] p-1.5 border border-[--border] shadow-xs gap-2">
        <button
          onClick={() => setTab('posts')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            tab === 'posts'
              ? 'bg-[--primary] text-white shadow-xs'
              : 'text-[--muted] hover:text-[--foreground]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Posts ({results?.posts?.length || 0})</span>
        </button>
        <button
          onClick={() => setTab('communities')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            tab === 'communities'
              ? 'bg-[--primary] text-white shadow-xs'
              : 'text-[--muted] hover:text-[--foreground]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Communities ({results?.communities?.length || 0})</span>
        </button>
        <button
          onClick={() => setTab('users')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            tab === 'users'
              ? 'bg-[--primary] text-white shadow-xs'
              : 'text-[--muted] hover:text-[--foreground]'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Users ({results?.users?.length || 0})</span>
        </button>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-[--surface] rounded-2xl border border-[--border] animate-pulse" />
          ))}
        </div>
      ) : (
        <div>
          {tab === 'posts' && (
            <div className="flex flex-col gap-3">
              {results?.posts?.length === 0 ? (
                <div className="bg-[--surface] rounded-2xl border border-[--border] p-8 text-center text-sm text-[--muted]">
                  No matching posts found.
                </div>
              ) : (
                results?.posts?.map((post) => <PostCard key={post.id} post={post} />)
              )}
            </div>
          )}

          {tab === 'communities' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results?.communities?.length === 0 ? (
                <div className="col-span-full bg-[--surface] rounded-2xl border border-[--border] p-8 text-center text-sm text-[--muted]">
                  No matching communities found.
                </div>
              ) : (
                results?.communities?.map((comm) => <CommunityCard key={comm.id} community={comm} />)
              )}
            </div>
          )}

          {tab === 'users' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results?.users?.length === 0 ? (
                <div className="col-span-full bg-[--surface] rounded-2xl border border-[--border] p-8 text-center text-sm text-[--muted]">
                  No matching users found.
                </div>
              ) : (
                results?.users?.map((u) => (
                  <Link key={u.id} href={`/user/${u.username}`} className="block group">
                    <div className="bg-[--surface] rounded-2xl border border-[--border] p-4 flex items-center gap-3.5 hover:border-[--primary]/40 transition-all">
                      <Avatar src={u.avatar_url} username={u.username} size={48} />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm group-hover:text-[--primary] transition-colors">
                          u/{u.username}
                        </h3>
                        <p className="text-xs text-[--muted]">{formatKarma(u.karma || 0)} karma</p>
                        {u.bio && <p className="text-xs text-[--muted] truncate mt-1">{u.bio}</p>}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="h-64 bg-[--surface] rounded-3xl border border-[--border] animate-pulse" />}>
      <SearchContent />
    </Suspense>
  );
}
