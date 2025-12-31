import React, { useState } from 'react';
import { useAuth } from '../useAuth';
import { fetchMe } from '../api/client';
import SessionList from '../components/SessionList';

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
    <div style={{ maxWidth: 720, margin: '2rem auto', padding: '1rem' }}>
      <h1>GRIMOIRE</h1>
      <p>Enchant your workflow. Authenticated session active.</p>
      <div style={{ padding: '0.75rem', border: '1px solid #ddd', borderRadius: 8, marginBottom: '1rem' }}>
        <p>
          Signed in as <strong>{user?.email}</strong> ({user?.role})
        </p>
        <button onClick={logout}>Logout</button>
      </div>
      <div>
        <button onClick={handleMe}>Check /api/auth/me</button>
        {status && <p style={{ marginTop: '0.5rem' }}>{status}</p>}
      </div>
      <SessionList />
    </div>
  );
};

export default HomePage;
