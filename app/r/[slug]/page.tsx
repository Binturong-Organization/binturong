'use client';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { useState } from 'react';
import { useCommunityPosts } from '@/hooks/usePosts';
import { PostList } from '@/components/post/PostList';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { CommunitySettingsModal } from '@/components/community/CommunitySettingsModal';
import {
  Flame,
  Sparkles,
  TrendingUp,
  Users,
  Plus,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Info,
  ArrowLeft,
  Settings,
  Megaphone,
  BookOpen,
  Lock,
  Eye,
  AlertTriangle,
  Clock,
  Bot,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Link from 'next/link';
import api, { apiFetcher } from '@/lib/api';
import { formatKarma } from '@/lib/utils';

interface RuleItem {
  id: string;
  title: string;
  description: string;
}

interface CommunityDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  rules: string;
  rules_json?: RuleItem[] | string;
  guidelines?: string;
  icon_url?: string;
  banner_url?: string;
  category?: string;
  tags?: string[];
  visibility?: 'public' | 'restricted' | 'private';
  is_nsfw?: boolean;
  posting_permission?: string;
  comment_permission?: string;
  requires_approval?: boolean;
  welcome_message?: string;
  theme_color?: string;
  announcement?: string;
  member_count: number;
  isMember?: boolean;
  userRole?: string;
  isModerator?: boolean;
  hasPendingRequest?: boolean;
  creator_username?: string;
  created_at: string;
}

const SORTS = [
  { value: 'hot', label: 'Hot', icon: Flame },
  { value: 'new', label: 'New', icon: Sparkles },
  { value: 'top', label: 'Top', icon: TrendingUp },
];

