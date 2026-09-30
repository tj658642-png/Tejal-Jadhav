import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/cn';

const items = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/analyze', label: 'Analyze' },
  { to: '/history', label: 'History' },
  { to: '/models', label: 'Models' },
  { to: '/settings', label: 'Settings' },
];

export function Sidebar() {
  return (
    <aside className="hidden w-56 shrink-0 lg:block">
      <nav className="glass sticky top-20 space-y-1 rounded-2xl p-3" aria-label="Sidebar">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'block rounded-xl px-3 py-2 text-sm transition',
                isActive ? 'bg-violet-600/30 text-violet-100' : 'text-slate-300 hover:bg-white/5',
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
