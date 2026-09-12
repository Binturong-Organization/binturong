'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Bot, ArrowLeft, Check, Clock, Loader2, Pause, Play, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';

type Agent = { id: string; name: string; status: 'active' | 'paused'; topics: string[]; frequency: string; posting_time: string; timezone: string; post_style: string; post_length: string; publishing_mode: string; next_run_at?: string };
type Draft = { id: string; title: string; body: string; tags: string[]; topic: string; status: string; created_at: string; validation_errors?: string[] };
type ScheduledArticle = { id: string; title: string; topic: string; scheduled_for: string };

export default function AiAgentPage() {
  const { slug } = useParams<{ slug: string }>();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [scheduledArticles, setScheduledArticles] = useState<ScheduledArticle[]>([]);
  const [topics, setTopics] = useState('AI, Technology');
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState('');
  const [planning, setPlanning] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [plan, setPlan] = useState<{ title: string; topic: string }[]>([]);
  const [schedule, setSchedule] = useState('daily');
  const [time, setTime] = useState('09:00');
  const topicOptions = ['Technology', 'AI', 'Business', 'Gaming', 'Education', 'Science', 'News'];

  const load = async () => {
    setLoading(true);
    try {
      const community = await api.get(`/communities/${slug}`);
      const response = await api.get(`/communities/${community.data.data.id}/ai-agent`);
      const nextAgent = response.data.data as Agent;
      setAgent(nextAgent);
      const draftResponse = await api.get(`/ai-agents/${nextAgent.id}/drafts`);
      setDrafts(draftResponse.data.data.drafts || []);
      const scheduleResponse = await api.get(`/ai-agents/${nextAgent.id}/plan`);
      setScheduledArticles(scheduleResponse.data.data.articles || []);
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } }).response?.status;
      if (status !== 404) setMessage('Unable to load the AI agent. You must be a community moderator.');
    } finally { setLoading(false); }
  };
  useEffect(() => {
    if (!slug) return;
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  // load intentionally runs when the route slug changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const create = async () => {
    setWorking(true); setMessage('');
    try {
      const community = await api.get(`/communities/${slug}`);
      await api.post(`/communities/${community.data.data.id}/ai-agent`, { name: `${community.data.data.name} AI`, topics: topics.split(',').map(t => t.trim()).filter(Boolean), frequency: 'weekly', post_style: 'educational', post_length: 'medium', publishing_mode: 'approval' });
      await load();
    } catch (error: unknown) { setMessage((error as { response?: { data?: { error?: string } } }).response?.data?.error || 'Could not create agent'); }
    finally { setWorking(false); }
  };
  const action = async (path: string, success: string) => {
    setWorking(true); setMessage('');
    try { await api.post(path); setMessage(success); await load(); }
    catch (error: unknown) { setMessage((error as { response?: { data?: { error?: string } } }).response?.data?.error || 'Action failed'); }
    finally { setWorking(false); }
  };
  const previewPlan = async () => {
    setWorking(true); setMessage('');
    try { const response = await api.post(`/ai-agents/${agent?.id}/plan`, { topics: selectedTopics }); setPlan(response.data.data.articles); }
    catch (error: unknown) { setMessage((error as { response?: { data?: { error?: string } } }).response?.data?.error || 'Could not create article titles'); }
    finally { setWorking(false); }
  };
  const confirmPlan = async () => {
    setWorking(true); setMessage('');
    try { await api.post(`/ai-agents/${agent?.id}/plan/confirm`, { topics: selectedTopics, articles: plan, schedule, time }); setPlanning(false); setPlan([]); setMessage('Your 10 article drafts are scheduled. Unreviewed drafts publish automatically at their scheduled time.'); await load(); }
    catch (error: unknown) { setMessage((error as { response?: { data?: { error?: string } } }).response?.data?.error || 'Could not schedule articles'); }
    finally { setWorking(false); }
  };

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[--primary]" /></div>;
  if (!agent) return <main className="max-w-xl mx-auto bg-[--surface] rounded-3xl border border-[--border] p-7"><Link href={`/r/${slug}`} className="text-xs font-bold text-[--primary] inline-flex gap-1 items-center mb-6"><ArrowLeft className="w-4 h-4" /> Back to community</Link><Bot className="w-10 h-10 text-[--primary] mb-3" /><h1 className="text-xl font-black">Create AI Agent</h1><p className="text-sm text-[--muted] mt-1 mb-5">Posts are generated as drafts for your approval.</p><label className="text-xs font-bold">Topics, separated by commas</label><input value={topics} onChange={e => setTopics(e.target.value)} className="w-full mt-2 px-3 py-2 rounded-xl border border-[--border] bg-[--surface-subtle]" /><Button onClick={create} loading={working} className="mt-5"><Sparkles className="w-4 h-4" /> Create agent</Button>{message && <p className="text-xs text-[--danger] mt-3">{message}</p>}</main>;

  return <main className="max-w-4xl mx-auto flex flex-col gap-5"><div className="flex justify-between items-center"><div><Link href={`/r/${slug}`} className="text-xs font-bold text-[--primary] inline-flex gap-1 items-center"><ArrowLeft className="w-4 h-4" /> Back to community</Link><h1 className="text-2xl font-black mt-2 flex items-center gap-2"><Bot className="text-[--primary]" /> {agent.name}</h1><p className="text-xs text-[--muted] mt-1">AI-generated posts are clearly marked and require approval.</p></div><Button variant="outline" onClick={() => agent.status === 'active' ? action(`/ai-agents/${agent.id}/pause`, 'Agent paused') : setPlanning(true)} loading={working}>{agent.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}{agent.status === 'active' ? 'Pause' : 'Activate AI Agent'}</Button></div>
  {message && <div className="rounded-2xl p-3 bg-[--primary]/10 text-xs font-semibold text-[--primary]">{message}</div>}
  {planning && <section className="rounded-3xl bg-[--surface] border border-[--border] p-5"><h2 className="font-black">Plan your AI articles</h2><p className="text-xs text-[--muted] mt-1">Choose up to 3 topics. We will prepare 10 article titles and schedule their drafts.</p><div className="flex flex-wrap gap-2 mt-4">{topicOptions.map(topic => <button key={topic} onClick={() => setSelectedTopics(current => current.includes(topic) ? current.filter(item => item !== topic) : current.length < 3 ? [...current, topic] : current)} className={`px-3 py-2 rounded-xl text-xs font-bold border ${selectedTopics.includes(topic) ? 'bg-[--primary] text-white border-[--primary]' : 'border-[--border] text-[--muted]'}`}>{selectedTopics.includes(topic) ? '✓ ' : ''}{topic}</button>)}</div><div className="grid sm:grid-cols-2 gap-3 mt-4"><select value={schedule} onChange={e => setSchedule(e.target.value)} className="px-3 py-2 rounded-xl border border-[--border] bg-[--surface-subtle] text-sm"><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="random">Random time</option></select><input type="time" value={time} onChange={e => setTime(e.target.value)} disabled={schedule === 'random'} className="px-3 py-2 rounded-xl border border-[--border] bg-[--surface-subtle] text-sm disabled:opacity-50" /></div>{plan.length === 0 ? <Button onClick={previewPlan} disabled={selectedTopics.length === 0} loading={working} className="mt-4"><Sparkles className="w-4 h-4" /> Generate 10 titles</Button> : <><ol className="mt-4 rounded-2xl border border-[--border] divide-y divide-[--border]">{plan.map((article, index) => <li key={`${article.title}-${index}`} className="px-3 py-2 text-sm"><span className="text-[--primary] font-black mr-2">{index + 1}.</span>{article.title}<span className="text-xs text-[--muted] ml-2">{article.topic}</span></li>)}</ol><div className="flex gap-2 mt-4"><Button onClick={confirmPlan} loading={working}><Check className="w-4 h-4" /> Confirm schedule</Button><Button variant="outline" onClick={() => setPlan([])} disabled={working}>Regenerate</Button></div></>}</section>}
  <section className="grid sm:grid-cols-3 gap-3"><div className="rounded-2xl bg-[--surface] border border-[--border] p-4"><span className="text-[10px] uppercase font-black text-[--muted]">Status</span><p className="font-bold capitalize mt-1">{agent.status}</p></div><div className="rounded-2xl bg-[--surface] border border-[--border] p-4"><span className="text-[10px] uppercase font-black text-[--muted]">Topics</span><p className="font-bold text-sm mt-1">{agent.topics.join(', ')}</p></div><div className="rounded-2xl bg-[--surface] border border-[--border] p-4"><span className="text-[10px] uppercase font-black text-[--muted]">Schedule</span><p className="font-bold text-sm mt-1">{agent.frequency} at {agent.posting_time?.slice(0, 5)}</p></div></section>
  {scheduledArticles.length > 0 && <section className="rounded-3xl bg-[--surface] border border-[--border] p-5"><h2 className="font-black">Upcoming articles</h2><p className="text-xs text-[--muted] mt-1">These become drafts at the scheduled time, then publish automatically if unreviewed.</p><ol className="mt-4 divide-y divide-[--border]">{scheduledArticles.map((article, index) => <li key={article.id} className="py-2 text-sm"><span className="text-[--primary] font-black mr-2">{index + 1}.</span>{article.title}<span className="text-xs text-[--muted] ml-2">{new Date(article.scheduled_for).toLocaleDateString()}</span></li>)}</ol></section>}
  <section className="rounded-3xl bg-[--surface] border border-[--border] p-5"><div className="flex justify-between items-center"><div><h2 className="font-black">Drafts</h2><p className="text-xs text-[--muted]">Review a draft before it becomes a community post.</p></div><Button onClick={() => action(`/ai-agents/${agent.id}/generate`, 'New draft generated')} loading={working}><Sparkles className="w-4 h-4" /> Generate draft</Button></div><div className="mt-5 space-y-3">{drafts.length === 0 ? <p className="text-sm text-[--muted] py-5 text-center">No drafts yet. Generate one to start.</p> : drafts.map(draft => <article key={draft.id} className="rounded-2xl border border-[--border] p-4"><div className="flex justify-between gap-4"><div><p className="text-[10px] font-black uppercase text-[--primary]">🤖 AI • {draft.topic}</p><h3 className="font-bold mt-1">{draft.title}</h3></div><span className="text-[11px] text-[--muted] whitespace-nowrap"><Clock className="w-3 h-3 inline mr-1" />{new Date(draft.created_at).toLocaleDateString()}</span></div><p className="text-sm leading-relaxed text-[--muted] mt-3 whitespace-pre-wrap">{draft.body}</p><div className="flex gap-1 mt-3 flex-wrap">{draft.tags.map(tag => <span key={tag} className="text-[10px] bg-[--surface-subtle] border border-[--border] rounded-lg px-2 py-1">#{tag}</span>)}</div><div className="flex gap-2 mt-4"><Button size="sm" onClick={() => action(`/ai-agents/${agent.id}/drafts/${draft.id}/approve`, 'Draft published')} loading={working}><Check className="w-3.5 h-3.5" /> Approve & publish</Button><Button size="sm" variant="outline" onClick={() => action(`/ai-agents/${agent.id}/drafts/${draft.id}/reject`, 'Draft rejected')} disabled={working}><X className="w-3.5 h-3.5" /> Reject</Button></div></article>)}</div></section></main>;
}
