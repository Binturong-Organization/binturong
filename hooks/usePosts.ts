import useSWRInfinite from 'swr/infinite';
import api from '@/lib/api';
import { Post } from '@/components/post/PostCard';

const fetcher = (url: string) => api.get(url).then((r) => r.data.data);

export function usePosts(sort = 'hot') {
  const getKey = (pageIndex: number, previousPageData: { posts: Post[] } | null) => {
    if (previousPageData && !previousPageData.posts.length) return null;
    return `/posts?sort=${sort}&page=${pageIndex + 1}&limit=20`;
  };

  const { data, error, size, setSize, isLoading, mutate } = useSWRInfinite(getKey, fetcher);
  const posts: Post[] = data ? data.flatMap((d) => d.posts) : [];
  const hasMore = data ? data[data.length - 1]?.posts?.length === 20 : false;

  return {
    posts,
    error,
    isLoading,
    hasMore,
    loadMore: () => setSize(size + 1),
    mutate,
  };
}

export function useCommunityPosts(slug: string, sort = 'hot') {
  const getKey = (pageIndex: number, previousPageData: { posts: Post[] } | null) => {
    if (!slug) return null;
    if (previousPageData && !previousPageData.posts.length) return null;
    return `/communities/${slug}/posts?sort=${sort}&page=${pageIndex + 1}&limit=20`;
  };

  const { data, error, size, setSize, isLoading, mutate } = useSWRInfinite(getKey, fetcher);
  const posts: Post[] = data ? data.flatMap((d) => d.posts) : [];
  const hasMore = data ? data[data.length - 1]?.posts?.length === 20 : false;

  return {
    posts,
    error,
    isLoading,
    hasMore,
    loadMore: () => setSize(size + 1),
    mutate,
  };
}
