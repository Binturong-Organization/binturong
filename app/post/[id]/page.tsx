'use client';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { PostCard, Post } from '@/components/post/PostCard';
import { CommentThread } from '@/components/comment/CommentThread';
import { CommentForm } from '@/components/comment/CommentForm';
import { CommentType } from '@/components/comment/CommentCard';
import { MessageSquare, ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { apiFetcher } from '@/lib/api';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data: post, isLoading: isPostLoading } = useSWR<Post>(id ? `/posts/${id}` : null, apiFetcher);
  const { data: comments, mutate: mutateComments, isLoading: isCommentsLoading } = useSWR<CommentType[]>(
    id ? `/comments/post/${id}` : null,
    apiFetcher
  );

  if (isPostLoading && !post) {
    return (
      <div className="flex flex-col gap-4 max-w-3xl mx-auto">
        <div className="h-64 bg-[--surface] rounded-3xl border border-[--border] animate-pulse" />
      </div>
    );
  }

  if (!post && !isPostLoading) {
    return (
      <div className="bg-[--surface] rounded-3xl border border-[--border] p-12 text-center max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-2">Discussion not found</h2>
        <p className="text-xs text-[--muted] mb-5">This post may have been removed or does not exist.</p>
        <Link href="/">
          <Button variant="primary">Return Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-3xl mx-auto">
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined' && window.history.length > 1) {
              router.back();
            } else {
              router.push('/');
            }
          }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[--border] bg-[--surface] text-xs text-[--muted] hover:text-[--foreground] hover:border-[--primary]/40 font-semibold transition-all shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[--primary]" />
          <span>Back</span>
        </button>
      </div>

      {/* Main Post Card */}
      {post && <PostCard post={post} />}

      {/* Comments Section */}
      <div className="bg-[--surface] rounded-3xl border border-[--border] p-6 shadow-xs flex flex-col gap-6">
        <div className="flex items-center justify-between pb-4 border-b border-[--border]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[--primary-light] text-[--primary] flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-[--foreground]">
                Discussion ({comments?.length || 0})
              </h2>
              <p className="text-[11px] text-[--muted]">Community thoughts and replies</p>
            </div>
          </div>
        </div>

        {/* Comment input form */}
        {post && post.comment_permission === 'nobody' ? (
          <div className="bg-[--surface-subtle] p-4 rounded-2xl border border-[--border] text-xs text-[--muted] font-semibold">
            Comments are locked on this post.
          </div>
        ) : (
          <div className="bg-[--surface-subtle] p-4 rounded-2xl border border-[--border]">
            <CommentForm postId={id} onSuccess={() => mutateComments()} />
          </div>
        )}

        {/* Threaded Comments */}
        {isCommentsLoading && !comments ? (
          <div className="py-8 text-center text-xs text-[--muted]">Loading comments...</div>
        ) : (
          <CommentThread comments={comments || []} onRefresh={() => mutateComments()} />
        )}
      </div>
    </div>
  );
}
