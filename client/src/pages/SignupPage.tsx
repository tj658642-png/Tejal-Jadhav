import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { supabaseConfigured } from '../lib/supabase';

export function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
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
      await signUp(email, password, fullName);
      navigate('/dashboard');
    } catch (err) {
      setError(String(err));
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4">
      <Card className="w-full">
        <h1 className="text-xl font-semibold">Sign up</h1>
        <form className="mt-4 space-y-3" onSubmit={onSubmit}>
          <label className="block text-sm">
            Full name
            <input className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </label>
          <label className="block text-sm">
            Email
            <input className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required={supabaseConfigured} />
          </label>
          <label className="block text-sm">
            Password
            <input className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required={supabaseConfigured} />
          </label>
          {error && <p className="text-sm text-rose-300">{error}</p>}
          <Button type="submit" className="w-full">Create account</Button>
        </form>
        <p className="mt-4 text-sm text-slate-400"><Link to="/login">Already have an account?</Link></p>
      </Card>
    </div>
  );
}
