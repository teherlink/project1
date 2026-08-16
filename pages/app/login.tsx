import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1] || ''));
      if (payload?.exp && payload.exp * 1000 > Date.now()) {
        window.location.href = '/app/profile';
      }
    } catch (error) {
      localStorage.removeItem('authToken');
    }
  }, []);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setMessage('');

    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if ('error' in data) {
      setMessage(data.error);
      return;
    }

    if (data.token) {
      localStorage.setItem('authToken', data.token);
      window.location.href = '/app/profile';
      return;
    }

    setMessage('Login successful. Token received.');
  }

  return (
    <main className="login-page">
      <div className="login-shell">
        <div className="login-card">
          <div className="login-brand">
            <Link href="/">
              <div>
                <img src="/tether-usdt-logo.svg" alt="Tether Link" />
              </div>
            </Link>
          </div>

          <div className="login-heading">
            <h1>Log in to your account</h1>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            <label className="form-field">
              <span>Email or Username*</span>
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
              <span>Password*</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                autoComplete="current-password"
                required
              />
            </label>

            <div className="login-help-row">
              <Link href="/app/password-reset-request" className="login-help-link">
                Forgot your password?
              </Link>
            </div>

            <button type="submit" className="btn btn-primary login-submit">
              Log in
            </button>

            {message ? <p className="login-message">{message}</p> : null}
          </form>

          <p className="login-footer">
            Don&apos;t have an account?{' '}
            <Link href="/app" className="login-link-secondary">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
