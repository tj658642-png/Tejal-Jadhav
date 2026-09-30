import { cn } from '../../lib/cn';

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('glass rounded-2xl p-5 shadow-lg shadow-black/20', className)} {...props} />;
}
