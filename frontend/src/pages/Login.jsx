import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError('Please enter both email and password');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email: cleanEmail, password: cleanPassword });
      if (res.data.success) {
        localStorage.setItem('dinevo_token', res.data.token);
        localStorage.setItem('dinevo_user', JSON.stringify(res.data.user));
        navigate('/admin');
      } else {
        setError(res.data.message || 'Login failed');
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.message || 'Invalid email or password');
      } else if (err.request) {
        setError(`Unable to connect to DINEVO backend server (${api.defaults.baseURL}). Please verify backend is running on port 5000.`);
      } else {
        setError(err.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="dv-login-page">
      <div className="dv-login-bg">
        <div className="dv-login-glow g1" />
        <div className="dv-login-glow g2" />
      </div>

      <div className="dv-login-card">
        <div className="dv-login-header">
          <div className="dv-logo" style={{ fontSize: '2.6rem', marginBottom: 4 }}>
            DINE<span style={{ color: 'var(--gold)' }}>VO</span>
          </div>
          <div className="dv-login-subtitle">Restaurant Operations</div>
        </div>

        <form onSubmit={handleSubmit} className="dv-login-form">
          {error && (
            <div className="dv-login-error">
              <span>⚠</span> {error}
            </div>
          )}

          <div className="dv-login-field">
            <label>Email Address</label>
            <input
              type="email"
              className="dv-input"
              placeholder="admin@dinevo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="dv-login-field">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="dv-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-soft)',
                  fontSize: '0.82rem', fontWeight: 600
                }}
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-dv btn-burgundy btn-block"
            disabled={loading}
            style={{ marginTop: 8, padding: '14px', fontSize: '1.05rem', fontWeight: 700 }}
          >
            {loading ? <span className="dv-spinner" /> : 'LOGIN'}
          </button>

          <div className="dv-login-hint">
            <span style={{ color: 'var(--ink-faint)' }}>Demo credentials:</span>{' '}
            <strong>admin@dinevo.com</strong> / <strong>dinevo123</strong>
          </div>
        </form>
      </div>
    </div>
  );
}
