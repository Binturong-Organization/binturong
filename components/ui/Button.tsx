import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const variants = {
      primary: 'bg-[--primary] hover:bg-[--primary-hover] text-white focus:ring-[--primary] shadow-sm',
      secondary: 'bg-[--secondary] hover:bg-[--secondary-hover] text-white focus:ring-[--secondary] shadow-sm',
      ghost: 'bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-[--foreground]',
      danger: 'bg-[--danger] hover:bg-red-600 text-white focus:ring-red-300',
      outline: 'border border-[--border] bg-[--surface] hover:bg-black/5 dark:hover:bg-white/5 text-[--foreground]',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-2.5 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
