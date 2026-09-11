'use client';
import { useState, useEffect } from 'react';
import {
  X,
  Shield,
  Palette,
  Users,
  UserCheck,
  UserX,
  Check,
  Upload,
  AlertTriangle,
  Plus,
  Trash2,
  Megaphone,
  BookOpen,
  Lock,
  Globe,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import api from '@/lib/api';

interface MemberItem {
  id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  karma: number;
  role: string;
  joined_at: string;
}

interface JoinRequestItem {
  id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  karma: number;
  message?: string;
  created_at: string;
}

interface RuleItem {
  id: string;
  title: string;
  description: string;
}

interface CommunitySettingsModalProps {
  slug: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

export function CommunitySettingsModal({ slug, isOpen, onClose, onUpdated }: CommunitySettingsModalProps) {
  const [tab, setTab] = useState<'general' | 'governance' | 'rules' | 'members' | 'requests'>('general');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [themeColor, setThemeColor] = useState('#6366f1');
  const [announcement, setAnnouncement] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'restricted' | 'private'>('public');
  const [isNsfw, setIsNsfw] = useState(false);
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [postingPermission, setPostingPermission] = useState('anyone');
  const [commentPermission, setCommentPermission] = useState('anyone');
  const [guidelines, setGuidelines] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [rulesList, setRulesList] = useState<RuleItem[]>([]);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  // Members & Requests
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [requests, setRequests] = useState<JoinRequestItem[]>([]);

  useEffect(() => {
    if (!isOpen || !slug) return;
    loadCommunityData();
  }, [isOpen, slug]);

  const loadCommunityData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/communities/${slug}`);
      const c = res.data.data;
      setDescription(c.description || '');
      setCategory(c.category || 'General');
      setThemeColor(c.theme_color || '#6366f1');
      setAnnouncement(c.announcement || '');
      setVisibility(c.visibility || 'public');
      setIsNsfw(Boolean(c.is_nsfw));
      setRequiresApproval(Boolean(c.requires_approval));
      setPostingPermission(c.posting_permission || 'anyone');
      setCommentPermission(c.comment_permission || 'anyone');
      setGuidelines(c.guidelines || '');
      setWelcomeMessage(c.welcome_message || '');

      if (Array.isArray(c.rules_json)) {
        setRulesList(c.rules_json);
      } else if (typeof c.rules_json === 'string') {
        try {
          setRulesList(JSON.parse(c.rules_json));
        } catch {
          setRulesList([]);
        }
      }

      // Load members & requests
      loadMembers();
      loadRequests();
    } catch (err) {
      setError('Failed to load community settings');
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    try {
      const res = await api.get(`/communities/${slug}/members`);
      setMembers(res.data.data.members || []);
    } catch {}
  };

  const loadRequests = async () => {
    try {
      const res = await api.get(`/communities/${slug}/join-requests`);
      setRequests(res.data.data.requests || []);
    } catch {}
  };

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('description', description);
      formData.append('category', category);
      formData.append('theme_color', themeColor);
      formData.append('announcement', announcement);
      formData.append('visibility', visibility);
      formData.append('is_nsfw', String(isNsfw));
      formData.append('requires_approval', String(requiresApproval));
      formData.append('posting_permission', postingPermission);
      formData.append('comment_permission', commentPermission);
      formData.append('guidelines', guidelines);
      formData.append('welcome_message', welcomeMessage);

      const validRules = rulesList.filter((r) => r.title.trim().length > 0);
      formData.append('rules_json', JSON.stringify(validRules));
      formData.append('rules', validRules.map((r, i) => `${i + 1}. ${r.title}: ${r.description}`).join('\n'));

      if (iconFile) formData.append('icon', iconFile);
      if (bannerFile) formData.append('banner', bannerFile);

      await api.patch(`/communities/${slug}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess('Settings saved successfully!');
      onUpdated?.();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.patch(`/communities/${slug}/members/${userId}/role`, { role: newRole });
      loadMembers();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      alert(e.response?.data?.error || 'Failed to update member role');
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      await api.post(`/communities/${slug}/join-requests/${requestId}/approve`);
      loadRequests();
      loadMembers();
      onUpdated?.();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      alert(e.response?.data?.error || 'Failed to approve request');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await api.post(`/communities/${slug}/join-requests/${requestId}/reject`);
      loadRequests();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      alert(e.response?.data?.error || 'Failed to reject request');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[--surface] border border-[--border] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-auto animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-[--border]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[--primary]/10 text-[--primary] flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[--foreground]">Mod Tools &amp; Settings</h2>
              <p className="text-xs text-[--muted]">b/{slug} &bull; Manage community configuration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-[--border] hover:bg-[--surface-subtle] flex items-center justify-center text-[--muted] hover:text-[--foreground] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[--border] overflow-x-auto text-xs font-bold">
          {[
            { id: 'general', label: 'General' },
            { id: 'governance', label: 'Governance' },
            { id: 'rules', label: 'Rules & Guidelines' },
            { id: 'members', label: `Members (${members.length})` },
            { id: 'requests', label: `Join Requests (${requests.length})` },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id as typeof tab)}
              className={`px-4 py-3 border-b-2 whitespace-nowrap transition-colors ${
                tab === t.id
                  ? 'border-[--primary] text-[--primary] bg-[--primary]/5'
                  : 'border-transparent text-[--muted] hover:text-[--foreground]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/20 text-[--danger] text-xs font-semibold rounded-2xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mx-6 mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold rounded-2xl flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <div className="p-6 max-h-[65vh] overflow-y-auto">
          {/* TAB 1: GENERAL */}
          {tab === 'general' && (
            <form onSubmit={handleSaveGeneral} className="flex flex-col gap-5">
              <Textarea
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1000}
              />

              <div>
                <label className="text-xs font-semibold text-[--foreground] block mb-1.5">
                  Category
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[--border] bg-[--surface] text-sm text-[--foreground] focus:outline-none focus:border-[--primary]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[--foreground] block mb-1.5">
                  Community Announcement
                </label>
                <input
                  type="text"
                  placeholder="Announcement pinned at the top of the community page..."
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[--border] bg-[--surface] text-sm text-[--foreground] focus:outline-none focus:border-[--primary]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[--foreground] block mb-1.5">
                  Theme Accent Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="w-9 h-9 rounded-xl cursor-pointer border border-[--border] p-0.5 bg-transparent"
                  />
                  <span className="text-xs font-mono text-[--muted]">{themeColor}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[--foreground] block mb-1">
                    Update Icon
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setIconFile(e.target.files?.[0] || null)}
                    className="text-xs text-[--muted] file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[--primary-light] file:text-[--primary]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[--foreground] block mb-1">
                    Update Banner
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                    className="text-xs text-[--muted] file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[--primary-light] file:text-[--primary]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[--border] flex justify-end">
                <Button type="submit" variant="primary" loading={saving} className="text-xs font-bold px-6">
                  Save Changes
                </Button>
              </div>
            </form>
          )}

          {/* TAB 2: GOVERNANCE & SAFETY */}
          {tab === 'governance' && (
            <form onSubmit={handleSaveGeneral} className="flex flex-col gap-5">
              <div>
                <label className="text-xs font-semibold text-[--foreground] block mb-1.5">
                  Visibility
                </label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as typeof visibility)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[--border] bg-[--surface] text-xs font-semibold text-[--foreground] focus:outline-none focus:border-[--primary]"
                >
                  <option value="public">Public (Anyone can view &amp; participate)</option>
                  <option value="restricted">Restricted (Anyone can view, only approved members post)</option>
                  <option value="private">Private (Only approved members can access)</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl border border-[--border] bg-[--surface-subtle]/50">
                <div>
                  <h4 className="text-xs font-bold text-[--foreground]">18+ / NSFW Community</h4>
                  <p className="text-[11px] text-[--muted]">Flag content as mature</p>
                </div>
                <input
                  type="checkbox"
                  checked={isNsfw}
                  onChange={(e) => setIsNsfw(e.target.checked)}
                  className="w-4 h-4 accent-[--primary]"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl border border-[--border] bg-[--surface-subtle]/50">
                <div>
                  <h4 className="text-xs font-bold text-[--foreground]">Require Join Approval</h4>
                  <p className="text-[11px] text-[--muted]">New members must be approved by a moderator</p>
                </div>
                <input
                  type="checkbox"
                  checked={requiresApproval}
                  onChange={(e) => setRequiresApproval(e.target.checked)}
                  className="w-4 h-4 accent-[--primary]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[--foreground] block mb-1">
                    Posting Permissions
                  </label>
                  <select
                    value={postingPermission}
                    onChange={(e) => setPostingPermission(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[--border] bg-[--surface] text-xs font-semibold text-[--foreground] focus:outline-none focus:border-[--primary]"
                  >
                    <option value="anyone">Anyone in community</option>
                    <option value="approved_only">Approved contributors only</option>
                    <option value="mods_only">Moderators only</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[--foreground] block mb-1">
                    Comment Permissions
                  </label>
                  <select
                    value={commentPermission}
                    onChange={(e) => setCommentPermission(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[--border] bg-[--surface] text-xs font-semibold text-[--foreground] focus:outline-none focus:border-[--primary]"
                  >
                    <option value="anyone">Anyone in community</option>
                    <option value="approved_only">Approved contributors only</option>
                    <option value="mods_only">Moderators only</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-[--border] flex justify-end">
                <Button type="submit" variant="primary" loading={saving} className="text-xs font-bold px-6">
                  Save Permissions
                </Button>
              </div>
            </form>
          )}

          {/* TAB 3: RULES & GUIDELINES */}
          {tab === 'rules' && (
            <form onSubmit={handleSaveGeneral} className="flex flex-col gap-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-[--foreground]">
                    Community Rules
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() =>
                      setRulesList([
                        ...rulesList,
                        { id: Date.now().toString(), title: '', description: '' },
                      ])
                    }
                    className="text-xs font-bold text-[--primary] flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Rule
                  </Button>
                </div>

                <div className="flex flex-col gap-2.5">
                  {rulesList.map((rule, idx) => (
                    <div
                      key={rule.id || idx}
                      className="p-3 rounded-xl border border-[--border] bg-[--surface-subtle]/50 flex flex-col gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[--surface] text-xs font-bold text-[--muted] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          placeholder="Rule title"
                          value={rule.title}
                          onChange={(e) => {
                            const updated = [...rulesList];
                            updated[idx].title = e.target.value;
                            setRulesList(updated);
                          }}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-[--border] bg-[--surface] text-xs font-semibold text-[--foreground] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setRulesList(rulesList.filter((_, i) => i !== idx))}
                          className="text-[--muted] hover:text-[--danger] p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Rule details..."
                        value={rule.description}
                        onChange={(e) => {
                          const updated = [...rulesList];
                          updated[idx].description = e.target.value;
                          setRulesList(updated);
                        }}
                        className="px-3 py-1 rounded-lg border border-[--border] bg-[--surface] text-xs text-[--muted] focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Textarea
                label="Guidelines / Code of Conduct"
                value={guidelines}
                onChange={(e) => setGuidelines(e.target.value)}
                maxLength={2000}
              />

              <Textarea
                label="Welcome Message"
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                maxLength={500}
              />

              <div className="pt-3 border-t border-[--border] flex justify-end">
                <Button type="submit" variant="primary" loading={saving} className="text-xs font-bold px-6">
                  Save Rules
                </Button>
              </div>
            </form>
          )}

          {/* TAB 4: MEMBERS & ROLES */}
          {tab === 'members' && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-[--muted] mb-2">
                Manage roles and permissions for community members.
              </p>
              <div className="divide-y divide-[--border] border border-[--border] rounded-2xl overflow-hidden">
                {members.map((m) => (
                  <div key={m.user_id} className="p-3 flex items-center justify-between bg-[--surface]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[--surface-subtle] border border-[--border] flex items-center justify-center font-bold text-xs">
                        {m.avatar_url ? (
                          <img src={m.avatar_url} alt={m.username} className="w-full h-full rounded-xl object-cover" />
                        ) : (
                          m.username[0]?.toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[--foreground]">u/{m.username}</div>
                        <div className="text-[10px] text-[--muted]">
                          Joined {new Date(m.joined_at).toLocaleDateString()} &bull; {m.karma} karma
                        </div>
                      </div>
                    </div>

                    <div>
                      {m.role === 'creator' ? (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-500 font-bold text-xs">
                          Creator
                        </span>
                      ) : (
                        <select
                          value={m.role}
                          onChange={(e) => handleRoleChange(m.user_id, e.target.value)}
                          className="px-2.5 py-1 rounded-lg border border-[--border] bg-[--surface-subtle] text-xs font-semibold text-[--foreground] focus:outline-none"
                        >
                          <option value="member">Member</option>
                          <option value="contributor">Contributor</option>
                          <option value="moderator">Moderator</option>
                        </select>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: JOIN REQUESTS */}
          {tab === 'requests' && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-[--muted] mb-2">
                Review users requesting to join this restricted or private community.
              </p>
              {requests.length === 0 ? (
                <div className="text-center py-8 text-xs text-[--muted]">
                  No pending join requests at this time.
                </div>
              ) : (
                <div className="divide-y divide-[--border] border border-[--border] rounded-2xl overflow-hidden">
                  {requests.map((req) => (
                    <div key={req.id} className="p-3.5 flex items-center justify-between bg-[--surface]">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[--surface-subtle] border border-[--border] flex items-center justify-center font-bold text-xs">
                          {req.username[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[--foreground]">u/{req.username}</div>
                          <div className="text-[10px] text-[--muted]">
                            Requested {new Date(req.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => handleRejectRequest(req.id)}
                          className="text-xs font-bold text-[--danger] hover:bg-red-500/10"
                        >
                          <UserX className="w-3.5 h-3.5 mr-1" />
                          Reject
                        </Button>
                        <Button
                          variant="primary"
                          onClick={() => handleApproveRequest(req.id)}
                          className="text-xs font-bold"
                        >
                          <UserCheck className="w-3.5 h-3.5 mr-1" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
