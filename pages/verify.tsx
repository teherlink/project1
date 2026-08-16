import { useState } from 'react';

export default function VerifyPage() {
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');

  async function handleVerify(event: React.FormEvent) {
    event.preventDefault();
    setMessage('');

    const response = await fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();
    setMessage(data.error || data.message || 'Verified successfully');
  }

  return (
    <main style={{ maxWidth: 520, margin: '0 auto', padding: '2rem' }}>
      <h1>Verify Email</h1>
      <form onSubmit={handleVerify} style={{ display: 'grid', gap: '1rem' }}>
        <label>
          Verification token
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />
        </label>
        <button type="submit">Verify email</button>
      </form>
      {message && <p>{message}</p>}
    </main>
  );
}
