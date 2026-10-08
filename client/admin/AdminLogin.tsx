// Admin sign-in (design: admin/login.html): portrait on the left, a short form on the right.
// It lives outside the admin shell, so it brings its own .admin-app scope and stylesheet.
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Icon } from './ui/icons';
import '../styles/admin.css';
import { usePageMeta } from '../hooks/usePageMeta';

const EMAIL = /^\S+@\S+\.\S+$/;

function Art() {
  return (
    <div className="art" aria-hidden="true">
      <img
        src="/images/warm-editorial-portrait-in-mauve-saree.png" alt="" width={1024} height={1536}
        style={{ objectPosition: '50% 22%' }}
      />
      <blockquote>“A quiet room to set it down.”</blockquote>
    </div>
  );
}

function LoginForm() {
  const { login } = useAuth();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const address = email.trim();
    const msg = !address || !password ? 'Enter your email and password.'
      : !EMAIL.test(address) ? 'That email address looks incomplete.' : '';
    setError(msg);
    if (msg) {
      (address ? passwordRef : emailRef).current?.focus();
      return;
    }
    setSubmitting(true);
    const result = await login(address, password);
    setSubmitting(false);
    // on success the session updates and the redirect effect takes over
    if (!result.success) setError(result.error || 'Login failed');
  };

  return (
    <form onSubmit={submit} noValidate>
      <div>
        <img className="logo" src="/logo-pink.svg" alt="Tania Subhashita" width={414} height={73} />
        <h1>Welcome back</h1>
      </div>
      <p className="sub">Sign in to manage appointments and the website.</p>
      <p className={error ? 'alert show' : 'alert'} role="alert">{error}</p>
      <div className="f">
        <label htmlFor="email">Email</label>
        <input
          ref={emailRef} className="in" id="email" type="email" autoComplete="username" required autoFocus
          value={email} onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="f">
        <label htmlFor="password">Password</label>
        <div className="pw">
          <input
            ref={passwordRef} className="in" id="password" type={showPassword ? 'text' : 'password'}
            autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="icon-btn" type="button" aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword} onClick={() => setShowPassword((v) => !v)}
          >
            <Icon name="eye" />
          </button>
        </div>
      </div>
      <button className="abtn primary" type="submit" disabled={submitting}>
        {submitting ? <><span className="spin" aria-hidden="true" />Signing in…</> : 'Sign in'}
      </button>
      <p className="note">Only the site’s admin account can sign in here.</p>
      <a className="back" href="/">← Back to the website</a>
    </form>
  );
}

export default function AdminLogin() {
  usePageMeta('Sign in · Admin');
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated) navigate('/admin');
  }, [isAuthenticated, loading, navigate]);

  return (
    <div className="admin-app">
      <main className="login">
        <Art />
        <div className="pane">
          {loading ? <span className="spin" role="status" aria-label="Checking your session" /> : <LoginForm />}
        </div>
      </main>
    </div>
  );
}
