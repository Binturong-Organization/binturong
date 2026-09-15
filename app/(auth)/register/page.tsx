'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

const schema = z
  .object({
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username must be at most 30 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers, and underscores only'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      setError('');
      await registerUser(data.username, data.email, data.password);
      router.push('/');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      if (e.response?.data?.error) {
        setError(e.response.data.error);
      } else if (e.message === 'Network Error' || !e.response) {
        setError('Cannot connect to backend server. Please verify your backend is running and reachable.');
      } else {
        setError(e.message || 'Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-140px)] relative py-6">
      {/* Background ambient decorative glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[--accent]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-[--surface]/90 backdrop-blur-2xl rounded-3xl border border-[--border] p-8 sm:p-10 shadow-xl shadow-[--primary]/5">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[--primary] to-[--accent] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[--primary]/25">
              <span className="text-white font-black text-2xl tracking-wider">B</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[--foreground] tracking-tight">
              Create your account
            </h1>
            <p className="text-xs text-[--muted] mt-1.5">
              Join communities and share your voice on Binturong
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
              label="Username"
              placeholder="binturong_explorer"
              error={errors.username?.message}
              {...register('username')}
            />

            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="At least 6 characters"
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              className="w-full py-3 mt-2 bg-gradient-to-r from-[--primary] to-[--accent] hover:brightness-105 border-0 shadow-md shadow-[--primary]/20 font-bold"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Footer switch */}
          <div className="mt-8 pt-6 border-t border-[--border] text-center">
            <p className="text-xs text-[--muted]">
              Already have an account?{' '}
              <Link href="/login" className="text-[--primary] font-bold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
