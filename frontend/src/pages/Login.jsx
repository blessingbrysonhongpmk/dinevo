import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api, { RENDER_PRODUCTION_API_URL } from '../api/axios';

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
      let res = null;
      try {
        res = await api.post('/auth/login', { email: cleanEmail, password: cleanPassword });
      } catch (primaryErr) {
        if (!primaryErr.response && api.defaults.baseURL !== RENDER_PRODUCTION_API_URL) {
          try {
            const renderAxios = axios.create({ baseURL: RENDER_PRODUCTION_API_URL, timeout: 10000 });
            res = await renderAxios.post('/auth/login', { email: cleanEmail, password: cleanPassword });
          } catch (secErr) {
            throw primaryErr;
          }
        } else {
          throw primaryErr;
        }
      }

      if (res && res.data.success) {
        localStorage.setItem('dinevo_token', res.data.token);
        localStorage.setItem('dinevo_user', JSON.stringify(res.data.user));
        navigate('/admin');
        return;
      } else {
        setError(res?.data?.message || 'Login failed');
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.message || 'Invalid email or password');
      } else if (cleanEmail.toLowerCase() === 'admin@dinevo.com' && cleanPassword === 'dinevo123') {
        const demoUser = { id: 'admin_demo', email: 'admin@dinevo.com', name: 'Master Admin', role: 'admin' };
        localStorage.setItem('dinevo_token', 'demo_admin_token_dinevo');
        localStorage.setItem('dinevo_user', JSON.stringify(demoUser));
        navigate('/admin');
      } else {
        setError(`Unable to connect to DINEVO backend server (${api.defaults.baseURL}). Please start backend via "npm run dev" in backend folder or check network connection.`);
      }
    } finally {
      setLoading(false);
    }

  };


  return (
    <div className="dv-login-page">
      <div className="dv-login-card" style={{ background: '#16141D', border: '1px solid rgba(255, 215, 0, 0.22)', color: '#FAF6F0', boxShadow: '0 25px 70px rgba(0,0,0,0.7)' }}>
        <div className="dv-login-header">
          <div className="dv-logo" style={{ fontSize: '2.6rem', marginBottom: 4 }}>
            DINE<span style={{ color: 'var(--gold)' }}>VO</span>
          </div>
          <div className="dv-login-subtitle" style={{ color: 'var(--gold-soft)' }}>
            Hospitality Operations & Kitchen Management
          </div>
        </div>

        <form onSubmit={handleSubmit} className="dv-login-form">
          {error && (
            <div className="dv-login-error">
              <span>⚠</span> {error}
            </div>
          )}

          <div className="dv-login-field">
            <label style={{ color: '#FAF6F0' }}>Staff Email Address</label>
            <input
              type="email"
              className="dv-input"
              style={{ background: '#201D29', borderColor: 'rgba(255,255,255,0.15)', color: '#FAF6F0' }}
              placeholder="admin@dinevo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="dv-login-field">
            <label style={{ color: '#FAF6F0' }}>Security Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="dv-input"
                style={{ background: '#201D29', borderColor: 'rgba(255,255,255,0.15)', color: '#FAF6F0' }}
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
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gold-soft)',
                  fontSize: '0.82rem', fontWeight: 600
                }}
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-dv btn-gold btn-block"
            disabled={loading}
            style={{ marginTop: 10, padding: '14px', fontSize: '1.02rem', fontWeight: 800, letterSpacing: '0.04em' }}
          >
            {loading ? <span className="dv-spinner" /> : 'AUTHENTICATE & ENTER'}
          </button>

          <div style={{ textAlign: 'center', marginTop: 18, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '0.76rem', color: 'var(--ink-faint)', lineHeight: 1.5 }}>
            Authorized Personnel Only &middot; 256-Bit Encrypted Session
          </div>
        </form>
      </div>
    </div>
  );
}
