'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

interface CommentFormProps {
  postId: string;
  parentCommentId?: string | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  placeholder?: string;
}

export function CommentForm({
  postId,
  parentCommentId = null,
  onSuccess,
  onCancel,
  placeholder = 'What are your thoughts?',
}: CommentFormProps) {
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return (
      <div className="p-4 rounded-xl border border-[--border] bg-black/[0.02] dark:bg-white/[0.02] text-center text-sm text-[--muted]">
        <span>Want to join the conversation? </span>
        <Link href="/login" className="text-[--primary] font-semibold hover:underline">
          Log in
        </Link>
        <span> or </span>
        <Link href="/register" className="text-[--primary] font-semibold hover:underline">
          Sign up
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setLoading(true);
    setError('');

    try {
      await api.post('/comments', {
        body: body.trim(),
        post_id: postId,
        parent_comment_id: parentCommentId,
      });
      setBody('');
      onSuccess?.();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error || 'Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder}
        rows={parentCommentId ? 2 : 3}
        error={error}
      />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          size="sm"
          loading={loading}
          disabled={!body.trim()}
        >
          {parentCommentId ? 'Reply' : 'Comment'}
        </Button>
      </div>
    </form>
  );
}
