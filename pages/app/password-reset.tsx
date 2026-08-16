import { useState } from 'react';
import { useRouter } from 'next/router';

export default function PasswordResetPage() {
  const router = useRouter();
  const { token: queryToken } = router.query;
  const [token, setToken] = useState(typeof queryToken === 'string' ? queryToken : '');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleReset(event: React.FormEvent) {
    event.preventDefault();
    setMessage('');
    if (!token) {
      setMessage('Reset token is required.');
      return;
    }
    if (password.length < 8) {
      setMessage('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || 'Unable to reset password.');
        return;
      }
      setMessage(data.message || 'Password reset successful. Redirecting to login...');
      setPassword('');
      setTimeout(() => {
        router.push('/app/login');
      }, 1600);
    } catch (error) {
      console.error(error);
      setMessage('Unable to reset password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 520, margin: '0 auto', padding: '2rem' }}>
      <h1>Reset Password</h1>
      <form onSubmit={handleReset} style={{ display: 'grid', gap: '1rem' }}>
        <label style={{ display: 'grid', gap: 8 }}>
          Reset token
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter reset token"
            required
          />
        </label>

        <label style={{ display: 'grid', gap: 8 }}>
          New password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            required
          />
        </label>

        <button type="submit" disabled={loading} style={{ padding: '12px 16px', borderRadius: 10, background: '#0ea5a4', color: '#fff', border: 'none', cursor: 'pointer' }}>
          {loading ? 'Resetting…' : 'Reset password'}
        </button>
      </form>
      {message ? <p style={{ marginTop: 16, color: '#374151' }}>{message}</p> : null}
    </main>
  );
}
