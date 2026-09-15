'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Lock, Mail } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    const isRemembered = localStorage.getItem('binturong_remember') === 'true';
    if (isRemembered) {
      setRememberMe(true);
      const savedEmail = localStorage.getItem('binturong_remember_email');
      const savedPassword = localStorage.getItem('binturong_remember_password');
      if (savedEmail) setValue('email', savedEmail);
      if (savedPassword) setValue('password', savedPassword);
    }
  }, [setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      setError('');
      if (rememberMe) {
        localStorage.setItem('binturong_remember', 'true');
        localStorage.setItem('binturong_remember_email', data.email);
        localStorage.setItem('binturong_remember_password', data.password);
      } else {
        localStorage.removeItem('binturong_remember');
        localStorage.removeItem('binturong_remember_email');
        localStorage.removeItem('binturong_remember_password');
      }
      await login(data.email, data.password);
      router.push('/');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      if (e.response?.data?.error) {
        setError(e.response.data.error);
      } else if (e.message === 'Network Error' || !e.response) {
        setError('Cannot connect to backend server. Please verify your backend is running and reachable.');
      } else {
        setError(e.message || 'Invalid email or password');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-140px)] relative py-6">
      {/* Background ambient decorative glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[--primary]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-[--surface]/90 backdrop-blur-2xl rounded-3xl border border-[--border] p-8 sm:p-10 shadow-xl shadow-[--primary]/5">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-accent from-[--primary] to-[--accent] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[--primary]/25">
              <span className="text-white font-black text-2xl tracking-wider">B</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[--foreground] tracking-tight">
              Welcome back
            </h1>
            <p className="text-xs text-[--muted] mt-1.5">
              Sign in to participate in discussions and vote
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-[--danger] rounded-2xl px-4 py-3 text-xs font-semibold">
                {error}
              </div>
            )}

            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <div>
              <Input
                label="Password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
              />
              <div className="flex items-center justify-between mt-2.5">
                <label className="flex items-center gap-2 cursor-pointer select-none text-[--muted] hover:text-[--foreground] transition-colors">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border border-[--border] text-[--primary] focus:ring-1 focus:ring-[--primary] accent-[--primary] cursor-pointer"
                  />
                  <span className="text-[11px] font-medium">Remember password</span>
                </label>
                <Link href="/forgot-password" className="text-[11px] font-semibold text-[--primary] hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              className="w-full py-3 mt-2 bg-gradient-to-r from-primary to-accent from-[--primary] to-[--accent] hover:brightness-105 border-0 shadow-md shadow-[--primary]/20 font-bold text-white"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Footer switch */}
          <div className="mt-8 pt-6 border-t border-[--border] text-center">
            <p className="text-xs text-[--muted]">
              New to Binturong?{' '}
              <Link href="/register" className="text-[--primary] font-bold hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
