import Link from 'next/link';
import { useState } from 'react';

export default function AppHome() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [stage, setStage] = useState<'signup' | 'verify'>('signup');

  async function handleSignup(event: React.FormEvent) {
    event.preventDefault();
    setMessage('');

    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: fullName,
        email,
        username,
        password,
        referral_code: referralCode || undefined,
      }),
    });

    const data = await response.json();
    if ('error' in data) {
      setMessage(data.error);
      return;
    }

    setStage('verify');
    setMessage('Signup successful. A verification email was sent to your inbox. Enter the token below to verify.');
  }

  async function handleVerify(event: React.FormEvent) {
    event.preventDefault();
    setMessage('');

    const response = await fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();
    if ('error' in data) {
      setMessage(data.error);
      return;
    }

    setMessage('Email verified! You can now log in at the login page.');
    setStage('signup');
    setToken('');
    setEmail('');
    setUsername('');
    setPassword('');
    setFullName('');
  }

  return (
    <main className="login-page">
      <div className="login-shell">
        <div className="login-card">
          <div className="login-brand">
            <Link href="/">
              <div className="login-logo" aria-label="Tether Link home">
                <img src="/tether-usdt-logo.svg" alt="Tether Link" />
              </div>
            </Link>
            <span>Tether Link</span>
          </div>

          <div className="login-heading">
            <h1>{stage === 'signup' ? 'Create your account' : 'Verify your email'}</h1>
          </div>

          {stage === 'signup' ? (
            <form className="login-form" onSubmit={handleSignup}>
              <label className="form-field">
                <span>Full name*</span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  required
                />
              </label>

              <label className="form-field">
                <span>Email*</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  autoComplete="email"
                  required
                />
              </label>

              <label className="form-field">
                <span>Username*</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  required
                />
              </label>

              <label className="form-field">
                <span>Password*</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  autoComplete="new-password"
                  required
                />
              </label>

              <label className="form-field">
                <span>Referral code (optional)</span>
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder="REF-XXXXXX"
                />
                <div className="form-note">
                  This referral code is locked at signup and remains permanently attached to your profile.
                </div>
              </label>

              <button type="submit" className="btn btn-primary login-submit">
                Create account
              </button>

              {message ? <p className="login-message">{message}</p> : null}

              <p className="login-footer">
                Already signed up?{' '}
                <Link href="/app/login" className="login-link-secondary">
                  Login
                </Link>
              </p>
            </form>
          ) : (
            <form className="login-form" onSubmit={handleVerify}>
              <label className="form-field">
                <span>Verification token</span>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Enter verification token"
                  required
                />
              </label>

              <button type="submit" className="btn btn-primary login-submit">
                Verify account
              </button>

              <button
                type="button"
                className="btn login-submit"
                style={{ background: '#f8fafc', color: '#0f172a', border: '1px solid rgba(15,23,42,0.12)' }}
                onClick={() => setStage('signup')}
              >
                Back to signup
              </button>

              {message ? <p className="login-message">{message}</p> : null}

              <p className="login-footer">
                Already signed up?{' '}
                <Link href="/app/login" className="login-link-secondary">
                  Login
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
