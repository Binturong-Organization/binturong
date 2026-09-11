import { cn } from '@/lib/utils';
import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-xs font-semibold text-[--foreground]">{label}</label>}
      <input
        ref={ref}
        className={cn(
          'w-full px-3.5 py-2.5 rounded-xl border border-[--border] bg-[--surface] text-[--foreground] placeholder-[--muted] text-sm',
          'focus:outline-none focus:border-[--primary] focus:ring-2 focus:ring-[--primary]/20 transition-all',
          error && 'border-[--danger] focus:ring-[--danger]/20 focus:border-[--danger]',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-[--danger]">{error}</p>}
    </div>
  )
);

Input.displayName = 'Input';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-xs font-semibold text-[--foreground]">{label}</label>}
      <textarea
        ref={ref}
        className={cn(
          'w-full px-3.5 py-2.5 rounded-xl border border-[--border] bg-[--surface] text-[--foreground] placeholder-[--muted] text-sm',
          'focus:outline-none focus:border-[--primary] focus:ring-2 focus:ring-[--primary]/20 transition-all resize-y min-h-[100px]',
          error && 'border-[--danger] focus:ring-[--danger]/20 focus:border-[--danger]',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-[--danger]">{error}</p>}
    </div>
  )
);

Textarea.displayName = 'Textarea';
