'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import { FileText, Link2, ArrowLeft, Sparkles, Send } from 'lucide-react';
import Link from 'next/link';
import api, { apiFetcher } from '@/lib/api';
import { Community } from '@/components/community/CommunityCard';
import { AiPostAssistant } from '@/components/post/AiPostAssistant';

type PostType = 'text' | 'image' | 'link';

function CreatePostContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCommunityId = searchParams.get('community') || '';

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data: communitiesData } = useSWR<{ communities: Community[] }>('/communities', apiFetcher);

  const [type, setType] = useState<PostType>('text');
  const [communityId, setCommunityId] = useState(preselectedCommunityId);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [aiSource, setAiSource] = useState<{ title: string; url: string; source: string } | null>(null);
  const [url, setUrl] = useState('');
  const [viewPermission, setViewPermission] = useState<'everyone' | 'members'>('everyone');
  const [commentPermission, setCommentPermission] = useState<'everyone' | 'members' | 'nobody'>('everyone');
  const [likesVisibility, setLikesVisibility] = useState<'everyone' | 'members' | 'author'>('everyone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiOpen, setAiOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [hydrated, setHydrated] = useState(false);
  const selectedCommunity = communitiesData?.communities?.find((community) => community.id === communityId);
  const canLeaveDetails = Boolean(communityId && title.trim() && (type !== 'link' || url.trim()));

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [hydrated, isAuthenticated, router]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (preselectedCommunityId) {
        setCommunityId(preselectedCommunityId);
      } else if (communitiesData?.communities?.[0]?.id && !communityId) {
        setCommunityId(communitiesData.communities[0].id);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [preselectedCommunityId, communitiesData, communityId]);

  const publishPost = async () => {
    if (!title.trim() || !communityId) {
      setError('Choose a community and add a title before publishing.');
      setStep(1);
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/posts', {
        title: title.trim(),
        type,
        body: type === 'text' ? body : '',
        tags: type === 'text' ? tags : [],
        url: type === 'link' ? url : undefined,
        community_id: communityId,
        view_permission: viewPermission,
        comment_permission: commentPermission,
        likes_visibility: likesVisibility,
      });

      const newPost = res.data.data;
      router.push(`/post/${newPost.id}`);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error || 'Failed to submit post');
    } finally {
      setLoading(false);
    }
  };

  const goToStep = (next: number) => {
    setError('');
    setStep(next);
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[--border] bg-[--surface] text-xs text-[--muted] hover:text-[--foreground] hover:border-[--primary]/40 font-semibold transition-all shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[--primary]" />
          <span>Back to feed</span>
        </Link>
      </div>

      <div className="bg-[--surface] rounded-3xl border border-[--border] p-6 sm:p-8 shadow-sm flex flex-col gap-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold text-[--foreground]">Create a Post</h1>
            <p className="text-xs text-[--muted]">Publish discussions or share links with the community</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => setAiOpen(true)} className="shrink-0 gap-1.5 text-[--primary] border-[--primary]/40">
            <Sparkles className="w-3.5 h-3.5" /> Generate with AI
          </Button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-[--danger] rounded-2xl px-4 py-3 text-xs font-semibold">
            {error}
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/80 p-2 text-center text-[10px] font-bold">
          {['Post details', 'Post settings', 'Preview & publish'].map((label, index) => (
            <button
              key={label}
              type="button"
              onClick={() => goToStep(index + 1)}
              className={`rounded-xl border py-2.5 transition-all ${
                step === index + 1
                  ? 'bg-transparent text-[--foreground] border-white/80 font-black'
                  : 'bg-transparent text-[--muted] border-transparent'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
          className="flex flex-col gap-5"
        >
          {/* Community Selector */}
          {step === 1 && <>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[--foreground]">Target Community</label>
            <select
              value={communityId}
              onChange={(e) => setCommunityId(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-[--border] bg-[--surface-subtle] text-xs sm:text-sm font-semibold text-[--foreground] focus:outline-none focus:ring-2 focus:ring-[--primary]/30 focus:border-[--primary] transition-all cursor-pointer"
            >
              <option value="" disabled>
                Choose where to post...
              </option>
              {communitiesData?.communities?.map((c) => (
                <option key={c.id} value={c.id}>
                  b/{c.name} ({c.member_count} members)
                </option>
              ))}
            </select>
          </div>

          {/* Post Type Selector Tabs */}
          <div className="flex rounded-2xl bg-[--surface-subtle] p-1.5 border border-[--border] gap-1.5 mt-2">
            <button
              type="button"
              onClick={() => setType('text')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                type === 'text'
                  ? 'bg-[--surface] text-[--foreground] shadow-sm border border-[--border]'
                  : 'text-[--muted] hover:text-[--foreground]'
              }`}
            >
              <FileText className="w-4 h-4 text-[--primary]" />
              <span>Post Discussion</span>
            </button>
            <button
              type="button"
              onClick={() => setType('link')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                type === 'link'
                  ? 'bg-[--surface] text-[--foreground] shadow-sm border border-[--border]'
                  : 'text-[--muted] hover:text-[--foreground]'
              }`}
            >
              <Link2 className="w-4 h-4 text-[--secondary]" />
              <span>Share Link</span>
            </button>
          </div>

          {/* Title input */}
          <div>
            <Input
              label="Post Title"
              placeholder="Give your post a descriptive and compelling headline"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={300}
            />
            <div className="text-right mt-1">
              <span className="text-[10px] text-[--muted]">{title.length}/300</span>
            </div>
          </div>

          {/* Content field */}
          {type === 'text' && (
            <>
              <Textarea label="Body Text (Optional)" placeholder="Add more details, insights, or format with markdown..." value={body} onChange={(e) => setBody(e.target.value)} rows={6} />
            </>
          )}

          {type === 'link' && (
            <Input
              label="Web Address (URL)"
              type="url"
              placeholder="https://example.com/article"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          )}

          </>}

          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-bold text-[--foreground]">Who can see this post</label>
                  <select
                    value={viewPermission}
                    onChange={(e) => setViewPermission(e.target.value as typeof viewPermission)}
                    className="mt-1.5 w-full px-4 py-3 rounded-2xl border border-[--border] bg-[--surface] text-xs sm:text-sm font-semibold text-[--foreground] focus:outline-none focus:ring-2 focus:ring-[--primary]/30 focus:border-[--primary]"
                  >
                    <option value="everyone">Everyone</option>
                    <option value="members">Community members only</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[--foreground]">Who can comment</label>
                  <select
                    value={commentPermission}
                    onChange={(e) => setCommentPermission(e.target.value as typeof commentPermission)}
                    className="mt-1.5 w-full px-4 py-3 rounded-2xl border border-[--border] bg-[--surface] text-xs sm:text-sm font-semibold text-[--foreground] focus:outline-none focus:ring-2 focus:ring-[--primary]/30 focus:border-[--primary]"
                  >
                    <option value="everyone">Everyone</option>
                    <option value="members">Community members only</option>
                    <option value="nobody">No one (lock comments)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[--foreground]">Who can see likes</label>
                  <select
                    value={likesVisibility}
                    onChange={(e) => setLikesVisibility(e.target.value as typeof likesVisibility)}
                    className="mt-1.5 w-full px-4 py-3 rounded-2xl border border-[--border] bg-[--surface] text-xs sm:text-sm font-semibold text-[--foreground] focus:outline-none focus:ring-2 focus:ring-[--primary]/30 focus:border-[--primary]"
                  >
                    <option value="everyone">Everyone</option>
                    <option value="members">Community members only</option>
                    <option value="author">Only me</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-[--foreground]">Tags</label>
                <p className="text-[11px] text-[--muted] mt-1">Add up to 8 tags. Click a tag to remove it.</p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5 px-3 py-2 rounded-xl border border-[--border] bg-[--surface] min-h-[44px] focus-within:border-[--primary] focus-within:ring-2 focus-within:ring-[--primary]/20">
                  {tags.map((tag) => (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => setTags(tags.filter((item) => item !== tag))}
                      className="rounded-lg border border-[--border] bg-[--surface-subtle] text-[--foreground] px-2 py-1 text-xs font-bold"
                    >
                      #{tag} ×
                    </button>
                  ))}
                  {tags.length < 8 && (
                    <input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
                          e.preventDefault();
                          const tag = tagInput.trim().replace(/^#/, '');
                          if (!tags.includes(tag) && tags.length < 8) setTags([...tags, tag]);
                          setTagInput('');
                        }
                      }}
                      placeholder={tags.length === 0 ? 'Add a tag and press Enter' : 'Add tag...'}
                      className="flex-1 min-w-[140px] bg-transparent text-sm text-[--foreground] placeholder-[--muted] focus:outline-none py-1"
                    />
                  )}
                </div>
              </div>
              {aiSource && (
                <div className="rounded-2xl border border-[--primary]/25 bg-[--primary-light] p-3 text-xs">
                  <p className="font-bold text-[--primary]">AI source: {aiSource.source || 'Google News'}</p>
                  <a className="text-[--muted] hover:underline" href={aiSource.url} target="_blank" rel="noreferrer">{aiSource.title}</a>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="rounded-2xl border border-[--border] bg-[--surface-raised] p-5 min-h-[220px] text-[--foreground]">
              <p className="text-[10px] font-black uppercase tracking-wider text-[--primary]">Final preview</p>
              <h2 className="text-lg font-black mt-2 text-[--foreground]">{title.trim() || 'Untitled post'}</h2>
              <p className="text-xs text-[--muted] mt-1">
                b/{selectedCommunity?.name || 'Choose a community'} · {type === 'text' ? 'Discussion' : 'Link'}
              </p>
              <p className="text-[11px] text-[--muted] mt-3">
                Visible to {viewPermission === 'everyone' ? 'everyone' : 'members'} · Comments {commentPermission === 'nobody' ? 'locked' : commentPermission === 'members' ? 'members only' : 'open'} · Likes {likesVisibility === 'author' ? 'only you' : likesVisibility === 'members' ? 'members only' : 'public'}
              </p>
              {body.trim() ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed mt-4 text-[--foreground]">{body}</p>
              ) : (
                <p className="text-sm text-[--muted] mt-4">No body text yet.</p>
              )}
              {url && <p className="text-xs text-[--primary] mt-3 break-all">{url}</p>}
              <div className="flex flex-wrap gap-1 mt-4">
                {tags.length > 0 ? tags.map((tag) => (
                  <span key={tag} className="rounded-lg px-2 py-1 text-[10px] bg-[--primary-light] text-[--primary]">#{tag}</span>
                )) : (
                  <span className="text-[11px] text-[--muted]">No tags</span>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-[--border]">
            {step === 1 ? (
              <Link href="/"><Button type="button" variant="ghost" size="sm">Cancel</Button></Link>
            ) : (
              <Button type="button" variant="ghost" size="sm" onClick={() => goToStep(step - 1)}>Back</Button>
            )}
            <Button
              type="button"
              variant="primary"
              className={step === 3 ? 'hidden' : undefined}
              onClick={() => {
                if (step === 1 && !canLeaveDetails) {
                  setError('Choose a community and add a title to continue.');
                  return;
                }
                goToStep(step + 1);
              }}
              disabled={step === 1 && !canLeaveDetails}
            >
              Continue
            </Button>
            <Button
              type="button"
              variant="primary"
              loading={loading}
              disabled={!title.trim() || !communityId}
              className={`gap-1.5 shadow-md shadow-[--primary]/20 bg-gradient-to-r from-[--primary] to-[--accent] border-0 ${step === 3 ? '' : 'hidden'}`}
              onClick={publishPost}
            >
              <Send className="w-4 h-4" /><span>Publish Post</span>
            </Button>
          </div>
        </form>
      </div>
      <AiPostAssistant isOpen={aiOpen} onClose={() => setAiOpen(false)} community={selectedCommunity?.name || 'General'} onApply={(post) => { setType('text'); setTitle(post.title); setBody(post.body); setTags(post.tags); setAiSource(post.source || null); setStep(3); }} />
    </div>
  );
}

export default function CreatePostPage() {
  return (
    <Suspense fallback={<div className="h-64 bg-[--surface] rounded-3xl border border-[--border] animate-pulse" />}>
      <CreatePostContent />
    </Suspense>
  );
}
