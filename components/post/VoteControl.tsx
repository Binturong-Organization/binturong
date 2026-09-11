'use client';
import { useState } from 'react';
import { ArrowBigUp, ArrowBigDown } from 'lucide-react';
import { cn, formatKarma } from '@/lib/utils';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

interface VoteControlProps {
  targetType: 'post' | 'comment';
  targetId: string;
  initialCount: number;
  initialVote?: number;
  vertical?: boolean;
}

export function VoteControl({
  targetType,
  targetId,
  initialCount,
  initialVote = 0,
  vertical = true,
}: VoteControlProps) {
  const [count, setCount] = useState(initialCount);
  const [userVote, setUserVote] = useState(initialVote);
  const [loading, setLoading] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();

  const vote = async (value: 1 | -1) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (loading) return;
    setLoading(true);

    const prevCount = count;
    const prevVote = userVote;

    try {
      if (userVote === value) {
        setCount((c) => c - value);
        setUserVote(0);
        await api.delete('/votes', { data: { target_type: targetType, target_id: targetId } });
      } else {
        setCount((c) => c + value - prevVote);
        setUserVote(value);
        await api.post('/votes', { target_type: targetType, target_id: targetId, value });
      }
    } catch {
      setCount(prevCount);
      setUserVote(prevVote);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={cn(
        'flex items-center rounded-2xl bg-[--surface-subtle] border border-[--border] p-1 transition-all shadow-2xs',
        vertical ? 'flex-col gap-0.5' : 'flex-row gap-1.5 px-2'
      )}
    >
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          vote(1);
        }}
        className={cn(
          'p-1.5 rounded-xl transition-all cursor-pointer group active:scale-90',
          userVote === 1
            ? 'text-white bg-[--upvote] shadow-xs shadow-[--upvote]/40'
            : 'text-[--muted] hover:text-[--upvote] hover:bg-[--upvote]/10'
        )}
        aria-label="Upvote"
      >
        <ArrowBigUp className="w-4 h-4" fill={userVote === 1 ? 'currentColor' : 'none'} />
      </button>

      <span
        className={cn(
          'text-xs font-black min-w-[2.5ch] text-center select-none px-1 tracking-tight',
          userVote === 1 && 'text-[--upvote]',
          userVote === -1 && 'text-[--downvote]',
          userVote === 0 && 'text-[--foreground]'
        )}
      >
        {formatKarma(count)}
      </span>

      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          vote(-1);
        }}
        className={cn(
          'p-1.5 rounded-xl transition-all cursor-pointer group active:scale-90',
          userVote === -1
            ? 'text-white bg-[--downvote] shadow-xs shadow-[--downvote]/40'
            : 'text-[--muted] hover:text-[--downvote] hover:bg-[--downvote]/10'
        )}
        aria-label="Downvote"
      >
        <ArrowBigDown className="w-4 h-4" fill={userVote === -1 ? 'currentColor' : 'none'} />
      </button>
    </div>
  );
}
