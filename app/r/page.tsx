'use client';
import useSWR from 'swr';
import { useState } from 'react';
import { CommunityCard, Community } from '@/components/community/CommunityCard';
import { CreateCommunityModal } from '@/components/community/CreateCommunityModal';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { Plus, Search, Compass, Sparkles, UsersRound, Star } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Technology',
  'Gaming',
  'Programming',
  'Entertainment',
  'Science',
  'Music',
  'Art & Design',
  'Lifestyle',
  'Finance',
];

function CommunityGrid({ items }: { items: Community[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((community) => <CommunityCard key={community.id} community={community} />)}
    </div>
  );
}

export default function CommunitiesPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);

  const queryParams = new URLSearchParams();
  if (search) queryParams.set('q', search);
  if (selectedCategory && selectedCategory !== 'All') queryParams.set('category', selectedCategory);
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

  const { data, isLoading, mutate } = useSWR<{ communities: Community[] }>(
    `/communities${queryString}`
  );
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const communities = data?.communities || [];
  const ownedCommunities = communities.filter((community) => community.is_owner);
  const joinedCommunities = communities.filter((community) => !community.is_owner && community.is_member);
  const exploreCommunities = communities.filter((community) => !community.is_owner && !community.is_member);
  const interests = new Set(
    [...ownedCommunities, ...joinedCommunities].flatMap((community) => [community.category, ...(community.tags || [])].filter(Boolean).map((item) => item!.toLowerCase()))
  );
  const recommendedCommunities = [...exploreCommunities]
    .sort((a, b) => {
      const score = (community: Community) => [community.category, ...(community.tags || [])].filter(Boolean).filter((item) => interests.has(item!.toLowerCase())).length;
      return score(b) - score(a) || b.member_count - a.member_count;
    })
    .slice(0, 3);
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[--surface] rounded-3xl border border-[--border] p-6 sm:p-8 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-[--primary] font-bold text-xs uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4" />
            <span>Discover</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[--foreground]">Explore Communities</h1>
          <p className="text-xs sm:text-sm text-[--muted] mt-1">
            Find spaces dedicated to topics, hobbies, and ideas you care about.
          </p>
        </div>
        {isAuthenticated && (
          <Button
            variant="primary"
            onClick={() => setModalOpen(true)}
            className="gap-1.5 flex-shrink-0 bg-gradient-to-r from-[--primary] to-[--accent] border-0 shadow-md shadow-[--primary]/20 font-bold text-xs py-2.5 px-4"
          >
            <Plus className="w-4 h-4" /> Create Community
          </Button>
        )}
      </div>

      {/* Category Pills & Search Filter */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={selectedCategory === cat ? { backgroundColor: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)', boxShadow: '0 4px 14px color-mix(in srgb, var(--primary) 35%, transparent)' } : undefined}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors border ${
                selectedCategory === cat
                  ? 'ring-2 ring-[--secondary]/60 ring-offset-2 ring-offset-[--background]'
                  : 'bg-[--surface] text-[--muted] border-[--border] hover:text-[--foreground]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[--muted]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search communities..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[--border] bg-[--surface] text-xs sm:text-sm placeholder-[--muted] focus:outline-none focus:border-[--primary] focus:ring-2 focus:ring-[--primary]/20"
          />
        </div>
      </div>

      {/* Grid of communities */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 bg-[--surface] rounded-3xl border border-[--border] animate-pulse" />
          ))}
        </div>
      ) : communities.length > 0 ? (
        <div className="flex flex-col gap-7">
          {isAuthenticated && ownedCommunities.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <UsersRound className="w-4 h-4 text-[--primary]" />
                <div><h2 className="font-black text-sm">Created by Me</h2><p className="text-xs text-[--muted]">Communities you own and manage.</p></div>
              </div>
              <CommunityGrid items={ownedCommunities} />
            </section>
          )}
          {isAuthenticated && joinedCommunities.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <UsersRound className="w-4 h-4 text-[--primary]" />
                <div><h2 className="font-black text-sm">Joined Communities</h2><p className="text-xs text-[--muted]">Communities you are a member of.</p></div>
              </div>
              <CommunityGrid items={joinedCommunities} />
            </section>
          )}
          {isAuthenticated && recommendedCommunities.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-4 h-4 text-[--secondary]" />
                <div><h2 className="font-black text-sm">Recommended for You</h2><p className="text-xs text-[--muted]">Based on your community interests.</p></div>
              </div>
              <CommunityGrid items={recommendedCommunities} />
            </section>
          )}
          {exploreCommunities.length > 0 && (
            <section>
              {isAuthenticated && (ownedCommunities.length > 0 || joinedCommunities.length > 0 || recommendedCommunities.length > 0) && <div className="flex items-center gap-2 mb-3"><Compass className="w-4 h-4 text-[--primary]" /><div><h2 className="font-black text-sm">Explore Communities</h2><p className="text-xs text-[--muted]">Discover new places to join.</p></div></div>}
              <CommunityGrid items={exploreCommunities} />
            </section>
          )}
          {isAuthenticated && ownedCommunities.length === 0 && joinedCommunities.length === 0 && exploreCommunities.length > 0 && <p className="text-xs text-[--muted] text-center">Joined communities will appear in their own section.</p>}
        </div>
      ) : (
        <div className="text-center py-16 bg-[--surface] rounded-3xl border border-[--border] p-8">
          <Sparkles className="w-8 h-8 text-[--primary] mx-auto mb-3 opacity-60" />
          <h3 className="font-bold text-base text-[--foreground]">No communities found</h3>
          <p className="text-xs text-[--muted] mt-1 max-w-sm mx-auto">
            {search ? `No communities matched "${search}".` : 'Be the first to create one!'}
          </p>
          {isAuthenticated && (
            <Button
              variant="primary"
              onClick={() => setModalOpen(true)}
              className="mt-4 text-xs font-bold"
            >
              Create Community
            </Button>
          )}
        </div>
      )}

      {/* Full-Featured Create Community Modal */}
      <CreateCommunityModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => mutate()}
      />
    </div>
  );
}
