import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, ChevronDown, Moon, Orbit, Sparkles } from 'lucide-react';

export const THEMES = [
  {
    id: 'classic',
    name: 'SECE Classic (Default)',
    icon: Sparkles,
    color: '#FFB800',
    swatches: ['#003366', '#FFB800']
  },
  {
    id: 'antigravity',
    name: 'Google Antigravity',
    icon: Orbit,
    color: '#2563EB',
    swatches: ['#FFFFFF', '#2563EB', '#38BDF8']
  },
  {
    id: 'dark',
    name: 'Midnight Dark',
    icon: Moon,
    color: '#38BDF8',
    swatches: ['#07111E', '#38BDF8']
  }
];

export function ThemeSelector({ currentTheme = 'classic', onSelectTheme }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const activeThemeObj = THEMES.find((t) => t.id === currentTheme || (t.id === 'antigravity' && currentTheme === 'minimal')) || THEMES[0];
  const ActiveIcon = activeThemeObj.icon;

  const handleChoose = (themeId) => {
    if (onSelectTheme) {
      onSelectTheme(themeId);
    }
    setIsOpen(false);
  };

  return (
    <div
      className="theme-dropdown-wrapper"
      ref={containerRef}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      {/* Compact Trigger Icon Button matching original btn-navy sizing */}
      <button
        type="button"
        className="btn btn-navy theme-color-btn"
        style={{
          padding: '0.52rem 0.65rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          borderRadius: 'var(--radius-md)'
        }}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title={`Change Theme Color Options (Current: ${activeThemeObj.name})`}
      >
        <ActiveIcon size={16} color={activeThemeObj.color} />
        <ChevronDown
          size={12}
          style={{
            transition: 'transform 0.2s ease',
            transform: isOpen ? 'rotate(180deg)' : 'none',
            opacity: 0.85
          }}
        />
      </button>

      {/* Compact Color Options Dropdown Menu */}
      {isOpen && (
        <div
          className="theme-dropdown-menu-compact"
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            zIndex: 1050,
            minWidth: '220px',
            background: 'var(--bg-card)',
            border: '1.5px solid var(--border-color)',
            borderRadius: '12px',
            padding: '5px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
            color: 'var(--text-main)',
            animation: 'fadeIn 0.15s ease'
          }}
        >
          <div
            style={{
              padding: '6px 10px 4px 10px',
              fontSize: '0.7rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-muted)',
              borderBottom: '1px solid var(--border-color)',
              marginBottom: '4px'
            }}
          >
            Color Theme Options
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {THEMES.map((item) => {
              const isSelected = item.id === currentTheme || (item.id === 'antigravity' && currentTheme === 'minimal');
              const ItemIcon = item.icon;

              return (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleChoose(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isSelected ? 'var(--theme-select-active-bg, rgba(99, 102, 241, 0.15))' : 'transparent',
                    color: isSelected ? 'var(--theme-select-active-color, #818CF8)' : 'var(--text-main)',
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '0.825rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'var(--bg-card-hover)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px'
                      }}
                    >
                      {item.swatches.map((swatchColor, idx) => (
                        <span
                          key={idx}
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: swatchColor,
                            border: '1px solid rgba(0,0,0,0.15)'
                          }}
                        />
                      ))}
                    </div>
                    <span>{item.name}</span>
                  </div>

                  {isSelected && (
                    <Check size={14} strokeWidth={2.5} color={item.color} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
