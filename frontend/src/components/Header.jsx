import React from 'react';
import { Tv, Upload, Users, LogOut } from 'lucide-react';
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
            <p>Department of Technical Training • Performance Portal</p>
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

          {/* Admin Protected Action Buttons */}
          {isAdmin && (
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
          )}

          {/* Theme Dropdown (SECE Classic, Google Minimal, Midnight Dark) */}
          <ThemeSelector
            currentTheme={theme || (darkMode ? 'dark' : 'classic')}
            onSelectTheme={(newTheme) => {
              if (setTheme) setTheme(newTheme);
              if (setDarkMode) setDarkMode(newTheme === 'dark');
            }}
          />
        </div>
      </div>
    </header>
  );
}

