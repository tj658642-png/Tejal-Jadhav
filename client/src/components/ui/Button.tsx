import { cn } from '../../lib/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400 disabled:opacity-50',
        variant === 'primary' && 'bg-violet-600 text-white hover:bg-violet-500',
        variant === 'secondary' && 'glass text-slate-100 hover:bg-white/10',
        variant === 'ghost' && 'text-slate-300 hover:bg-white/5',
        className,
      )}
      {...props}
    />
  );
}
