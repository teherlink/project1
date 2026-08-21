import Link from 'next/link';
import { useEffect, useState } from 'react';
import { requestJson } from '../../lib/client-api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    setIsSubmitting(true);
    try {
      const data = await requestJson<{ token?: string }>('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (data.token) {
        localStorage.setItem('authToken', data.token);
        window.location.href = '/app/profile';
        return;
      }

      setMessage('Login could not be completed. Please try again.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to log in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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

            <button type="submit" className="btn btn-primary login-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Log in'}
            </button>

            {message ? <p className="login-message error" role="alert">{message}</p> : null}
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
