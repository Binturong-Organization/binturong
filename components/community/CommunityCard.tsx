import Link from 'next/link';
import { Users, ArrowRight } from 'lucide-react';
import { formatKarma } from '@/lib/utils';

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon_url?: string;
  banner_url?: string;
  category?: string;
  tags?: string[];
  visibility?: string;
  is_nsfw?: boolean;
  theme_color?: string;
  member_count: number;
  is_owner?: boolean;
  is_member?: boolean;
  user_role?: string | null;
}

export function CommunityCard({ community }: { community: Community }) {
  const themeColor = community.theme_color || '#6366f1';

  return (
    <Link href={`/r/${community.slug}`} className="block group h-full">
      <div className="bg-[--surface] rounded-3xl border border-[--border] overflow-hidden hover:border-[--primary]/40 hover:shadow-lg hover:shadow-[--primary]/5 transition-all duration-200 h-full flex flex-col justify-between">
        {/* Top Banner */}
        <div
          className="h-16 relative p-3 flex justify-between items-start bg-cover bg-center"
          style={{
            backgroundColor: themeColor,
            backgroundImage: community.banner_url ? `url(${community.banner_url})` : undefined,
          }}
        >
          <div className="flex gap-1.5 flex-wrap">
            {community.category && community.category !== 'General' && (
              <span className="px-2 py-0.5 rounded-full bg-black/40 text-white text-[10px] font-bold backdrop-blur-xs">
                {community.category}
              </span>
            )}
            {community.is_nsfw && (
              <span className="px-1.5 py-0.5 rounded-full bg-red-600/90 text-white text-[9px] font-black uppercase tracking-wider">
                18+
              </span>
            )}
            {community.visibility && community.visibility !== 'public' && (
              <span className="px-2 py-0.5 rounded-full bg-black/50 text-white text-[10px] font-semibold capitalize backdrop-blur-xs">
                {community.visibility}
              </span>
            )}
          </div>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/40 text-white text-[10px] font-bold backdrop-blur-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active
          </span>
        </div>

        {/* Content Body */}
        <div className="p-5 pt-0 relative flex-1 flex flex-col justify-between">
          <div>
            {/* Avatar overlapping banner */}
            <div className="-mt-7 mb-3 w-14 h-14 rounded-2xl bg-[--surface] border-2 border-[--surface] shadow-md flex items-center justify-center text-[--primary] font-black text-xl overflow-hidden">
              {community.icon_url ? (
                <img src={community.icon_url} alt={community.name} className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-white font-extrabold"
                  style={{ backgroundColor: themeColor }}
                >
                  {community.name[0]?.toUpperCase() || 'B'}
                </div>
              )}
            </div>

            <h3 className="font-extrabold text-base text-[--foreground] group-hover:text-[--primary] transition-colors truncate">
              b/{community.name}
            </h3>

            <div className="flex items-center gap-1.5 text-xs text-[--muted] mt-1">
              <Users className="w-3.5 h-3.5 text-[--primary]" />
              <span className="font-semibold">{formatKarma(community.member_count)} members</span>
            </div>

            {community.description && (
              <p className="text-xs text-[--muted] mt-2.5 line-clamp-2 leading-relaxed">
                {community.description}
              </p>
            )}

            {community.tags && community.tags.length > 0 && (
              <div className="flex gap-1.5 mt-3 flex-wrap">
                {community.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-lg bg-[--surface-subtle] border border-[--border] text-[10px] font-medium text-[--muted]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[--border] flex items-center justify-between text-xs font-bold text-[--primary]">
            <span>Visit community</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}
