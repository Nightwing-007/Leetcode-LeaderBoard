import React, { useState } from 'react';
import {
  Tv,
  Upload,
  Download,
  Users,
  LogOut,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Lock,
  User,
  AlertCircle,
  X
} from 'lucide-react';
import { generateLeetcodeTemplate } from '../utils/excelParser';
import { loginAdmin } from '../api/leaderboardApi';
import { ThemeSelector } from './ThemeSelector';

export function Header({
  isAdmin,
  onLoginSuccess,
  onLogout,
  onOpenUpload,
  onToggleTvMode,
  darkMode,
  setDarkMode,
  theme,
  setTheme,
  totalCoders
}) {
  const [isLoginRequestOpen, setIsLoginRequestOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = async (e) => {
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
      setIsLoginRequestOpen(false);
      setUsername('');
      setPassword('');
      if (onLoginSuccess) {
        onLoginSuccess(response);
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    }
  };

  return (
    <header className="sece-header">
      <div className="header-container">
        {/* Brand Logo & Name */}
        <div className="brand-section">
          <div className="college-logo-badge" title="Sri Eshwar College of Engineering">
            SE
          </div>
          <div className="college-title-group">
            <h1>Sri Eshwar College of Engineering</h1>
            <p>Leaderboard Portal</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="header-actions">
          {/* Student Count Badge */}
          {totalCoders > 0 && (
            <div className="coders-count-badge" title={`${totalCoders} active student coders`}>
              <Users size={14} />
              <span>{totalCoders.toLocaleString()} Coders</span>
            </div>
          )}

          {/* Smart TV Broadcast Mode */}
          <button
            className="btn btn-gold"
            onClick={onToggleTvMode}
            title="Launch Fullscreen Smart TV Broadcast Mode"
          >
            <Tv size={18} />
            <span>Smart TV Mode</span>
          </button>

          {/* Download LeetCode Template */}
          <button
            className="btn btn-navy"
            onClick={generateLeetcodeTemplate}
            title="Download Report sample template"
          >
            <Download size={16} />
            <span>LC Template</span>
          </button>

          {/* Admin Protected Action Buttons & Login Drawer Trigger */}
          {isAdmin ? (
            <>
              <button
                className="btn btn-navy"
                onClick={onOpenUpload}
                title="Upload Coding &amp; Placement Report Excel file"
              >
                <Upload size={16} />
                <span>Upload Report</span>
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 800, background: 'rgba(16,185,129,0.12)', padding: '4px 8px', borderRadius: '6px' }}>
                  Admin Active
                </span>
                <button
                  className="btn btn-navy"
                  style={{ border: '1px solid rgba(239, 68, 68, 0.4)', color: '#EF4444' }}
                  onClick={onLogout}
                  title="Sign out of Admin session"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <button
              className="btn btn-navy"
              style={{
                border: isLoginRequestOpen ? '1px solid var(--sece-gold-500)' : '1px solid rgba(255, 184, 0, 0.4)',
                color: 'var(--sece-gold-500)',
                background: isLoginRequestOpen ? 'rgba(255, 184, 0, 0.12)' : undefined,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
              onClick={() => setIsLoginRequestOpen(!isLoginRequestOpen)}
              title="Extend admin access request"
            >
              <ShieldCheck size={16} />
              <span>{isLoginRequestOpen ? 'Close Request' : 'Admin Request'}</span>
              {isLoginRequestOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}

          {/* Theme Dropdown (SECE Classic, Google Antigravity, Midnight Dark) */}
          <ThemeSelector
            currentTheme={theme || (darkMode ? 'dark' : 'classic')}
            onSelectTheme={(newTheme) => {
              if (setTheme) setTheme(newTheme);
            }}
          />
        </div>
      </div>

      {/* Extending Admin Login / Request Access Drawer */}
      {isLoginRequestOpen && !isAdmin && (
        <div
          className="extending-login-drawer"
          style={{
            background: 'var(--bg-card)',
            borderTop: '1px solid var(--border-color)',
            borderBottom: '2px solid var(--sece-gold-500)',
            padding: '1rem 1.5rem',
            animation: 'expandCardDrop 0.25s cubic-bezier(0.16, 1, 0.3, 1) both',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)'
          }}
        >
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(255, 184, 0, 0.2)', padding: '8px', borderRadius: '8px' }}>
                <ShieldCheck size={20} color="var(--sece-gold-500)" />
              </div>
              <div>
                <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 800 }}>
                  Administrator Access Request
                </h4>
                <p style={{ margin: '2px 0 0 0', color: 'var(--text-muted)', fontSize: '0.75rem', opacity: 0.9 }}>
                  Enter credentials to unlock administrative actions, reports, and editor tools
                </p>
              </div>
            </div>

            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              {errorMsg && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#EF4444', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(239,68,68,0.15)', padding: '4px 8px', borderRadius: '6px' }}>
                  <AlertCircle size={14} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User size={14} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Username (admin)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    padding: '0.45rem 0.6rem 0.45rem 2rem',
                    fontSize: '0.85rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-main)',
                    outline: 'none',
                    minWidth: '150px'
                  }}
                />
              </div>

              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={14} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  placeholder="Password (admin)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    padding: '0.45rem 0.6rem 0.45rem 2rem',
                    fontSize: '0.85rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-main)',
                    outline: 'none',
                    minWidth: '150px'
                  }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-gold"
                disabled={loading}
                style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', fontWeight: 800 }}
              >
                {loading ? 'Verifying...' : 'Authenticate'}
              </button>

              <button
                type="button"
                className="btn btn-navy"
                onClick={() => setIsLoginRequestOpen(false)}
                style={{ padding: '0.45rem', border: 'none' }}
                title="Cancel request"
              >
                <X size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}

