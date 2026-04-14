'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  mode: 'login' | 'signup';
};

export function AuthForm({ mode }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const response = await fetch(`/api/auth/${mode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? 'Something went wrong');
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">{mode === 'login' ? 'Welcome back' : 'Create account'}</h1>
      <p className="text-sm text-slate-600">Start payroll in less than 60 seconds.</p>
      <div className="space-y-1">
        <label className="text-sm">Email</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="space-y-1">
        <label className="text-sm">Password</label>
        <input type="password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        className="w-full rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        disabled={loading}
      >
        {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Sign up'}
      </button>
    </form>
  );
}