export default function CommunityPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [sort, setSort] = useState('hot');
  const [joining, setJoining] = useState(false);
  const [modModalOpen, setModModalOpen] = useState(false);
  const [welcomeBanner, setWelcomeBanner] = useState<string | null>(null);
  const [expandedRule, setExpandedRule] = useState<number | null>(null);

  const {
    data: community,
    mutate: mutateCommunity,
    isLoading: isCommunityLoading,
  } = useSWR<CommunityDetail>(slug ? `/communities/${slug}` : null, apiFetcher);

  const { posts, isLoading: isPostsLoading, hasMore, loadMore } = useCommunityPosts(slug, sort);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const handleJoinToggle = async () => {
    if (!isAuthenticated || !community) return;
    setJoining(true);
    try {
      if (community.isMember) {
        await api.delete(`/communities/${slug}/join`);
        setWelcomeBanner(null);
      } else if (community.hasPendingRequest) {
        await api.delete(`/communities/${slug}/join`);
      } else {
        const res = await api.post(`/communities/${slug}/join`);
        if (res.data.data?.welcome_message) {
          setWelcomeBanner(res.data.data.welcome_message);
        }
      }
      mutateCommunity();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      alert(e.response?.data?.error || 'Failed to update membership');
    } finally {
      setJoining(false);
    }
  };

  if (isCommunityLoading && !community) {
    return <div className="h-64 bg-[--surface] rounded-3xl border border-[--border] animate-pulse" />;
  }

  if (!community && !isCommunityLoading) {
    return (
      <div className="bg-[--surface] rounded-3xl border border-[--border] p-12 text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-full bg-[--danger]/10 text-[--danger] flex items-center justify-center mx-auto mb-3 font-bold">
          !
        </div>
        <h2 className="text-xl font-bold mb-2">Community not found</h2>
        <p className="text-xs text-[--muted] mb-5">b/{slug} does not exist or was renamed.</p>
        <Link href="/r">
          <Button variant="primary">Explore all communities</Button>
        </Link>
      </div>
    );
  }

  const themeColor = community?.theme_color || '#6366f1';

  // Parse structured rules
  let parsedRules: RuleItem[] = [];
  if (community?.rules_json) {
    if (Array.isArray(community.rules_json)) {
      parsedRules = community.rules_json;
    } else if (typeof community.rules_json === 'string') {
      try {
        parsedRules = JSON.parse(community.rules_json);
      } catch {
        parsedRules = [];
      }
    }
  }

  const canPost =
    community?.isMember &&
    (community.posting_permission === 'anyone' ||
      (['moderator', 'creator', 'contributor'].includes(community.userRole || '') &&
        community.posting_permission === 'approved_only') ||
      community.isModerator);

  return (
    <div className="flex flex-col gap-5">
      {/* Back to Communities */}
      <div className="flex items-center justify-between">
        <Link
          href="/r"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[--border] bg-[--surface] text-xs text-[--muted] hover:text-[--foreground] hover:border-[--primary]/40 font-semibold transition-all shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[--primary]" />
          <span>Back to communities</span>
        </Link>

        {community?.isModerator && (
          <div className="flex gap-2">
            <Link href={`/r/${slug}/ai`}>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold text-[--primary] border-[--primary]/40 hover:bg-[--primary]/10">
                <Bot className="w-3.5 h-3.5" /> AI Agent
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => setModModalOpen(true)} className="gap-1.5 text-xs font-bold text-[--primary] border-[--primary]/40 hover:bg-[--primary]/10">
              <Settings className="w-3.5 h-3.5" /> Mod Tools
            </Button>
          </div>
        )}
      </div>

      {/* Community Hero Header */}
      <div className="bg-[--surface] rounded-3xl border border-[--border] overflow-hidden shadow-xs">
        {/* Banner with theme color and optional background image */}
        <div
          className="h-32 sm:h-44 relative bg-cover bg-center"
          style={{
            backgroundColor: themeColor,
            backgroundImage: community?.banner_url ? `url(${community.banner_url})` : undefined,
          }}
        >
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            {community?.category && (
              <span className="px-2.5 py-1 rounded-full bg-black/50 text-white text-[10px] font-bold backdrop-blur-sm">
                {community.category}
              </span>
            )}
            {community?.is_nsfw && (
              <span className="px-2 py-1 rounded-full bg-red-600/90 text-white text-[9px] font-black uppercase tracking-wider">
                18+ NSFW
              </span>
            )}
            {community?.visibility && community.visibility !== 'public' && (
              <span className="px-2.5 py-1 rounded-full bg-black/60 text-white text-[10px] font-bold capitalize backdrop-blur-sm flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>{community.visibility}</span>
              </span>
            )}
          </div>
        </div>

        {/* Content Bar */}
        <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex items-end gap-4 -mt-10 sm:-mt-12">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[--surface] border-4 border-[--surface] shadow-xl flex items-center justify-center text-white font-black text-3xl sm:text-4xl flex-shrink-0 overflow-hidden">
              {community?.icon_url ? (
                <img src={community.icon_url} alt={community.name} className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ backgroundColor: themeColor }}
                >
                  {community?.name?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div className="mb-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[--foreground] leading-tight">
                b/{community?.name}
              </h1>
              <div className="flex items-center gap-3 text-xs text-[--muted] mt-1 flex-wrap">
                <span className="flex items-center gap-1 font-bold text-[--foreground]">
                  <Users className="w-3.5 h-3.5 text-[--primary]" />
                  <span>{formatKarma(community?.member_count || 0)} members</span>
                </span>
                {community?.userRole && (
                  <>
                    <span>•</span>
                    <span className="capitalize font-semibold text-[--primary]">
                      Role: {community.userRole}
                    </span>
                  </>
                )}
                {community?.creator_username && (
                  <>
                    <span>•</span>
                    <span>Created by u/{community.creator_username}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {isAuthenticated && (
              <Button
                variant={community?.isMember ? 'outline' : 'primary'}
                size="sm"
                onClick={handleJoinToggle}
                loading={joining}
                className={
                  community?.isMember
                    ? 'border-[--primary] text-[--primary]'
                    : community?.hasPendingRequest
                    ? 'border-[--border] text-[--muted]'
                    : 'bg-gradient-to-r from-[--primary] to-[--accent] text-white border-0 shadow-md shadow-[--primary]/20'
                }
              >
                {community?.isMember ? (
                  <>
                    <UserCheck className="w-4 h-4 text-[--primary]" /> Joined
                  </>
                ) : community?.hasPendingRequest ? (
                  <>
                    <Clock className="w-4 h-4 text-amber-500" /> Request Pending
                  </>
                ) : community?.requires_approval || community?.visibility === 'private' ? (
                  <>
                    <UserPlus className="w-4 h-4" /> Request to Join
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" /> Join Hub
                  </>
                )}
              </Button>
            )}

            <Link href={isAuthenticated ? `/submit?community=${community?.id}` : '/login'}>
              <Button
                variant="primary"
                size="sm"
                className="gap-1.5 shadow-xs"
                disabled={!canPost && !community?.isModerator}
              >
                <Plus className="w-4 h-4" /> Create Post
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Welcome Message Alert */}
      {welcomeBanner && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-3xl flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{welcomeBanner}</span>
          </div>
          <button onClick={() => setWelcomeBanner(null)} className="text-emerald-700 hover:underline text-[11px]">
            Dismiss
          </button>
        </div>
      )}

      {/* Announcement Banner */}
      {community?.announcement && (
        <div
          className="p-4 rounded-3xl border border-[--border] bg-[--surface] flex items-center gap-3 shadow-xs"
          style={{ borderLeftColor: themeColor, borderLeftWidth: 4 }}
        >
          <div
            className="w-9 h-9 rounded-2xl flex items-center justify-center text-white shrink-0"
            style={{ backgroundColor: themeColor }}
          >
            <Megaphone className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[--muted]">
              Community Announcement
            </span>
            <p className="text-xs text-[--foreground] font-medium mt-0.5">
              {community.announcement}
            </p>
          </div>
        </div>
      )}

      {/* Main Feed Column & Sidebar */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Posts Feed */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <div className="flex items-center gap-1.5 bg-[--surface] rounded-2xl border border-[--border] p-1.5 shadow-xs">
            {SORTS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setSort(value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  sort === value
                    ? 'bg-[--primary] text-white shadow-sm shadow-[--primary]/20'
                    : 'text-[--muted] hover:text-[--foreground] hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <PostList
            posts={posts}
            isLoading={isPostsLoading}
            hasMore={hasMore}
            onLoadMore={loadMore}
          />
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-4">
          {/* About */}
          <div className="bg-[--surface] rounded-3xl border border-[--border] p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-[--primary]" />
              <h3 className="font-black text-xs uppercase tracking-wider text-[--muted]">
                About Community
              </h3>
            </div>
            <p className="text-xs text-[--foreground] leading-relaxed">
              {community?.description || 'A welcoming space for discussions and insights.'}
            </p>

            {community?.tags && community.tags.length > 0 && (
              <div className="flex gap-1.5 mt-3.5 flex-wrap">
                {community.tags.map((tag, idx) => (
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

          {/* Community Limits */}
          <div className="bg-[--surface] rounded-3xl border border-[--border] p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-[--primary]" />
              <h3 className="font-black text-xs uppercase tracking-wider text-[--muted]">
                Community Limits
              </h3>
            </div>
            <p className="text-xs text-[--muted] leading-relaxed mb-3">Daily activity limits help keep discussions useful and spam-free.</p>
            <div className="flex flex-col divide-y divide-[--border] text-xs">
              <div className="py-2 first:pt-0 flex items-center justify-between gap-3"><span className="font-bold text-[--foreground]">New User</span><span className="text-[--muted] text-right">3 posts · 10 comments</span></div>
              <div className="py-2 flex items-center justify-between gap-3"><span className="font-bold text-[--foreground]">Established User</span><span className="text-[--muted] text-right">10 posts · 50 comments</span></div>
              <div className="py-2 last:pb-0 flex items-center justify-between gap-3"><span className="font-bold text-[--foreground]">High Reputation</span><span className="text-[--muted] text-right">20 posts · 100 comments</span></div>
            </div>
          </div>

          {/* Structured Rules */}
          {parsedRules.length > 0 ? (
            <div className="bg-[--surface] rounded-3xl border border-[--border] p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-[--primary]" />
                <h3 className="font-black text-xs uppercase tracking-wider text-[--muted]">
                  Community Rules
                </h3>
              </div>
              <div className="flex flex-col divide-y divide-[--border]">
                {parsedRules.map((rule, idx) => (
                  <div key={idx} className="py-2.5 first:pt-0 last:pb-0">
                    <button
                      onClick={() => setExpandedRule(expandedRule === idx ? null : idx)}
                      className="w-full text-left flex items-center justify-between text-xs font-bold text-[--foreground] hover:text-[--primary] transition-colors"
                    >
                      <span>
                        {idx + 1}. {rule.title}
                      </span>
                      {expandedRule === idx ? (
                        <ChevronUp className="w-3.5 h-3.5 text-[--muted]" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-[--muted]" />
                      )}
                    </button>
                    {expandedRule === idx && rule.description && (
                      <p className="text-[11px] text-[--muted] mt-1.5 pl-4 leading-relaxed">
                        {rule.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : community?.rules ? (
            <div className="bg-[--surface] rounded-3xl border border-[--border] p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-[--primary]" />
                <h3 className="font-black text-xs uppercase tracking-wider text-[--muted]">
                  Community Rules
                </h3>
              </div>
              <div className="text-xs text-[--muted] leading-relaxed whitespace-pre-line bg-[--surface-subtle] p-3 rounded-2xl border border-[--border]">
                {community.rules}
              </div>
            </div>
          ) : null}

          {/* Guidelines */}
          {community?.guidelines && (
            <div className="bg-[--surface] rounded-3xl border border-[--border] p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-[--primary]" />
                <h3 className="font-black text-xs uppercase tracking-wider text-[--muted]">
                  Guidelines &amp; Conduct
                </h3>
              </div>
              <p className="text-xs text-[--muted] leading-relaxed whitespace-pre-line">
                {community.guidelines}
              </p>
            </div>
          )}
        </aside>
      </div>

      {/* Mod Tools Modal */}
      {community?.isModerator && (
        <CommunitySettingsModal
          slug={slug}
          isOpen={modModalOpen}
          onClose={() => setModModalOpen(false)}
          onUpdated={() => mutateCommunity()}
        />
      )}
    </div>
  );
}
