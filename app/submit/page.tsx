'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import { FileText, Link2, ArrowLeft, Sparkles, Send } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { Community } from '@/components/community/CommunityCard';
import { AiPostAssistant } from '@/components/post/AiPostAssistant';

type PostType = 'text' | 'image' | 'link';

function CreatePostContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCommunityId = searchParams.get('community') || '';

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data: communitiesData } = useSWR<{ communities: Community[] }>('/communities');

  const [type, setType] = useState<PostType>('text');
  const [communityId, setCommunityId] = useState(preselectedCommunityId);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [aiSource, setAiSource] = useState<{ title: string; url: string; source: string } | null>(null);
  const [url, setUrl] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiOpen, setAiOpen] = useState(false);
  const [step, setStep] = useState(1);
  const selectedCommunity = communitiesData?.communities?.find((community) => community.id === communityId);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !communityId) return;
    setLoading(true);
    setError('');

    try {
      const res = await api.post('/posts', {
        title: title.trim(),
        type,
        body: type === 'text' ? body : '',
        tags: type === 'text' ? tags : [],
        url: type === 'link' ? url : undefined,
        scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
        community_id: communityId,
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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[--primary-light] text-[--primary] flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => setAiOpen(true)} className="ml-auto gap-1.5 text-[--primary] border-[--primary]/40"><Sparkles className="w-3.5 h-3.5" /> Generate with AI</Button>
          <div>
            <h1 className="text-xl font-extrabold text-[--foreground]">Create a Post</h1>
            <p className="text-xs text-[--muted]">Publish discussions or share links with the community</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-[--danger] rounded-2xl px-4 py-3 text-xs font-semibold">
            {error}
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 rounded-2xl border border-[--border] bg-[--surface-subtle] p-2 text-center text-[10px] font-bold">
          {['Post details', 'Post settings', 'Preview & publish'].map((label, index) => (
            <button key={label} type="button" onClick={() => index + 1 < step && setStep(index + 1)} style={step === index + 1 ? { backgroundColor: 'transparent', color: 'var(--foreground)', borderColor: 'var(--secondary)', boxShadow: 'none' } : undefined} className={`rounded-xl border-2 py-2.5 transition-all ${step === index + 1 ? 'font-black' : index + 1 < step ? 'bg-[--primary-light] text-[--primary] border-[--primary]/40' : 'bg-[--surface] text-[--muted] border-[--border]'}`}>{label}</button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Community Selector */}
          {step === 1 && <>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[--foreground]">Target Community</label>
            <select
              value={communityId}
              onChange={(e) => setCommunityId(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-[--border] bg-[--surface-subtle] text-xs sm:text-sm font-semibold text-[--foreground] focus:outline-none focus:ring-2 focus:ring-[--primary]/30 focus:border-[--primary] transition-all cursor-pointer"
              required
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
              required
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
              required
            />
          )}

          </>}

          {step === 2 && <div className="flex flex-col gap-4"><div className="rounded-2xl border border-[--border] bg-[--surface-subtle] p-4"><p className="text-xs font-black uppercase tracking-wider text-[--primary]">Daily post limits</p><div className="grid grid-cols-3 gap-2 mt-3 text-center text-[11px]"><div><b>New</b><br />3 posts<br />10 comments</div><div><b>Established</b><br />10 posts<br />50 comments</div><div><b>High reputation</b><br />20 posts<br />100 comments</div></div></div><Input label="Publish date & time (Optional)" type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} /><div><label className="text-xs font-bold text-[--foreground]">Tags</label><p className="text-[11px] text-[--muted] mt-1">Add up to 8 tags. Click a tag to remove it.</p><div className="mt-2 flex flex-wrap gap-1.5">{tags.map(tag => <button type="button" key={tag} onClick={() => setTags(tags.filter(item => item !== tag))} className="rounded-lg bg-[--primary-light] text-[--primary] px-2 py-1 text-xs font-bold">#{tag} ×</button>)}</div><input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) { e.preventDefault(); const tag = tagInput.trim().replace(/^#/, ''); if (!tags.includes(tag) && tags.length < 8) setTags([...tags, tag]); setTagInput(''); } }} placeholder="Add a tag and press Enter" className="mt-2 w-full px-3 py-2 rounded-xl border border-[--border] bg-[--surface] text-sm" /></div>{aiSource && <div className="rounded-2xl border border-[--primary]/25 bg-[--primary-light] p-3 text-xs"><p className="font-bold text-[--primary]">AI source: {aiSource.source || 'Google News'}</p><a className="text-[--muted] hover:underline" href={aiSource.url} target="_blank" rel="noreferrer">{aiSource.title}</a></div>}</div>}

          {step === 3 && <div className="rounded-2xl border border-[--border] bg-[--surface-subtle] p-5"><p className="text-[10px] font-black uppercase tracking-wider text-[--primary]">Final preview</p><h2 className="text-lg font-black mt-2">{title || 'Untitled post'}</h2><p className="text-xs text-[--muted] mt-1">b/{selectedCommunity?.name || 'Choose a community'} · {type === 'text' ? 'Discussion' : 'Link'}</p>{scheduledAt && <p className="text-xs text-[--primary] mt-2">Scheduled for {new Date(scheduledAt).toLocaleString()}</p>}{body && <p className="whitespace-pre-wrap text-sm leading-relaxed mt-4">{body}</p>}{url && <p className="text-xs text-[--primary] mt-3 break-all">{url}</p>}<div className="flex flex-wrap gap-1 mt-4">{tags.map(tag => <span key={tag} className="rounded-lg px-2 py-1 text-[10px] bg-[--primary-light] text-[--primary]">#{tag}</span>)}</div></div>}

          <div className="flex items-center justify-between pt-4 border-t border-[--border]">
            {step === 1 ? <Link href="/"><Button type="button" variant="ghost" size="sm">Cancel</Button></Link> : <Button type="button" variant="ghost" size="sm" onClick={() => setStep(step - 1)}>Back</Button>}
            {step < 3 ? <Button type="button" variant="primary" onClick={() => setStep(step + 1)} disabled={(step === 1 && (!communityId || !title.trim() || (type === 'link' && !url.trim())))}>Continue</Button> : <Button type="submit" variant="primary" loading={loading} disabled={!title.trim() || !communityId} className="gap-1.5 shadow-md shadow-[--primary]/20 bg-gradient-to-r from-[--primary] to-[--accent] border-0"><Send className="w-4 h-4" /><span>{scheduledAt ? 'Schedule Post' : 'Publish Post'}</span></Button>}
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
