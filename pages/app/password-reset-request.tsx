import { useState } from 'react';

export default function PasswordResetRequestPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRequest(event: React.FormEvent) {
    event.preventDefault();
    setMessage('');
    if (!email) {
      setMessage('Email is required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/password-reset-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || 'Unable to request password reset.');
      } else {
        setMessage(data.message || 'If that email exists, a reset link has been sent.');
      }
    } catch (error) {
      console.error(error);
      setMessage('Unable to request password reset.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 520, margin: '0 auto', padding: '2rem' }}>
      <h1>Forgot password</h1>
      <form onSubmit={handleRequest} style={{ display: 'grid', gap: '1rem' }}>
        <label style={{ display: 'grid', gap: 8 }}>
          Email address
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            required
          />
        </label>

        <button type="submit" disabled={loading} style={{ padding: '12px 16px', borderRadius: 10, background: '#0ea5a4', color: '#fff', border: 'none', cursor: 'pointer' }}>
          {loading ? 'Requesting…' : 'Send reset link'}
        </button>
      </form>
      {message ? <p style={{ marginTop: 16, color: '#374151' }}>{message}</p> : null}
    </main>
  );
}
