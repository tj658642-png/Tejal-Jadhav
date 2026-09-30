import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { supabase, supabaseConfigured } from '../lib/supabase';

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (!supabaseConfigured) {
        navigate('/dashboard');
        return;
      }
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(String(err));
    }
  }

  async function googleLogin() {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4">
      <Card className="w-full">
        <h1 className="text-xl font-semibold">Login</h1>
        {!supabaseConfigured && (
          <p className="mt-2 text-sm text-amber-300">Supabase not configured — continue in local demo mode.</p>
        )}
        <form className="mt-4 space-y-3" onSubmit={onSubmit}>
          <label className="block text-sm">
            Email
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required={supabaseConfigured}
            />
          </label>
          <label className="block text-sm">
            Password
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={supabaseConfigured}
            />
          </label>
          {error && <p className="text-sm text-rose-300" role="alert">{error}</p>}
          <Button type="submit" className="w-full">Login</Button>
        </form>
        {supabaseConfigured && (
          <Button type="button" variant="secondary" className="mt-3 w-full" onClick={googleLogin}>
            Continue with Google
          </Button>
        )}
        <p className="mt-4 text-sm text-slate-400">
          <Link to="/signup">Create an account</Link>
        </p>
      </Card>
    </div>
  );
}
