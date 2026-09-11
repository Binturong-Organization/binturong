'use client';
import useSWR from 'swr';
import { useState } from 'react';
import { CommunityCard, Community } from '@/components/community/CommunityCard';
import { CreateCommunityModal } from '@/components/community/CreateCommunityModal';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { Plus, Search, Compass, Sparkles } from 'lucide-react';

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
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors border ${
                selectedCategory === cat
                  ? 'bg-[--primary] text-white border-[--primary]'
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
      ) : data?.communities && data.communities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.communities.map((community) => (
            <CommunityCard key={community.id} community={community} />
          ))}
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
