import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, User, Lock, Eye, EyeOff, LogIn, AlertCircle, ArrowLeft } from 'lucide-react';
import { loginAdmin } from '../api/leaderboardApi';

export function AdminLogin({ isAdmin, onLoginSuccess }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // If already logged in, provide direct navigation or feedback
  const handleAlreadyLoggedIn = () => {
    navigate('/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const response = await loginAdmin(username.trim(), password.trim());
      setLoading(false);
      if (onLoginSuccess) {
        onLoginSuccess(response);
      }
      navigate('/');
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || 'Authentication failed. Please verify your administrator credentials.');
    }
  };

  return (
    <div
      className="admin-login-page"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        background: 'var(--bg-primary, #F8FAFC)',
        position: 'relative'
      }}
    >
      {/* Back to Dashboard Navigation Link */}
      <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem' }}>
        <Link
          to="/"
          className="btn btn-navy"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            textDecoration: 'none',
            fontSize: '0.85rem',
            padding: '0.45rem 0.85rem'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Main Centered Login Card */}
      <div
        className="login-card-container"
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'var(--bg-card, #FFFFFF)',
          borderRadius: '16px',
          boxShadow: '0 12px 40px rgba(0, 40, 85, 0.12)',
          border: '1px solid var(--border-color, #E2E8F0)',
          overflow: 'hidden'
        }}
      >
        {/* Card Header with SECE Branding */}
        <div
          style={{
            background: 'linear-gradient(135deg, var(--sece-navy-900, #002855), var(--sece-navy-800, #0B3C6D))',
            padding: '2rem 1.75rem 1.5rem',
            textAlign: 'center',
            color: '#FFFFFF',
            position: 'relative'
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #FFB800, #FFC72C)',
              color: '#002855',
              fontWeight: 900,
              fontSize: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 6px 16px rgba(255, 184, 0, 0.35)'
            }}
          >
            SE
          </div>
          <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.01em', color: '#FFFFFF' }}>
            Sri Eshwar College of Engineering
          </h2>
          <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.85rem', color: '#FFC72C', fontWeight: 600 }}>
            Department of Technical Training • Admin Portal
          </p>
        </div>

        {/* Card Body */}
        <div style={{ padding: '2rem 1.75rem' }}>
          {isAdmin ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: '#059669',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  marginBottom: '1.25rem'
                }}
              >
                <ShieldCheck size={20} />
                <span>You are currently authenticated as Admin</span>
              </div>
              <button
                type="button"
                className="btn btn-gold"
                onClick={handleAlreadyLoggedIn}
                style={{ width: '100%', padding: '0.75rem', fontWeight: 800 }}
              >
                Return to Dashboard
              </button>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main, #0F172A)' }}>
                  Sign In to Administration
                </h3>
                <p style={{ margin: '0.35rem 0 0', fontSize: '0.825rem', color: 'var(--text-muted, #64748B)' }}>
                  Enter your credentials to manage leaderboard datasets, student records, and sync reports.
                </p>
              </div>

              {errorMsg && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    color: '#EF4444',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    marginBottom: '1.25rem',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px'
                  }}
                >
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                {/* Username Input */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      marginBottom: '0.4rem',
                      color: 'var(--text-main, #1E293B)'
                    }}
                  >
                    Admin Username
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: 'var(--bg-primary, #F8FAFC)',
                      border: '1.5px solid var(--border-color, #CBD5E1)',
                      borderRadius: '10px',
                      padding: '0.65rem 0.85rem',
                      gap: '0.65rem'
                    }}
                  >
                    <User size={18} color="var(--sece-navy-500, #0B3C6D)" style={{ flexShrink: 0 }} />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. admin"
                      autoFocus
                      required
                      style={{
                        flex: 1,
                        border: 'none',
                        background: 'transparent',
                        outline: 'none',
                        fontSize: '0.9rem',
                        color: 'var(--text-main, #0F172A)'
                      }}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      marginBottom: '0.4rem',
                      color: 'var(--text-main, #1E293B)'
                    }}
                  >
                    Admin Password
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: 'var(--bg-primary, #F8FAFC)',
                      border: '1.5px solid var(--border-color, #CBD5E1)',
                      borderRadius: '10px',
                      padding: '0.65rem 0.85rem',
                      gap: '0.65rem'
                    }}
                  >
                    <Lock size={18} color="var(--sece-navy-500, #0B3C6D)" style={{ flexShrink: 0 }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      style={{
                        flex: 1,
                        border: 'none',
                        background: 'transparent',
                        outline: 'none',
                        fontSize: '0.9rem',
                        color: 'var(--text-main, #0F172A)'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        color: 'var(--text-muted, #64748B)',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-gold"
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    marginTop: '0.5rem',
                    justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(255, 184, 0, 0.35)'
                  }}
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <LogIn size={18} />
                      <span>Sign In to Admin Portal</span>
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
