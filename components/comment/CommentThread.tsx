'use client';
import { useMemo } from 'react';
import { CommentCard, CommentType } from './CommentCard';

interface CommentThreadProps {
  comments: CommentType[];
  onRefresh?: () => void;
}

export function CommentThread({ comments, onRefresh }: CommentThreadProps) {
  // Convert flat comments list into a hierarchical tree
  const tree = useMemo(() => {
    const map = new Map<string, CommentType>();
    const roots: CommentType[] = [];

    comments.forEach((c) => {
      map.set(c.id, { ...c, children: [] });
    });

    comments.forEach((c) => {
      const node = map.get(c.id)!;
      if (c.parent_comment_id && map.has(c.parent_comment_id)) {
        map.get(c.parent_comment_id)!.children!.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }, [comments]);

  if (comments.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-[--muted]">
        No comments yet. Be the first to share your perspective!
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-[--border]/60">
      {tree.map((rootComment) => (
        <CommentCard
          key={rootComment.id}
          comment={rootComment}
          depth={0}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  );
}
