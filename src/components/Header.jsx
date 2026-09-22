import React, { useState, useEffect } from 'react';
import { Tv, Upload, Download, Moon, Sun, PlusCircle, Volume2, VolumeX } from 'lucide-react';
import { generateLeetcodeTemplate } from '../utils/excelParser';

export function Header({
  onOpenUpload,
  onOpenAddModal,
  onToggleTvMode,
  darkMode,
  setDarkMode,
  soundEnabled,
  setSoundEnabled,
  totalCoders
}) {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDateStr(now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

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
            <p>Department of Technical Training • LeetCode Leaderboard Portal</p>
          </div>
        </div>

        {/* Live Clock & Action Controls */}
        <div className="header-actions">
          <div className="live-time-chip" title="Live Clock">
            <span className="live-dot"></span>
            <span>{timeStr}</span>
            <span style={{ opacity: 0.65, fontSize: '0.75rem' }}>| {dateStr}</span>
          </div>

          {/* Smart TV Broadcast Mode */}
          <button
            className="btn btn-gold"
            onClick={onToggleTvMode}
            title="Launch Fullscreen Smart TV Broadcast Mode"
          >
            <Tv size={18} />
            <span>Smart TV Mode</span>
          </button>

          {/* Upload Data */}
          <button
            className="btn btn-navy"
            onClick={onOpenUpload}
            title="Upload LeetCode Report Excel file"
          >
            <Upload size={16} />
            <span>Import Report</span>
          </button>

          {/* Download LeetCode Template */}
          <button
            className="btn btn-navy"
            onClick={generateLeetcodeTemplate}
            title="Download Leetcode Report sample template"
          >
            <Download size={16} />
            <span>LC Template</span>
          </button>

          {/* Add Record */}
          <button
            className="btn btn-navy"
            onClick={onOpenAddModal}
            title="Add student record manually"
          >
            <PlusCircle size={16} />
            <span>Add Coder</span>
          </button>

          {/* Sound Celebration Toggle */}
          <button
            className="btn btn-navy"
            style={{ padding: '0.55rem' }}
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? "Mute Fanfare Sounds" : "Enable Fanfare Sounds"}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* Dark Mode Toggle */}
          <button
            className="btn btn-navy"
            style={{ padding: '0.55rem' }}
            onClick={() => setDarkMode(!darkMode)}
            title="Toggle Dark / Light Mode"
          >
            {darkMode ? <Sun size={16} color="#FFB800" /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
}
