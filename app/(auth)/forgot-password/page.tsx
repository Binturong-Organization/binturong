'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-140px)]">
      <div className="w-full max-w-sm">
        <div className="bg-[--surface] rounded-3xl border border-[--border] p-8 shadow-sm">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-[--foreground]">Reset your password</h1>
            <p className="text-xs text-[--muted] mt-1">
              Enter your email and we will send you a reset link.
            </p>
          </div>

          {submitted ? (
            <div className="text-center">
              <div className="p-4 rounded-2xl bg-[--primary]/10 text-[--primary] text-xs leading-relaxed mb-6 font-medium">
                If an account with that email exists, a password reset link has been dispatched!
              </div>
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Return to login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-[--danger] rounded-xl px-3.5 py-2.5 text-xs">
                  {error}
                </div>
              )}
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" variant="primary" loading={loading} className="w-full">
                Send Reset Link
              </Button>
              <div className="text-center mt-2">
                <Link href="/login" className="text-xs text-[--muted] hover:text-[--foreground]">
                  Remember your password? Log in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
