import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../useAuth';
import ErrorBanner from '../components/ErrorBanner';
import { getErrorMessage } from '../api/client';
import clsx from 'clsx';

const LoginPage: React.FC = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password);
      }
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--bg)] flex items-center justify-center px-4">
      <div className="card-surface max-w-md w-full p-6">
        <h1 className="font-display text-2xl text-primary mb-3 text-center">
          {mode === 'login' ? 'Sign in to your Grimoire' : 'Create your Grimoire'}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-surface border border-primary/30 px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-surface border border-primary/30 px-3 py-2"
              required
            />
          </div>
          <ErrorBanner message={error} />
          <button
            type="submit"
            disabled={loading}
            className={clsx('glow-button w-full', loading && 'opacity-80')}
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Register'}
          </button>
        </form>
        <div className="mt-4 text-center">
          {mode === 'login' ? (
            <button type="button" onClick={() => setMode('register')} className="text-primary">
              Need an account? Register
            </button>
          ) : (
            <button type="button" onClick={() => setMode('login')} className="text-primary">
              Have an account? Sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
