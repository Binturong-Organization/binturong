'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, Bot, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';

const categories = [
  'Technology', 'Business', 'Education', 'Health', 'Science',
  'Gaming', 'Entertainment', 'Sports', 'Travel', 'Food',
  'Fashion', 'Finance', 'Marketing', 'Productivity', 'Career',
  'Design', 'Environment', 'History', 'News', 'Community',
];

const titleTemplates = [
  (first: string, second: string) => `How ${first} Is Changing ${second}`,
  (first: string, second: string) => `The Complete ${first} Guide for ${second} Enthusiasts`,
  (first: string, second: string) => `10 ${first} Trends Every ${second} Fan Should Know`,
  (first: string, second: string) => `Smarter ${second}: Lessons From ${first}`,
  (first: string, second: string) => `The Future of ${first} and ${second}`,
  (first: string, second: string) => `Practical ${first} Ideas for Better ${second}`,
  (first: string, second: string) => `What ${second} Can Learn From ${first}`,
  (first: string, second: string) => `A Beginner’s Roadmap to ${first} and ${second}`,
  (first: string, second: string) => `Fresh Ways to Combine ${first} With ${second}`,
  (first: string, second: string) => `The Essential ${first} × ${second} Playbook`,
];

export default function AiPage() {
  const [isBulkPostPanelOpen, setIsBulkPostPanelOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isCategorySelectionComplete, setIsCategorySelectionComplete] = useState(false);
  const [generatingTitle, setGeneratingTitle] = useState<string | null>(null);
  const [generatedTitle, setGeneratedTitle] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [displayedDescription, setDisplayedDescription] = useState('');
  const [generatedTags, setGeneratedTags] = useState<string[]>([]);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [approvedTitle, setApprovedTitle] = useState<string | null>(null);
  const suggestedTitles = titleTemplates.map((template, index) => template(
    selectedCategories[index % selectedCategories.length],
    selectedCategories[(index + 1) % selectedCategories.length],
  ));
  const generateDescription = async (title: string) => {
    setDescription('');
    setDisplayedDescription('');
    setGeneratedTags([]);
    setGenerationError(null);
    setIsGeneratingDescription(true);
    setGeneratedTitle(title);
    setApprovedTitle(null);

    try {
      const response = await api.post('/ai/bulk-description', { title, categories: selectedCategories });
      const nextDescription = response.data.data.description as string;
      const nextTags = Array.isArray(response.data.data.tags) ? response.data.data.tags as string[] : [];
      setDescription(nextDescription);
      setGeneratedTags(nextTags);

      let index = 0;
      const timer = window.setInterval(() => {
        index += 1;
        setDisplayedDescription(nextDescription.slice(0, index));
        if (index >= nextDescription.length) {
          window.clearInterval(timer);
        }
      }, 15);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Something went wrong while generating the description.';
      setGenerationError(message);
      setDescription('');
      setDisplayedDescription('');
      setGeneratedTitle(null);
    } finally {
      setGeneratingTitle(null);
      setIsGeneratingDescription(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto">
      <Link href=".." className="inline-flex items-center gap-1 text-xs font-bold text-[--primary]">
        <ArrowLeft className="w-4 h-4" /> Back to community
      </Link>
      <div className="mt-5 rounded-3xl bg-[--surface] border border-[--border] p-7">
        <div className="flex items-center gap-3">
          <Bot className="w-9 h-9 text-[--primary]" />
          <h1 className="text-2xl font-black">AI Agent</h1>
        </div>
        <p className="mt-1 text-sm text-[--muted]">Your community AI tools will appear here.</p>
        <Button className="mt-5 border border-[--primary]" onClick={() => { setSelectedCategories([]); setIsCategorySelectionComplete(false); setIsBulkPostPanelOpen(true); }}>
          Create Bulk Post with AI
        </Button>
      </div>
      {isBulkPostPanelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-blue-950/70 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Create bulk post with AI">
          <button type="button" className="absolute inset-0 cursor-default bg-black/30" onClick={() => setIsBulkPostPanelOpen(false)} aria-label="Close panel" />
          <aside className="relative h-full w-full max-w-xl overflow-y-auto rounded-l-3xl border border-r-0 border-white/25 p-6 shadow-2xl" style={{
            backgroundColor: '#040e0d',
            backgroundImage: 'radial-gradient(rgba(147, 177, 172, 0.52) 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px',
          }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black">Create Bulk Post with AI</h2>
              <button type="button" onClick={() => setIsBulkPostPanelOpen(false)} className="rounded-lg p-2 text-[--muted] hover:bg-[--surface-subtle]" aria-label="Close panel">
                <X className="w-5 h-5" />
              </button>
            </div>
            {isCategorySelectionComplete ? (
              <>
                <h3 className="mt-6 text-sm font-bold">Selected categories</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedCategories.map((category) => <span key={category} className="rounded-xl border border-[--primary] bg-[--primary]/30 px-3 py-2 text-sm font-medium"><Check className="mr-1 inline h-4 w-4 text-[--primary]" />{category}</span>)}
                </div>
                <div className="my-6 border-t border-[--border]" />
                <h3 className="text-sm font-bold">Title Suggestions</h3>
                <ol className="mt-3 space-y-2">
                  {suggestedTitles.map((title, index) => (
                    <li key={title} className="flex items-center gap-3 rounded-xl border border-[--border] bg-[--surface-subtle] px-3 py-2 text-sm">
                      <p className="min-w-0 flex-1"><span className="mr-2 font-bold text-[--primary]">{index + 1}.</span>{title}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        loading={generatingTitle === title}
                        disabled={isGeneratingDescription || approvedTitle === title}
                        onClick={() => { if (approvedTitle !== title) { void generateDescription(title); } }}
                      >
                        {approvedTitle === title ? 'Done' : 'Generate'}
                      </Button>
                    </li>
                  ))}
                </ol>
                <div className="my-6 border-t border-[--border]" />
                {generatedTitle && (
                  <div className="mt-4 overflow-hidden rounded-2xl border border-[--border] bg-[--surface-subtle]">
                    <div className="border-b border-[--border] px-4 py-3">
                      <p className="text-sm font-semibold text-[--foreground]">{generatedTitle}</p>
                    </div>

                    {isGeneratingDescription && <p className="px-4 pt-4 text-sm text-[--muted]">Creating description…</p>}
                    {generationError && <p className="px-4 pt-4 text-sm text-red-400">{generationError}</p>}

                    {displayedDescription && (
                      <div className="px-4 py-4">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-[--muted]">
                          {displayedDescription}
                          <span className={displayedDescription.length < description.length ? 'animate-pulse text-[--primary]' : 'hidden'}>|</span>
                        </p>
                      </div>
                    )}

                    {generatedTags.length > 0 && (
                      <div className="border-t border-[--border] px-4 py-3">
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-[--muted]">
                          {generatedTags.map((tag) => (
                            <span key={tag}>#{tag}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-3 border-t border-[--border] p-3">
                      <Button type="button" variant="outline" className="border-red-500/60 text-red-400 hover:bg-red-500/10">
                        Reject
                      </Button>
                      <Button
                        type="button"
                        className="bg-[--primary] text-white hover:bg-[--primary-hover]"
                        onClick={() => setApprovedTitle(generatedTitle)}
                      >
                        Approve
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <h3 className="mt-6 text-sm font-bold">Choose a category</h3>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      aria-pressed={selectedCategories.includes(category)}
                      onClick={() => setSelectedCategories((current) => current.includes(category) ? current.filter((item) => item !== category) : [...current, category])}
                      className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left text-sm font-medium transition-colors hover:border-white/80 hover:text-white ${selectedCategories.includes(category) ? 'border-white/80 bg-[#040e0d]/80 text-white ring-1 ring-white/40' : 'border-white/80 bg-[#040e0d]/30 text-white/90'}`}
                    >
                      {category}
                      {selectedCategories.includes(category) && <Check className="h-4 w-4 text-[--primary]" />}
                    </button>
                  ))}
                </div>
                {selectedCategories.length > 0 && (
                  <Button className="mt-5 w-full border border-blue-400 bg-blue-600 hover:bg-blue-500" onClick={() => setIsCategorySelectionComplete(true)}>
                    Done
                  </Button>
                )}
              </>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}
