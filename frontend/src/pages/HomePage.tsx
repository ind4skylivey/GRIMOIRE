import React, { useState } from 'react';
import { useAuth } from '../useAuth';
import { fetchMe } from '../api/client';
import SessionList from '../components/SessionList';
import BoardList from '../components/BoardList';

const HomePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [status, setStatus] = useState<string | null>(null);

  const handleMe = async () => {
    try {
      const me = await fetchMe();
      setStatus(`Authenticated as ${me.email}`);
    } catch {
      setStatus('Unable to reach API (unauthorized?)');
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--text)]">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl text-primary">GRIMOIRE</h1>
            <p className="text-sm opacity-80">Enchant your workflow. Authenticated session active.</p>
          </div>
          <button onClick={logout} className="glow-button w-full md:w-auto">
            Logout
          </button>
        </div>

        <div className="card-surface p-4 space-y-2">
          <p>
            Signed in as <strong>{user?.email}</strong> ({user?.role})
          </p>
          <div className="flex gap-2 items-center">
            <button onClick={handleMe} className="glow-button">
              Check /api/auth/me
            </button>
            {status && <span className="text-xs opacity-80">{status}</span>}
          </div>
        </div>

        <SessionList />
        <BoardList />
      </div>
    </div>
  );
};

export default HomePage;
