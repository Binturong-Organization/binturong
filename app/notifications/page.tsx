'use client';
import useSWR from 'swr';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Bell, MessageSquare, ArrowBigUp, Check, ExternalLink } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { timeAgo } from '@/lib/utils';
import Link from 'next/link';
import api from '@/lib/api';

interface NotificationItem {
  id: string;
  type: 'comment' | 'reply' | 'upvote';
  is_read: boolean;
  created_at: string;
  actor_username: string;
  actor_avatar?: string;
  post_id: string;
  post_title: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const { data, mutate, isLoading } = useSWR<{ notifications: NotificationItem[]; unreadCount: number }>(
    isAuthenticated ? '/notifications' : null
  );

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      mutate();
    } catch {}
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      mutate();
    } catch {}
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'comment':
      case 'reply':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'upvote':
        return <ArrowBigUp className="w-4 h-4 text-[--upvote]" />;
      default:
        return <Bell className="w-4 h-4 text-[--primary]" />;
    }
  };

  const getMessage = (n: NotificationItem) => {
    switch (n.type) {
      case 'comment':
        return 'commented on your post';
      case 'reply':
        return 'replied to your comment on';
      case 'upvote':
        return 'upvoted your post';
      default:
        return 'interacted with your content';
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-[--surface] rounded-3xl border border-[--border] p-6 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[--foreground]">Notifications</h1>
          <p className="text-xs text-[--muted] mt-0.5">
            {data?.unreadCount ? `${data.unreadCount} unread notification(s)` : 'All caught up!'}
          </p>
        </div>
        {data && data.unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="gap-1.5">
            <Check className="w-3.5 h-3.5" /> Mark all read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-[--surface] rounded-2xl border border-[--border] animate-pulse" />
          ))}
        </div>
      ) : data?.notifications?.length === 0 ? (
        <div className="bg-[--surface] rounded-3xl border border-[--border] p-12 text-center text-sm text-[--muted]">
          <Bell className="w-8 h-8 text-[--muted] mx-auto mb-2 opacity-50" />
          No notifications yet.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {data?.notifications?.map((n) => (
            <Link
              key={n.id}
              href={`/post/${n.post_id}`}
              onClick={() => handleMarkRead(n.id)}
              className={`block bg-[--surface] rounded-2xl border p-4 transition-all hover:border-[--primary]/40 ${
                n.is_read ? 'border-[--border] opacity-80' : 'border-[--primary]/40 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <Avatar src={n.actor_avatar} username={n.actor_username} size={36} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-xs">
                    {getIcon(n.type)}
                    <span className="font-bold text-[--foreground]">u/{n.actor_username}</span>
                    <span className="text-[--muted]">{getMessage(n)}</span>
                  </div>
                  <p className="text-xs font-semibold text-[--foreground] truncate mt-1">
                    &quot;{n.post_title}&quot;
                  </p>
                  <span className="text-[10px] text-[--muted] mt-1 block">
                    {timeAgo(n.created_at)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
