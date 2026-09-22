import React from 'react';
import { X, Code, Flame, Star, Trophy, Award } from 'lucide-react';

export function StudentModal({ student, onClose }) {
  if (!student) return null;

  const badges = [];
  if (student.leetcode?.solvedTotal >= 600) badges.push({ title: 'LeetCode Titan (600+ Solved)', color: '#FFB800' });
  if (student.leetcode?.contestRating >= 1800) badges.push({ title: 'Knight Coder (1800+ Rating)', color: '#60A5FA' });
  if (student.leetcode?.contestAttended >= 20) badges.push({ title: 'Contest Veteran (20+ Contests)', color: '#F472B6' });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header" style={{ background: 'var(--sece-navy-900)', color: '#FFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#FFB800', color: '#002855', fontWeight: 900, fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {student.name.charAt(0)}
            </div>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFF' }}>{student.name}</h3>
              <p style={{ fontSize: '0.825rem', color: '#FFC72C', fontFamily: 'var(--font-mono)' }}>
                Roll No: {student.rollNo} • {student.department} ({student.batch}) • {student.gender}
              </p>
            </div>
          </div>

          <button className="btn btn-navy" style={{ padding: '0.35rem' }} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Achievement Badges */}
          {badges.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                Earned LeetCode Badges
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {badges.map((b, i) => (
                  <span key={i} style={{ background: 'var(--sece-navy-100)', color: 'var(--sece-navy-800)', border: `1px solid ${b.color}`, padding: '0.3rem 0.7rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Star size={14} color={b.color} />
                    {b.title}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* LeetCode Report Details */}
          <div style={{ background: 'var(--bg-primary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <h4 style={{ fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--sece-navy-700)' }}>
                <Code size={18} /> LeetCode Performance Metrics
              </h4>
              <span className="pill pill-rating">ID: {student.leetcode?.leetcodeId || 'N/A'}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem', textAlign: 'center', marginBottom: '0.75rem' }}>
              <div style={{ background: 'var(--bg-card)', padding: '0.65rem', borderRadius: '8px' }}>
                <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--sece-navy-700)' }}>{student.leetcode?.solvedTotal || 0}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ALL Solved</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '0.65rem', borderRadius: '8px' }}>
                <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#059669' }}>{student.leetcode?.solvedEasy || 0}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Easy</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '0.65rem', borderRadius: '8px' }}>
                <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#D97706' }}>{student.leetcode?.solvedMedium || 0}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Medium</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '0.65rem', borderRadius: '8px' }}>
                <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#DC2626' }}>{student.leetcode?.solvedHard || 0}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Hard</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem', textAlign: 'center' }}>
              <div style={{ background: 'var(--bg-card)', padding: '0.65rem', borderRadius: '8px' }}>
                <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--sece-navy-700)' }}>🔥 {student.leetcode?.contestRating || 1500}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Contest Rating</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '0.65rem', borderRadius: '8px' }}>
                <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#0056B3' }}>{student.leetcode?.contestAttended || 0}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Contests Attended</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '0.65rem', borderRadius: '8px' }}>
                <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--sece-gold-600)' }}>Top {student.leetcode?.topPercentage || 'N/A'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Global Rank #{student.leetcode?.globalRank || 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
