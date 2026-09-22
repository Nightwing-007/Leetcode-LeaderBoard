import React from 'react';
import { Crown, Trophy, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export function Podium({ top3, onSelectStudent, soundEnabled }) {
  if (!top3 || top3.length < 3) return null;

  const [first, second, third] = top3;

  const triggerCelebration = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  return (
    <section className="podium-section">
      <div className="section-header">
        <h2 className="section-title">
          <Trophy size={26} />
          <span>Hall of Fame • SECE LeetCode Champions</span>
        </h2>
        <button className="btn btn-gold" onClick={triggerCelebration} style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}>
          <Sparkles size={16} />
          <span>Celebrate #1 Champion</span>
        </button>
      </div>

      <div className="podium-container">
        {/* Rank 2 - Silver */}
        <div className="podium-card rank-2" onClick={() => onSelectStudent(second)}>
          <div className="rank-badge">#2</div>
          <div className="avatar-wrapper">
            {second.name.charAt(0)}
          </div>
          <h3 className="student-name">{second.name}</h3>
          <span className="dept-tag">{second.department} • {second.batch}</span>
          
          <div className="podium-stats-grid">
            <div className="p-stat">
              <div className="val">{second.leetcode?.solvedTotal || 0}</div>
              <div className="lbl">LeetCode Solved</div>
            </div>
            <div className="p-stat">
              <div className="val">{second.leetcode?.contestRating || 1500}</div>
              <div className="lbl">Contest Rating</div>
            </div>
            <div className="p-stat">
              <div className="val">{second.leetcode?.contestAttended || 0}</div>
              <div className="lbl">Contests</div>
            </div>
            <div className="p-stat">
              <div className="val">#{second.leetcode?.globalRank || 'N/A'}</div>
              <div className="lbl">Global Rank</div>
            </div>
          </div>
        </div>

        {/* Rank 1 - Gold Champion */}
        <div className="podium-card rank-1" onClick={() => onSelectStudent(first)}>
          <Crown size={38} className="crown-icon" />
          <div className="rank-badge">#1</div>
          <div className="avatar-wrapper">
            {first.name.charAt(0)}
          </div>
          <h3 className="student-name" style={{ fontSize: '1.35rem' }}>{first.name}</h3>
          <span className="dept-tag" style={{ background: '#FFB800', color: '#002855' }}>
            {first.department} • {first.batch} Champion
          </span>

          <div className="podium-stats-grid">
            <div className="p-stat" style={{ background: 'rgba(255, 184, 0, 0.15)' }}>
              <div className="val" style={{ color: '#D99B00', fontSize: '1.15rem' }}>
                {first.leetcode?.solvedTotal || 0}
              </div>
              <div className="lbl">LeetCode Solved</div>
            </div>
            <div className="p-stat" style={{ background: 'rgba(0, 51, 102, 0.1)' }}>
              <div className="val" style={{ color: '#003366', fontSize: '1.15rem' }}>
                {first.leetcode?.contestRating || 1500}
              </div>
              <div className="lbl">Contest Rating</div>
            </div>
            <div className="p-stat">
              <div className="val">{first.leetcode?.contestAttended || 0}</div>
              <div className="lbl">Contests</div>
            </div>
            <div className="p-stat">
              <div className="val">#{first.leetcode?.globalRank || 'N/A'}</div>
              <div className="lbl">Global Rank</div>
            </div>
          </div>
        </div>

        {/* Rank 3 - Bronze */}
        <div className="podium-card rank-3" onClick={() => onSelectStudent(third)}>
          <div className="rank-badge">#3</div>
          <div className="avatar-wrapper">
            {third.name.charAt(0)}
          </div>
          <h3 className="student-name">{third.name}</h3>
          <span className="dept-tag">{third.department} • {third.batch}</span>

          <div className="podium-stats-grid">
            <div className="p-stat">
              <div className="val">{third.leetcode?.solvedTotal || 0}</div>
              <div className="lbl">LeetCode Solved</div>
            </div>
            <div className="p-stat">
              <div className="val">{third.leetcode?.contestRating || 1500}</div>
              <div className="lbl">Contest Rating</div>
            </div>
            <div className="p-stat">
              <div className="val">{third.leetcode?.contestAttended || 0}</div>
              <div className="lbl">Contests</div>
            </div>
            <div className="p-stat">
              <div className="val">#{third.leetcode?.globalRank || 'N/A'}</div>
              <div className="lbl">Global Rank</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
