'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Plus, Bell, Moon, Sun, User, LogOut, Compass, Sparkles, Flame, Shield, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { formatKarma } from '@/lib/utils';
import { CreateCommunityModal } from '@/components/community/CreateCommunityModal';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [createCommunityOpen, setCreateCommunityOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[--surface]/85 backdrop-blur-xl border-b border-[--border] shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Tag */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-accent from-[--primary] to-[--accent] flex items-center justify-center shadow-md shadow-[--primary]/20 group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-lg tracking-wider">B</span>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[--secondary] rounded-full border-2 border-[--surface] flex items-center justify-center" />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-[--foreground] group-hover:text-[--primary] transition-colors leading-none">
                Binturong
              </span>
              <span className="text-[10px] font-semibold text-[--muted] tracking-wide uppercase mt-1">
                Community Hub
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
            <Link
              href="/"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                pathname === '/'
                  ? 'bg-[--primary-light] text-[--primary]'
                  : 'text-[--muted] hover:text-[--foreground] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Flame className="w-4 h-4" />
              <span>Feed</span>
            </Link>
            <Link
              href="/r"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                pathname.startsWith('/r')
                  ? 'bg-[--primary-light] text-[--primary]'
                  : 'text-[--muted] hover:text-[--foreground] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Explore</span>
            </Link>
          </nav>
        </div>

        {/* Global Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-2">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[--muted] group-focus-within:text-[--primary] transition-colors" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts, topics, or communities..."
              className="w-full pl-10 pr-12 py-2 rounded-2xl border border-[--border] bg-[--surface-subtle] text-xs sm:text-sm text-[--foreground] placeholder-[--muted] focus:outline-none focus:ring-2 focus:ring-[--primary]/30 focus:border-[--primary] focus:bg-[--surface] transition-all shadow-inner"
            />
            <kbd className="hidden sm:inline-flex absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-[--border] text-[--muted]">
              /
            </kbd>
          </div>
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isAuthenticated ? (
            <>
              <Link href="/submit" className="hidden sm:inline-block">
                <Button
                  variant="primary"
                  size="sm"
                  className="gap-1.5 shadow-md shadow-[--primary]/20 bg-gradient-to-r from-primary to-accent from-[--primary] to-[--accent] hover:brightness-105 border-0 text-white"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create</span>
                </Button>
              </Link>

              <Link
                href="/notifications"
                className="relative p-2.5 rounded-2xl text-[--muted] hover:text-[--foreground] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
              </Link>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2 rounded-2xl border border-[--border] hover:border-[--primary]/50 hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
                >
                  <Avatar src={user?.avatar_url} username={user?.username || ''} size={28} />
                  <div className="hidden lg:flex flex-col text-left pr-1">
                    <span className="text-xs font-bold text-[--foreground] leading-tight max-w-[100px] truncate">
                      u/{user?.username}
                    </span>
                    <span className="text-[10px] font-semibold text-[--primary] leading-none">
                      {formatKarma(user?.karma || 0)} karma
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[--muted]" />
                </button>

                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                    <div
                      className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-[#151D19] rounded-2xl border border-[--border] shadow-2xl shadow-black/50 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
                      style={{ backgroundColor: 'var(--surface)' }}
                    >
                      <div
                        className="px-4 py-3 border-b border-[--border]"
                        style={{ backgroundColor: 'var(--surface-subtle)' }}
                      >
                        <p className="text-xs font-bold text-[--foreground] truncate">
                          u/{user?.username}
                        </p>
                        <p className="text-[11px] text-[--muted] truncate mt-0.5">{user?.email}</p>
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[--primary-light] text-[--primary] text-[11px] font-bold">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{formatKarma(user?.karma || 0)} Reputation</span>
                        </div>
                      </div>

                      <div className="py-1 flex flex-col">
                        <Link
                          href={`/user/${user?.username}`}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-[--foreground] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                          onClick={() => setMenuOpen(false)}
                        >
                          <User className="w-4 h-4 text-[--muted]" /> Profile
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpen(false);
                            setCreateCommunityOpen(true);
                          }}
                          className="flex w-full items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-[--foreground] hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-left cursor-pointer"
                        >
                          <Compass className="w-4 h-4 text-[--primary]" /> Create Community
                        </button>
                        <Link
                          href="/settings"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-[--foreground] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                          onClick={() => setMenuOpen(false)}
                        >
                          <Shield className="w-4 h-4 text-[--muted]" /> Settings
                        </Link>
                      </div>

                      <div className="border-t border-[--border] pt-1 px-1">
                        <button
                          onClick={() => {
                            logout();
                            setMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[--danger] hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" /> Log out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  variant="primary"
                  size="sm"
                  className="bg-gradient-to-r from-primary to-accent from-[--primary] to-[--accent] hover:brightness-105 border-0 shadow-md shadow-[--primary]/20 text-white"
                >
                  Join Binturong
                </Button>
              </Link>
            </div>
          )}

          {/* Dark Mode Switcher */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2.5 rounded-2xl text-[--muted] hover:text-[--foreground] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            {mounted ? (
              theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[--secondary]" />
              ) : (
                <Moon className="w-4 h-4 text-[--primary]" />
              )
            ) : (
              <span className="w-4 h-4 block" />
            )}
          </button>
        </div>
      </div>

      <CreateCommunityModal
        isOpen={createCommunityOpen}
        onClose={() => setCreateCommunityOpen(false)}
      />
    </header>
  );
}
