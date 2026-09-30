import { Link, NavLink } from 'react-router-dom';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export function Navbar() {
  const { user, signOut, isDemoAuth } = useAuth();
  const { theme, toggle } = useTheme();
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm ${isActive ? 'text-violet-300' : 'text-slate-300 hover:text-white'}`;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="font-semibold tracking-tight">
          <span className="text-violet-400">AI</span> COUNCIL
        </Link>
        <nav className="hidden items-center gap-5 md:flex" aria-label="Main">
          {user && (
            <>
              <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
              <NavLink to="/analyze" className={linkClass}>Analyze</NavLink>
              <NavLink to="/history" className={linkClass}>History</NavLink>
              <NavLink to="/models" className={linkClass}>Models</NavLink>
            </>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {isDemoAuth && <span className="hidden text-xs text-amber-300 sm:inline">Local demo auth</span>}
          <Button type="button" variant="ghost" onClick={toggle} aria-label="Toggle theme">
            {theme === 'dark' ? 'Light' : 'Dark'}
          </Button>
          {user ? (
            <>
              <NavLink to="/profile" className={linkClass}>Profile</NavLink>
              <Button type="button" variant="secondary" onClick={() => signOut()}>Logout</Button>
            </>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost">Login</Button></Link>
              <Link to="/signup"><Button>Sign up</Button></Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
