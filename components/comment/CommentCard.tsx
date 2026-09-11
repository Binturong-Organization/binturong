'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Reply, Trash2, CornerDownRight } from 'lucide-react';
import { VoteControl } from '@/components/post/VoteControl';
import { Avatar } from '@/components/ui/Avatar';
import { CommentForm } from './CommentForm';
import { timeAgo } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export interface CommentType {
  id: string;
  body: string;
  post_id: string;
  author_id: string;
  parent_comment_id: string | null;
  vote_count: number;
  is_removed: boolean;
  created_at: string;
  author_username: string;
  author_avatar?: string;
  userVote?: number;
  children?: CommentType[];
}

interface CommentCardProps {
  comment: CommentType;
  depth?: number;
  onRefresh?: () => void;
}

export function CommentCard({ comment, depth = 0, onRefresh }: CommentCardProps) {
  const [replying, setReplying] = useState(false);
  const currentUser = useAuthStore((s) => s.user);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await api.delete(`/comments/${comment.id}`);
      onRefresh?.();
    } catch {}
  };

  const isAuthor = currentUser?.id === comment.author_id;

  return (
    <div className="flex flex-col gap-2.5 py-3.5 group">
      {/* Header */}
      <div className="flex items-center gap-2 text-xs text-[--muted]">
        <Avatar src={comment.author_avatar} username={comment.author_username} size={24} />
        <Link
          href={`/user/${comment.author_username}`}
          className="font-bold text-[--foreground] hover:text-[--primary] transition-colors"
        >
          u/{comment.author_username}
        </Link>
        <span className="text-[--border-strong]">•</span>
        <span className="text-[11px]">{timeAgo(comment.created_at)}</span>
      </div>

      {/* Body */}
      <div className="pl-8">
        <p
          className={`text-xs sm:text-sm leading-relaxed ${
            comment.is_removed
              ? 'italic text-[--muted] bg-[--surface-subtle] p-2.5 rounded-xl border border-[--border]'
              : 'text-[--foreground]'
          }`}
        >
          {comment.is_removed ? '[Comment deleted]' : comment.body}
        </p>

        {/* Action bar */}
        {!comment.is_removed && (
          <div className="flex items-center gap-2 mt-2.5">
            <VoteControl
              targetType="comment"
              targetId={comment.id}
              initialCount={comment.vote_count}
              initialVote={comment.userVote}
              vertical={false}
            />

            {depth < 5 && (
              <button
                onClick={() => setReplying(!replying)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-xs text-[--muted] hover:text-[--foreground] font-semibold transition-colors cursor-pointer"
              >
                <Reply className="w-3.5 h-3.5" />
                <span>Reply</span>
              </button>
            )}

            {isAuthor && (
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl hover:bg-red-500/10 text-xs text-[--danger]/70 hover:text-[--danger] font-semibold transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>
        )}

        {/* Reply Form Container */}
        {replying && (
          <div className="mt-3 pl-3 border-l-2 border-[--primary]/40 bg-[--surface-subtle] p-3 rounded-2xl">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[--primary] mb-2">
              <CornerDownRight className="w-3.5 h-3.5" />
              <span>Replying to u/{comment.author_username}</span>
            </div>
            <CommentForm
              postId={comment.post_id}
              parentCommentId={comment.id}
              onSuccess={() => {
                setReplying(false);
                onRefresh?.();
              }}
              onCancel={() => setReplying(false)}
              placeholder="Write a constructive reply..."
            />
          </div>
        )}
      </div>

      {/* Nested Comment Children with guide rail */}
      {comment.children && comment.children.length > 0 && (
        <div className="pl-4 ml-3 border-l-2 border-[--border] hover:border-[--primary]/30 transition-colors flex flex-col divide-y divide-[--border]/40 mt-1">
          {comment.children.map((child) => (
            <CommentCard key={child.id} comment={child} depth={depth + 1} onRefresh={onRefresh} />
          ))}
        </div>
      )}
    </div>
  );
}
