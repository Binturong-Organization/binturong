'use client';
import Link from 'next/link';
import Image from 'next/image';
import { MessageSquare, Share2, ExternalLink, Sparkles, Check, Image as ImageIcon, Pin } from 'lucide-react';
import { VoteControl } from './VoteControl';
import { timeAgo, cn } from '@/lib/utils';
import { useState } from 'react';

export interface Post {
  id: string;
  title: string;
  body: string;
  type: 'text' | 'image' | 'link';
  url: string;
  image_url: string;
  vote_count: number;
  comment_count: number;
  created_at: string;
  author_username: string;
  author_avatar?: string;
  community_name: string;
  community_slug: string;
  community_icon?: string;
  is_pinned?: boolean;
  userVote?: number;
  likes_hidden?: boolean;
  comment_permission?: 'everyone' | 'members' | 'nobody';
  view_permission?: 'everyone' | 'members';
  likes_visibility?: 'everyone' | 'members' | 'author';
}

interface PostCardProps {
  post: Post;
  compact?: boolean;
}

export function PostCard({ post, compact }: PostCardProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <article className="bg-[--surface] rounded-3xl border border-[--border] flex overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-[--primary]/40 transition-all duration-200 group">
      {/* Left Vote Capsule */}
      <div className="flex flex-col items-center py-4 pl-3.5 pr-2">
        <VoteControl
          targetType="post"
          targetId={post.id}
          initialCount={post.vote_count ?? 0}
          initialVote={post.userVote}
          hideCount={post.likes_hidden}
        />
      </div>

      {/* Main Post Body */}
      <div className="flex-1 p-4 pl-2 min-w-0 flex flex-col justify-between">
        <div>
          {/* Header Metadata */}
          <div className="flex items-center gap-2 text-xs text-[--muted] mb-2 flex-wrap">
            <Link
              href={`/r/${post.community_slug}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[--primary-light] text-[--primary] font-bold hover:brightness-95 transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-[--primary]" />
              <span>b/{post.community_name}</span>
            </Link>

            {post.is_pinned && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold text-[10px] border border-emerald-500/20">
                <Pin className="w-3 h-3" /> Pinned
              </span>
            )}

            <span className="text-[--border-strong]">•</span>

            <span className="text-[11px]">Posted by</span>
            <Link
              href={`/user/${post.author_username}`}
              className="text-[11px] font-semibold text-[--foreground] hover:text-[--primary] transition-colors"
            >
              u/{post.author_username}
            </Link>

            <span className="text-[--border-strong]">•</span>
            <span className="text-[11px]">{timeAgo(post.created_at)}</span>

            {post.type === 'link' && (
              <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[--secondary-light] text-[--secondary] text-[10px] font-bold">
                <ExternalLink className="w-2.5 h-2.5" /> Link
              </span>
            )}
            {post.type === 'image' && (
              <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[--accent-light] text-[--accent] text-[10px] font-bold">
                <ImageIcon className="w-2.5 h-2.5" /> Media
              </span>
            )}
          </div>

          {/* Post Title */}
          <Link href={`/post/${post.id}`} className="block group-hover:text-[--primary] transition-colors">
            <h2
              className={cn(
                'font-bold text-[--foreground] leading-snug group-hover:text-[--primary] transition-colors',
                compact ? 'text-sm' : 'text-base sm:text-lg'
              )}
            >
              {post.title}
            </h2>
          </Link>

          {/* Text preview */}
          {!compact && post.type === 'text' && post.body && (
            <p className="text-xs sm:text-sm text-[--muted] mt-2 line-clamp-3 leading-relaxed">
              {post.body}
            </p>
          )}

          {/* Link preview card */}
          {!compact && post.type === 'link' && post.url && (
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-between gap-3 p-3 rounded-2xl border border-[--border] bg-[--surface-subtle] hover:border-[--primary]/50 hover:bg-[--primary-light]/50 transition-all group/link"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-[--surface] border border-[--border] flex items-center justify-center text-[--primary] shadow-xs">
                  <ExternalLink className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[--foreground] truncate">{post.url}</p>
                  <p className="text-[10px] text-[--muted]">External source</p>
                </div>
              </div>
              <span className="text-xs font-bold text-[--primary] group-hover/link:translate-x-0.5 transition-transform">
                Visit ↗
              </span>
            </a>
          )}

          {/* Image preview */}
          {!compact && post.type === 'image' && post.image_url && (
            <div className="mt-3 rounded-2xl overflow-hidden max-h-96 relative bg-black/5 border border-[--border]">
              <Image
                src={post.image_url}
                alt={post.title}
                width={800}
                height={450}
                className="w-full object-contain max-h-96"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[--border]/60 text-xs text-[--muted]">
          <Link
            href={`/post/${post.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[--surface-subtle] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[--foreground] font-semibold transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[--primary]" />
            <span>
              {post.comment_count} {post.comment_count === 1 ? 'Comment' : 'Comments'}
            </span>
          </Link>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[--surface-subtle] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[--foreground] font-semibold transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[--primary]" />
                <span className="text-[--primary]">Link copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
