'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Sparkles,
  Globe,
  Lock,
  Shield,
  Palette,
  Check,
  Upload,
  Hash,
  AlertTriangle,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Users,
  Eye,
  Megaphone,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import api from '@/lib/api';

const CATEGORIES = [
  'Technology',
  'Gaming',
  'Programming',
  'Startups',
  'Entertainment',
  'Science',
  'Music',
  'Art & Design',
  'Lifestyle',
  'Finance',
  'Education',
  'General',
];

const PRESET_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
];

interface RuleItem {
  id: string;
  title: string;
  description: string;
}

interface CreateCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateCommunityModal({ isOpen, onClose, onSuccess }: CreateCommunityModalProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1: Identity & Basics
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Technology');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  // Step 2: Branding & Visuals
  const [themeColor, setThemeColor] = useState('#6366f1');
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string>('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>('');

  // Step 3: Access & Safety
  const [visibility, setVisibility] = useState<'public' | 'restricted' | 'private'>('public');
  const [isNsfw, setIsNsfw] = useState(false);
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [postingPermission, setPostingPermission] = useState<'anyone' | 'approved_only' | 'mods_only'>('anyone');
  const [commentPermission, setCommentPermission] = useState<'anyone' | 'approved_only' | 'mods_only'>('anyone');

  // Step 4: Rules & Welcome
  const [rulesList, setRulesList] = useState<RuleItem[]>([
    { id: '1', title: 'Be respectful and constructive', description: 'Harassment and hate speech will not be tolerated.' },
  ]);
  const [guidelines, setGuidelines] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('Welcome to the community! Introduce yourself and share your thoughts.');
  const [announcement, setAnnouncement] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    const autoSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    setSlug(autoSlug);
  };

  const addTagsFromText = (text: string) => {
    const parts = text
      .split(/[,;\n]+/)
      .map((t) => t.trim().toLowerCase().replace(/^#/, ''))
      .filter(Boolean);
    if (parts.length === 0) return;
    const combined = Array.from(new Set([...tags, ...parts])).slice(0, 10);
    setTags(combined);
    setTagInput('');
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.includes(',')) {
      addTagsFromText(val);
    } else {
      setTagInput(val);
    }
  };

  const handleAddTagKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (tagInput.trim()) {
        addTagsFromText(tagInput);
      }
    }
  };

  const handlePasteTags = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    addTagsFromText(pastedText);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      setIconPreview(URL.createObjectURL(file));
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleAddRule = () => {
    setRulesList([
      ...rulesList,
      { id: Date.now().toString(), title: '', description: '' },
    ]);
  };

  const handleRuleChange = (index: number, field: 'title' | 'description', value: string) => {
    const updated = [...rulesList];
    updated[index][field] = value;
    setRulesList(updated);
  };

  const handleRemoveRule = (index: number) => {
    setRulesList(rulesList.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      setError('Community name and URL slug are required');
      setStep(1);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const validRules = rulesList.filter((r) => r.title.trim().length > 0);
      const rulesPlainText = validRules.map((r, i) => `${i + 1}. ${r.title}: ${r.description}`).join('\n');

      let res;
      if (iconFile || bannerFile) {
        const formData = new FormData();
        formData.append('name', name.trim());
        formData.append('slug', slug.trim());
        formData.append('description', description.trim());
        formData.append('category', category);
        formData.append('tags', JSON.stringify(tags));
        formData.append('visibility', visibility);
        formData.append('is_nsfw', String(isNsfw));
        formData.append('posting_permission', postingPermission);
        formData.append('comment_permission', commentPermission);
        formData.append('requires_approval', String(requiresApproval));
        formData.append('theme_color', themeColor);
        formData.append('welcome_message', welcomeMessage.trim());
        formData.append('guidelines', guidelines.trim());
        formData.append('announcement', announcement.trim());
        formData.append('rules_json', JSON.stringify(validRules));
        formData.append('rules', rulesPlainText);

        if (iconFile) formData.append('icon', iconFile);
        if (bannerFile) formData.append('banner', bannerFile);

        // Do NOT manually override Content-Type header; let axios handle boundary
        res = await api.post('/communities', formData);
      } else {
        // Send pure JSON payload when no files are attached
        res = await api.post('/communities', {
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim(),
          category,
          tags,
          visibility,
          is_nsfw: isNsfw,
          posting_permission: postingPermission,
          comment_permission: commentPermission,
          requires_approval: requiresApproval,
          theme_color: themeColor,
          welcome_message: welcomeMessage.trim(),
          guidelines: guidelines.trim(),
          announcement: announcement.trim(),
          rules_json: validRules,
          rules: rulesPlainText,
        });
      }

      const newCommunity = res.data.data;
      onSuccess?.();
      onClose();
      router.push(`/r/${newCommunity.slug}`);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      setError(e.response?.data?.error || e.message || 'Failed to create community');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[--surface] border border-[--border] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-auto animate-in fade-in duration-200">
        {/* Top Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[--border]">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
              style={{ backgroundColor: themeColor }}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[--foreground]">Create a Community</h2>
              <p className="text-xs text-[--muted]">Step {step} of 4 &bull; Custom Branding &amp; Rules</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-[--border] hover:bg-[--surface-subtle] flex items-center justify-center text-[--muted] hover:text-[--foreground] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="grid grid-cols-4 border-b border-[--border] text-center text-xs font-bold">
          {[
            { id: 1, label: '1. Identity' },
            { id: 2, label: '2. Branding' },
            { id: 3, label: '3. Governance' },
            { id: 4, label: '4. Rules' },
          ].map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStep(s.id)}
              className={`py-3 transition-colors border-b-2 ${
                step === s.id
                  ? 'border-[--primary] text-[--foreground] bg-[--primary]/5'
                  : step > s.id
                  ? 'border-emerald-500 text-emerald-500'
                  : 'border-transparent text-[--muted] hover:text-[--foreground]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/20 text-[--danger] text-xs font-semibold rounded-2xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6 max-h-[70vh] overflow-y-auto">
          {/* STEP 1: IDENTITY */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div>
                <Input
                  label="Community Name *"
                  placeholder="e.g. Artificial Intelligence"
                  value={name}
                  onChange={handleNameChange}
                  required
                  maxLength={50}
                />
                <p className="text-[11px] text-[--muted] mt-1">
                  Display name for your community.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-[--foreground] block mb-1.5">
                  Community URL Slug *
                </label>
                <div className="flex items-center rounded-xl border border-[--border] bg-[--surface] overflow-hidden focus-within:border-[--primary] focus-within:ring-2 focus-within:ring-[--primary]/20">
                  <span className="px-3.5 py-2.5 bg-[--surface-subtle] text-xs font-bold text-[--primary] border-r border-[--border]">
                    b/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="artificial_intelligence"
                    className="w-full px-3 py-2 bg-transparent text-sm text-[--foreground] focus:outline-none"
                    required
                  />
                </div>
                <p className="text-[11px] text-[--muted] mt-1">
                  Prefix is <strong>b/</strong>. Letters, numbers, and underscores only.
                </p>
              </div>

              <div>
                <Textarea
                  label="Description / Topic"
                  placeholder="What is this community about? Share discussions, news, guides..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={1000}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[--foreground] block mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[--border] bg-[--surface] text-sm text-[--foreground] focus:outline-none focus:border-[--primary] focus:ring-2 focus:ring-[--primary]/20 cursor-pointer"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[--foreground]">
                    Tags (up to 10)
                  </label>
                  <span className="text-[10px] text-[--muted]">Paste comma-separated items</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl border border-[--border] bg-[--surface] min-h-[44px]">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[--surface-subtle] border border-[--border] text-xs font-medium text-[--foreground]"
                    >
                      <Hash className="w-3 h-3 text-[--primary]" />
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-[--muted] hover:text-[--foreground]"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {tags.length < 10 && (
                    <input
                      type="text"
                      placeholder={tags.length === 0 ? "Paste: Technology, Programming, AI..." : "Add tag..."}
                      value={tagInput}
                      onChange={handleTagInputChange}
                      onKeyDown={handleAddTagKey}
                      onPaste={handlePasteTags}
                      className="flex-1 min-w-[140px] bg-transparent text-xs text-[--foreground] placeholder-[--muted] focus:outline-none px-2 py-1"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: BRANDING & VISUALS */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              {/* Theme Color */}
              <div>
                <label className="text-xs font-semibold text-[--foreground] block mb-2">
                  Accent Theme Color
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setThemeColor(color)}
                      className={`w-8 h-8 rounded-xl transition-transform flex items-center justify-center ${
                        themeColor === color ? 'scale-110 ring-2 ring-white shadow-md' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {themeColor === color && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                  <div className="flex items-center gap-1.5 ml-2">
                    <input
                      type="color"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="w-8 h-8 rounded-xl cursor-pointer border border-[--border] p-0.5 bg-transparent"
                    />
                    <span className="text-xs text-[--muted] font-mono">{themeColor}</span>
                  </div>
                </div>
              </div>

              {/* Icon & Banner Uploads */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[--foreground] block mb-1.5">
                    Community Icon (Avatar)
                  </label>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-[--border] rounded-2xl p-4 hover:border-[--primary]/50 cursor-pointer transition-colors bg-[--surface-subtle]/50 text-center">
                    {iconPreview ? (
                      <img src={iconPreview} alt="Preview" className="w-16 h-16 rounded-2xl object-cover shadow-sm mb-2" />
                    ) : (
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl mb-2 shadow-sm"
                        style={{ backgroundColor: themeColor }}
                      >
                        {name ? name[0]?.toUpperCase() : 'B'}
                      </div>
                    )}
                    <span className="text-xs font-bold text-[--primary] flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5" /> Upload Icon
                    </span>
                    <span className="text-[10px] text-[--muted] mt-1">PNG, JPG, WebP up to 5MB</span>
                    <input type="file" accept="image/*" onChange={handleIconChange} className="hidden" />
                  </label>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[--foreground] block mb-1.5">
                    Cover Banner Image
                  </label>
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-[--border] rounded-2xl p-4 hover:border-[--primary]/50 cursor-pointer transition-colors bg-[--surface-subtle]/50 text-center">
                    {bannerPreview ? (
                      <div className="w-full h-16 rounded-xl overflow-hidden mb-2">
                        <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div
                        className="w-full h-16 rounded-xl mb-2 shadow-xs"
                        style={{ backgroundColor: themeColor }}
                      />
                    )}
                    <span className="text-xs font-bold text-[--primary] flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5" /> Upload Banner
                    </span>
                    <span className="text-[10px] text-[--muted] mt-1">Recommended: 1200x300</span>
                    <input type="file" accept="image/*" onChange={handleBannerChange} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Live Preview */}
              <div className="p-4 rounded-2xl border border-[--border] bg-[--surface-subtle]">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[--muted] mb-3">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Card Preview</span>
                </div>
                <div className="max-w-sm mx-auto bg-[--surface] rounded-2xl border border-[--border] overflow-hidden shadow-sm">
                  <div
                    className="h-12 relative p-2 flex justify-between items-start bg-cover bg-center"
                    style={{
                      backgroundColor: themeColor,
                      backgroundImage: bannerPreview ? `url(${bannerPreview})` : undefined,
                    }}
                  >
                    <span className="px-2 py-0.5 rounded-full bg-black/40 text-white text-[9px] font-bold">
                      {category}
                    </span>
                    {isNsfw && (
                      <span className="px-1.5 py-0.5 rounded-full bg-red-600 text-white text-[8px] font-black">
                        18+
                      </span>
                    )}
                  </div>
                  <div className="p-4 pt-0 relative">
                    <div className="-mt-6 mb-2 w-12 h-12 rounded-xl bg-[--surface] border-2 border-[--surface] shadow-md flex items-center justify-center font-black overflow-hidden">
                      {iconPreview ? (
                        <img src={iconPreview} alt="Icon" className="w-full h-full object-cover" />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-white text-lg font-bold"
                          style={{ backgroundColor: themeColor }}
                        >
                          {name ? name[0]?.toUpperCase() : 'B'}
                        </div>
                      )}
                    </div>
                    <h4 className="font-bold text-sm text-[--foreground] truncate">
                      b/{name || 'community_name'}
                    </h4>
                    <p className="text-[11px] text-[--muted] mt-1 line-clamp-2">
                      {description || 'This is how your community card will appear to other users.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: ACCESS & SAFETY */}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              {/* Visibility selection */}
              <div>
                <label className="text-xs font-semibold text-[--foreground] block mb-2">
                  Community Type &amp; Visibility
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'public',
                      title: 'Public',
                      desc: 'Anyone can view, join, post, and comment',
                      icon: Globe,
                    },
                    {
                      id: 'restricted',
                      title: 'Restricted',
                      desc: 'Anyone can view, but only approved members post',
                      icon: Eye,
                    },
                    {
                      id: 'private',
                      title: 'Private',
                      desc: 'Only approved members can view and participate',
                      icon: Lock,
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setVisibility(item.id as typeof visibility)}
                        className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                          visibility === item.id
                            ? 'border-[--primary] bg-[--primary]/5 shadow-sm'
                            : 'border-[--border] hover:border-[--primary]/40 bg-[--surface]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Icon className={`w-5 h-5 ${visibility === item.id ? 'text-[--primary]' : 'text-[--muted]'}`} />
                          {visibility === item.id && <Check className="w-4 h-4 text-[--primary]" />}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-[--foreground]">{item.title}</div>
                          <div className="text-[10px] text-[--muted] mt-1 leading-snug">{item.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 18+ / NSFW Toggle - Solid & Always Visible */}
              <div className="flex items-center justify-between p-4 rounded-2xl border border-[--border] bg-[--surface-subtle]/60">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center font-black text-xs shrink-0">
                    18+
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[--foreground]">Mature / 18+ Content (NSFW)</h4>
                    <p className="text-[11px] text-[--muted]">Require viewers to confirm their age before viewing</p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isNsfw}
                  onClick={() => setIsNsfw(!isNsfw)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isNsfw ? 'bg-[--primary]' : 'bg-zinc-600/70 dark:bg-zinc-700'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      isNsfw ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Join Approval Toggle - Solid & Always Visible */}
              <div className="flex items-center justify-between p-4 rounded-2xl border border-[--border] bg-[--surface-subtle]/60">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[--primary]/10 text-[--primary] flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[--foreground]">Require Moderator Join Approval</h4>
                    <p className="text-[11px] text-[--muted]">Users request to join; moderators approve or reject</p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={requiresApproval}
                  onClick={() => setRequiresApproval(!requiresApproval)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    requiresApproval ? 'bg-[--primary]' : 'bg-zinc-600/70 dark:bg-zinc-700'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      requiresApproval ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Permissions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[--foreground] block mb-1.5">
                    Posting Permissions
                  </label>
                  <select
                    value={postingPermission}
                    onChange={(e) => setPostingPermission(e.target.value as typeof postingPermission)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[--border] bg-[--surface] text-xs font-semibold text-[--foreground] focus:outline-none focus:border-[--primary]"
                  >
                    <option value="anyone">Anyone in community</option>
                    <option value="approved_only">Approved contributors only</option>
                    <option value="mods_only">Moderators only</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[--foreground] block mb-1.5">
                    Comment Permissions
                  </label>
                  <select
                    value={commentPermission}
                    onChange={(e) => setCommentPermission(e.target.value as typeof commentPermission)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[--border] bg-[--surface] text-xs font-semibold text-[--foreground] focus:outline-none focus:border-[--primary]"
                  >
                    <option value="anyone">Anyone in community</option>
                    <option value="approved_only">Approved contributors only</option>
                    <option value="mods_only">Moderators only</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: RULES & WELCOME */}
          {step === 4 && (
            <div className="flex flex-col gap-5">
              {/* Rules builder */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <label className="text-xs font-semibold text-[--foreground] block">
                      Community Rules
                    </label>
                    <p className="text-[11px] text-[--muted]">Set clear rules for posts and comments</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleAddRule}
                    className="text-xs font-bold text-[--primary] flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Rule
                  </Button>
                </div>

                <div className="flex flex-col gap-2.5">
                  {rulesList.map((rule, idx) => (
                    <div
                      key={rule.id || idx}
                      className="p-3.5 rounded-2xl border border-[--border] bg-[--surface-subtle]/60 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="w-5 h-5 rounded-full bg-[--surface] text-xs font-bold text-[--muted] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          placeholder="Rule title (e.g., No self-promotion)"
                          value={rule.title}
                          onChange={(e) => handleRuleChange(idx, 'title', e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-xl border border-[--border] bg-[--surface] text-xs font-semibold text-[--foreground] focus:outline-none focus:border-[--primary]"
                        />
                        {rulesList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRule(idx)}
                            className="text-[--muted] hover:text-[--danger] transition-colors p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="Rule explanation (optional)"
                        value={rule.description}
                        onChange={(e) => handleRuleChange(idx, 'description', e.target.value)}
                        className="px-3 py-1.5 rounded-xl border border-[--border] bg-[--surface] text-xs text-[--muted] focus:outline-none focus:border-[--primary]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Guidelines */}
              <div>
                <Textarea
                  label="Community Guidelines / Code of Conduct"
                  placeholder="Extended guidelines or formatting tips for submissions..."
                  value={guidelines}
                  onChange={(e) => setGuidelines(e.target.value)}
                  maxLength={2000}
                />
              </div>

              {/* Welcome Message */}
              <div>
                <Textarea
                  label="Welcome Message for New Members"
                  placeholder="Greeting automatically displayed to users upon joining..."
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  maxLength={500}
                />
              </div>

              {/* Initial Announcement */}
              <div>
                <Input
                  label="Initial Community Announcement (Optional)"
                  placeholder="e.g. Welcome everyone to the launch of our new community!"
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  maxLength={300}
                />
              </div>
            </div>
          )}

          {/* Bottom Controls */}
          <div className="pt-4 border-t border-[--border] flex items-center justify-between">
            {step > 1 ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1.5 text-xs font-bold"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </Button>
            ) : (
              <Button type="button" variant="ghost" onClick={onClose} className="text-xs font-bold">
                Cancel
              </Button>
            )}

            {step < 4 ? (
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  if (step === 1 && (!name.trim() || !slug.trim())) {
                    setError('Please provide a community name and URL');
                    return;
                  }
                  setError('');
                  setStep(step + 1);
                }}
                className="flex items-center gap-1.5 text-xs font-bold"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="text-xs font-bold px-6 bg-gradient-to-r from-primary to-accent from-[--primary] to-[--accent] border-0 shadow-md shadow-[--primary]/20 text-white"
              >
                <Sparkles className="w-4 h-4 mr-1.5" />
                <span>Launch Community</span>
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
