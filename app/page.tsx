'use client';
import { useState } from 'react';
import useSWR from 'swr';
import { usePosts } from '@/hooks/usePosts';
import { PostList } from '@/components/post/PostList';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { Flame, Sparkles, TrendingUp, Compass, Plus, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Community } from '@/components/community/CommunityCard';
import { formatKarma } from '@/lib/utils';
import { apiFetcher } from '@/lib/api';

const SORTS = [
	{ value: 'hot', label: 'Hot', icon: Flame, desc: 'Trending now' },
	{ value: 'new', label: 'New', icon: Sparkles, desc: 'Fresh discussions' },
	{ value: 'top', label: 'Top', icon: TrendingUp, desc: 'Highest voted' },
];

export default function HomePage() {
	const [sort, setSort] = useState('hot');
	const { posts, isLoading, hasMore, loadMore } = usePosts(sort);
	const { data: communitiesData } = useSWR<{ communities: Community[] }>('/communities', apiFetcher);
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

	const topCommunities = communitiesData?.communities?.slice(0, 5) || [];

	return (
		<div className="flex flex-col gap-6">
			{/* Top Trending Community Strip */}
			{topCommunities.length > 0 && (
				<div className="bg-[--surface] rounded-3xl border border-[--border] p-4 shadow-xs">
					<div className="flex items-center gap-2 mb-3 px-1">
						<Zap className="w-4 h-4 text-[--secondary]" />
						<span className="text-xs font-black uppercase tracking-wider text-[--muted]">
							Popular Communities
						</span>
					</div>
					<div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
						{topCommunities.map((c) => (
							<Link
								key={c.id}
								href={`/r/${c.slug}`}
								className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl border border-[--border] bg-[--surface-subtle] hover:border-[--primary]/40 hover:bg-[--primary-light] text-xs font-bold transition-all flex-shrink-0 group"
							>
								<span className="w-5 h-5 rounded-lg bg-[--primary] text-white flex items-center justify-center text-[10px] font-black">
									{c.name[0]?.toUpperCase()}
								</span>
								<span className="group-hover:text-[--primary] transition-colors">r/{c.name}</span>
								<span className="text-[10px] font-normal text-[--muted]">
									{formatKarma(c.member_count)}
								</span>
							</Link>
						))}
						<Link
							href="/r"
							className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold text-[--primary] hover:underline flex-shrink-0"
						>
							<span>View all</span>
							<ArrowRight className="w-3.5 h-3.5" />
						</Link>
					</div>
				</div>
			)}

			{/* Main Feed Content & Sidebar */}
			<div className="flex flex-col lg:flex-row gap-6">
				{/* Main Feed Column */}
				<div className="flex-1 min-w-0 flex flex-col gap-4">
					{/* Feed Filter Bar */}
					<div className="flex items-center justify-between bg-[--surface] rounded-2xl border border-[--border] p-1.5 shadow-xs">
						<div className="flex items-center gap-1.5">
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

						<Link href={isAuthenticated ? '/submit' : '/login'} className="pr-1">
							<Button variant="ghost" size="sm" className="hidden sm:inline-flex gap-1.5 text-xs font-bold text-[--primary]">
								<Plus className="w-3.5 h-3.5" /> New Post
							</Button>
						</Link>
					</div>

					{/* Post Feed */}
					<PostList posts={posts} isLoading={isLoading} hasMore={hasMore} onLoadMore={loadMore} />
				</div>

				{/* Right Sidebar Column */}
				<aside className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-4">
					{/* Create Post Banner Card */}
					<div className="relative overflow-hidden bg-gradient-to-br from-[--primary] to-[--accent] rounded-3xl p-6 text-white shadow-lg shadow-[--primary]/15">
						<div className="relative z-10">
							<div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-3">
								<Sparkles className="w-5 h-5" />
							</div>
							<h3 className="font-extrabold text-base mb-1">Start a Conversation</h3>
							<p className="text-xs text-white/80 mb-5 leading-relaxed">
								Having an idea, article, or question? Post it to reach members across communities.
							</p>
							<div className="flex flex-col gap-2.5">
								<Link href={isAuthenticated ? '/submit' : '/login'} className="w-full">
									<button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-extrabold text-xs sm:text-sm bg-white text-[#164633] hover:bg-white/95 shadow-md shadow-black/10 active:scale-98 transition-all cursor-pointer">
										<Plus className="w-4 h-4 text-[#164633] stroke-[2.5]" />
										<span>Create New Post</span>
									</button>
								</Link>
								<Link href="/r" className="w-full">
									<button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-xs active:scale-98 transition-all cursor-pointer">
										<Compass className="w-4 h-4 text-white" />
										<span>Discover Hubs</span>
									</button>
								</Link>
							</div>
						</div>
						{/* Background decorative circle */}
						<div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
					</div>

					{/* Community Guidelines Card */}
					<div className="bg-[--surface] rounded-3xl border border-[--border] p-5 shadow-xs">
						<div className="flex items-center gap-2 mb-3">
							<ShieldCheck className="w-4 h-4 text-[--primary]" />
							<h3 className="font-black text-xs uppercase tracking-wider text-[--muted]">
								Binturong Code
							</h3>
						</div>
						<ul className="space-y-2 text-xs text-[--muted] leading-relaxed">
							<li className="flex items-start gap-2">
								<span className="font-bold text-[--primary]">1.</span>
								<span>Keep discussions friendly and respectful</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="font-bold text-[--primary]">2.</span>
								<span>Check community rules before publishing</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="font-bold text-[--primary]">3.</span>
								<span>Cite sources for news and links</span>
							</li>
							<li className="flex items-start gap-2">
								<span className="font-bold text-[--primary]">4.</span>
								<span>Help moderate by upvoting insightful content</span>
							</li>
						</ul>
					</div>

					<footer className="text-[11px] text-[--muted] px-3 leading-relaxed">
						<p>© {new Date().getFullYear()} Binturong Platform. Built for open community discussion.</p>
					</footer>
				</aside>
			</div>
		</div>
	);
}
