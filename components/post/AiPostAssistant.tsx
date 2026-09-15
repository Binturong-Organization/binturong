'use client';

import { useState } from 'react';
import { Check, Search, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';

type SearchResult = { title: string; url: string; source: string; published_at: string };
type GeneratedPost = { title: string; body: string; tags: string[]; source?: SearchResult };

export function AiPostAssistant({ isOpen, onClose, onApply, community }: { isOpen: boolean; onClose: () => void; onApply: (post: GeneratedPost) => void; community: string }) {
  const [prompt, setPrompt] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [generated, setGenerated] = useState<GeneratedPost | null>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  if (!isOpen) return null;

  const search = async () => {
    setWorking(true); setError(''); setSelected(null); setGenerated(null);
    try { const response = await api.post('/ai-post-assist/search', { query: prompt }); setResults(response.data.data.results || []); }
    catch (err: unknown) { setError((err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Search failed'); }
    finally { setWorking(false); }
  };
  const generate = async () => {
    if (!selected) return;
    setWorking(true); setError('');
    try { const response = await api.post('/ai-post-assist/generate', { prompt, source: selected, community }); setGenerated(response.data.data); }
    catch (err: unknown) { setError((err as { response?: { data?: { error?: string } } }).response?.data?.error || 'Generation failed'); }
    finally { setWorking(false); }
  };
  const reject = () => { setGenerated(null); setSelected(null); };
  return <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end p-4">
    <aside className="w-full sm:w-1/2 max-w-2xl h-full overflow-y-auto bg-[--surface] border border-white/80 rounded-3xl shadow-2xl p-5 sm:p-7 animate-in slide-in-from-right duration-200">
      <div className="flex justify-between gap-4"><div><div className="flex items-center gap-2 text-[--primary]"><Sparkles className="w-5 h-5" /><span className="font-black text-sm">Generate with AI</span></div><p className="text-xs text-[--muted] mt-1">Search Google News, select a source, then review the generated post.</p></div><button onClick={onClose} aria-label="Close AI assistant" className="w-9 h-9 rounded-xl border border-[--border] flex items-center justify-center"><X className="w-4 h-4" /></button></div>
      <div className="mt-6"><label className="text-xs font-bold">What happened?</label><textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder={'Example: He got laid off'} className="mt-2 w-full min-h-28 p-3 rounded-2xl border border-[--border] bg-[--surface-subtle] text-sm focus:outline-none focus:ring-2 focus:ring-[--primary]/30" maxLength={500} /><Button onClick={search} disabled={prompt.trim().length < 3} loading={working} className="mt-3"><Search className="w-4 h-4" /> Search Google News</Button></div>
      {error && <p className="mt-4 rounded-xl bg-red-500/10 text-[--danger] p-3 text-xs font-semibold">{error}</p>}
      {results.length > 0 && !generated && <section className="mt-6"><h2 className="font-black text-sm">Choose a related source</h2><div className="mt-3 space-y-2">{results.map(result => <button key={result.url} onClick={() => setSelected(result)} className={`w-full text-left p-3 rounded-2xl border transition-colors ${selected?.url === result.url ? 'border-[--primary] bg-[--primary-light]' : 'border-[--border] hover:border-[--primary]/50'}`}><p className="font-bold text-sm">{result.title}</p><p className="text-xs text-[--muted] mt-1">{result.source || 'Google News'} {result.published_at ? `• ${new Date(result.published_at).toLocaleDateString()}` : ''}</p></button>)}</div><Button onClick={generate} disabled={!selected} loading={working} className="mt-4"><Sparkles className="w-4 h-4" /> Generate post with AI</Button></section>}
      {generated && <section className="mt-6"><h2 className="font-black text-sm">Review generated post</h2><div className="mt-3 rounded-2xl border border-[--border] p-4"><p className="font-black text-lg">{generated.title}</p><div className="flex flex-wrap gap-1 mt-3">{generated.tags.map(tag => <span key={tag} className="text-[10px] rounded-lg px-2 py-1 bg-[--primary-light] text-[--primary]">#{tag}</span>)}</div><p className="whitespace-pre-wrap text-sm leading-relaxed mt-4 text-[--muted]">{generated.body}</p></div><div className="flex gap-2 mt-4"><Button onClick={() => { onApply({ ...generated, source: selected || undefined }); onClose(); }}><Check className="w-4 h-4" /> Approve & use post</Button><Button variant="outline" onClick={reject}>Reject</Button></div></section>}
    </aside>
  </div>;
}
