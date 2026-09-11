'use client';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { PostCard, Post } from '@/components/post/PostCard';
import { Award, Calendar, MessageSquare, FileText } from 'lucide-react';
import { formatKarma, timeAgo } from '@/lib/utils';
import Link from 'next/link';

interface UserProfileData {
  user: {
    id: string;
    username: string;
    bio: string;
    avatar_url?: string;
    karma: number;
    created_at: string;
    community_count?: number;
  };
  posts: Post[];
  comments: Array<{
    id: string;
    body: string;
    vote_count: number;
    created_at: string;
    post_id: string;
    post_title: string;
  }>;
}

export default function UserProfilePage() {
  const params = useParams();
  const username = params?.username as string;
  const [tab, setTab] = useState<'posts' | 'comments'>('posts');

  const { data, isLoading } = useSWR<UserProfileData>(
    username ? `/users/${username}` : null
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-4xl mx-auto">
        <div className="h-44 bg-[--surface] rounded-3xl border border-[--border] animate-pulse" />
      </div>
    );
  }

  if (!data?.user) {
    return (
      <div className="bg-[--surface] rounded-3xl border border-[--border] p-12 text-center max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-2">User not found</h2>
        <p className="text-sm text-[--muted]">u/{username} does not exist.</p>
      </div>
    );
  }

  const { user, posts, comments } = data;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Profile Card */}
      <div className="bg-[--surface] rounded-3xl border border-[--border] p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <Avatar src={user.avatar_url} username={user.username} size={72} />
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-[--foreground]">u/{user.username}</h1>
          {user.bio && (
            <p className="text-sm text-[--muted] mt-1.5 leading-relaxed">{user.bio}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-[--muted] mt-3 flex-wrap">
            <span className="flex items-center gap-1 font-semibold text-[--primary]">
              <Award className="w-4 h-4" /> {formatKarma(user.karma || 0)} karma
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Joined {timeAgo(user.created_at)}
            </span>
          </div>
        </div>
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
          <span>Posts ({posts?.length || 0})</span>
        </button>
        <button
          onClick={() => setTab('comments')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            tab === 'comments'
              ? 'bg-[--primary] text-white shadow-xs'
              : 'text-[--muted] hover:text-[--foreground]'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Comments ({comments?.length || 0})</span>
        </button>
      </div>

      {/* Content List */}
      {tab === 'posts' ? (
        <div className="flex flex-col gap-3">
          {posts?.length === 0 ? (
            <div className="bg-[--surface] rounded-2xl border border-[--border] p-8 text-center text-sm text-[--muted]">
              u/{user.username} hasn&apos;t posted anything yet.
            </div>
          ) : (
            posts?.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {comments?.length === 0 ? (
            <div className="bg-[--surface] rounded-2xl border border-[--border] p-8 text-center text-sm text-[--muted]">
              u/{user.username} hasn&apos;t commented yet.
            </div>
          ) : (
            comments?.map((c) => (
              <div
                key={c.id}
                className="bg-[--surface] rounded-2xl border border-[--border] p-4 shadow-xs"
              >
                <div className="text-xs text-[--muted] mb-1.5">
                  <span>Commented on </span>
                  <Link href={`/post/${c.post_id}`} className="font-semibold text-[--primary] hover:underline">
                    &quot;{c.post_title}&quot;
                  </Link>
                  <span> • {timeAgo(c.created_at)}</span>
                </div>
                <p className="text-sm text-[--foreground] leading-relaxed">{c.body}</p>
                <div className="text-xs font-semibold text-[--muted] mt-2">
                  {formatKarma(c.vote_count)} points
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
