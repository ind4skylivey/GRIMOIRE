import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../useAuth';
import ErrorBanner from '../components/ErrorBanner';
import { getErrorMessage } from '../api/client';

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
    <div style={{ maxWidth: 360, margin: '4rem auto', padding: '1.5rem', border: '1px solid #ccc', borderRadius: 8 }}>
      <h1 style={{ marginBottom: '1rem' }}>{mode === 'login' ? 'Sign in' : 'Create account'}</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '0.75rem' }}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            required
          />
        </div>
        <div style={{ marginBottom: '0.75rem' }}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
            required
          />
        </div>
        <ErrorBanner message={error} />
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}>
          {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Register'}
        </button>
      </form>
      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        {mode === 'login' ? (
          <button type="button" onClick={() => setMode('register')}>
            Need an account? Register
          </button>
        ) : (
          <button type="button" onClick={() => setMode('login')}>
            Have an account? Sign in
          </button>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
