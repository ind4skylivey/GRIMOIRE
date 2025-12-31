import React, { useEffect, useState } from 'react';
import { client, logout, getErrorMessage } from '../api/client';
import ErrorBanner from './ErrorBanner';

type Session = {
  tokenId: string;
  expiresAt: string;
  revokedAt?: string | null;
};

const SessionList: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await client.get<{ sessions: Session[] }>('/api/v1/auth/sessions');
      setSessions(res.data.sessions);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchSessions();
  }, []);

  const handleLogoutAll = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await client.post('/api/v1/auth/logout-all');
      await logout();
      setSuccess('All sessions revoked. Please sign in again.');
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: '1rem', border: '1px solid #ddd', padding: '1rem', borderRadius: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Sessions</h3>
        <button onClick={handleLogoutAll} disabled={loading}>
          Logout all
        </button>
      </div>
      <ErrorBanner message={error} />
      {success && <p style={{ color: 'green' }}>{success}</p>}
      {loading && <p>Loading…</p>}
      <ul>
        {sessions.map((s) => (
          <li key={s.tokenId}>
            <code>{s.tokenId}</code> — expires {new Date(s.expiresAt).toLocaleString()}
            {s.revokedAt && ' (revoked)'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SessionList;
