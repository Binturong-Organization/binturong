'use client';
import { PostCard, Post } from './PostCard';
import { Button } from '@/components/ui/Button';

interface PostListProps {
  posts: Post[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export function PostList({ posts, isLoading, hasMore, onLoadMore }: PostListProps) {
  if (isLoading && posts.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-[--surface] rounded-2xl border border-[--border] h-32 animate-pulse p-4"
          >
            <div className="h-3 w-1/3 bg-[--border] rounded-full mb-3" />
            <div className="h-4 w-3/4 bg-[--border] rounded-full mb-2" />
            <div className="h-3 w-1/2 bg-[--border] rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!isLoading && posts.length === 0) {
    return (
      <div className="bg-[--surface] rounded-2xl border border-[--border] p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-[--primary]/10 text-[--primary] flex items-center justify-center mx-auto mb-3 text-xl">
          🐾
        </div>
        <h3 className="font-semibold text-base mb-1">No posts here yet</h3>
        <p className="text-[--muted] text-sm max-w-xs mx-auto">
          Be the first member to start a discussion in this feed!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      {hasMore && (
        <div className="flex justify-center py-4">
          <Button variant="outline" onClick={onLoadMore} loading={isLoading}>
            {isLoading ? 'Loading...' : 'Load more posts'}
          </Button>
        </div>
      )}
    </div>
  );
}
