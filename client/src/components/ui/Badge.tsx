import { cn } from '../../lib/cn';

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn('inline-flex rounded-full bg-violet-500/20 px-2.5 py-0.5 text-xs font-medium text-violet-200', className)}
      {...props}
    />
  );
}
