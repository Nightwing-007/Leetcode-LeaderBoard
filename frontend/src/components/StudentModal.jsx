import React from 'react';
import { X, Code, Flame, Star, Trophy, Award, Zap, CheckCircle2, Target } from 'lucide-react';

export function StudentModal({ student, onClose }) {
  if (!student) return null;

  const lc = student.leetcode || {};
  const pgp = student.pgp || {};

  const badges = [];
  const lcSolved = lc.solvedTotal ?? student.lcSolvedTotal ?? 0;
  const lcRating = lc.contestRating ?? student.lcContestRating ?? 0;
  const pgpPoints = pgp.points ?? student.pgpPoints ?? 0;
  const pgpSolved = pgp.programsSolved ?? student.pgpProgramsSolved ?? 0;

  const weeklyScore = student.weeklyAssessment?.score ?? student.weeklyScore ?? 0;
  const weeklyRank = student.weeklyAssessment?.rank ?? student.weeklyRank ?? 0;
  const weeklyCode = student.weeklyAssessment?.codeScore ?? student.weeklyCodeScore ?? 0;
  const weeklyMcq = student.weeklyAssessment?.mcqScore ?? student.weeklyMcqScore ?? 0;
  const weeklyTestName = student.weeklyAssessment?.testName || 'Weekly Assessment #003';

  if (weeklyScore >= 100) badges.push({ title: '💯 Centum Assessment Achiever (100+ Score)', color: '#FFB800' });
  if (weeklyRank > 0 && weeklyRank <= 10) badges.push({ title: `🎯 Assessment Top 10 (Rank #${weeklyRank})`, color: '#3B82F6' });

  if (pgpPoints >= 2000) badges.push({ title: 'Diamond Coder (2000+ PGP)', color: '#FFB800' });
  else if (pgpPoints >= 1500) badges.push({ title: 'Gold Coder (1500+ PGP)', color: '#F59E0B' });

  if (pgpSolved >= 800) badges.push({ title: 'Code Crusher (800+ Solved)', color: '#10B981' });
  if (lcSolved >= 500) badges.push({ title: 'LeetCode Titan (500+ Solved)', color: '#3B82F6' });
  if (lcRating >= 1800) badges.push({ title: 'Knight Coder (1800+ Rating)', color: '#8B5CF6' });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Modal Header */}
        <div className="modal-header" style={{ background: 'var(--sece-navy-900)', color: '#FFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#FFB800', color: '#002855', fontWeight: 900, fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {student.name ? student.name.charAt(0) : 'S'}
            </div>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFF', margin: 0 }}>{student.name}</h3>
              <p style={{ fontSize: '0.825rem', color: '#FFC72C', fontFamily: 'var(--font-mono)', margin: '4px 0 0 0' }}>
                Roll No: {student.rollNo} • {student.department} ({student.batch || '2024-2028'}) {student.subBatch ? `• ${student.subBatch}` : ''}
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
                Earned Achievements &amp; Badges
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

          {/* Weekly Assessment Card (if available) */}
          {weeklyScore > 0 && (
            <div style={{ background: 'var(--bg-primary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h4 style={{ fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--sece-navy-700)', margin: 0 }}>
                  <Target size={18} color="#FFB800" /> Last Week's Assessment Test
                </h4>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{weeklyTestName}</span>
                  <span className="pill pill-rating" style={{ background: weeklyScore >= 100 ? '#FFB800' : 'var(--sece-navy-100)', color: weeklyScore >= 100 ? '#002855' : 'var(--sece-navy-900)', fontWeight: 900 }}>
                    Score: {weeklyScore} pts {weeklyScore >= 100 ? '💯' : ''}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem', textAlign: 'center' }}>
                <div style={{ background: 'var(--bg-card)', padding: '0.65rem', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#10B981' }}>{weeklyCode} / 4</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Coding Programs Solved</div>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '0.65rem', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#2563EB' }}>{weeklyMcq} / 100</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Aptitude MCQ Score</div>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '0.65rem', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--sece-gold-600)' }}>
                    {weeklyRank > 0 ? `#${weeklyRank}` : 'N/A'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Assessment Test Rank</div>
                </div>
              </div>
            </div>
          )}

          {/* PGP / Placement Metrics Panel */}
          <div style={{ background: 'var(--bg-primary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <h4 style={{ fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--sece-navy-700)', margin: 0 }}>
                <Zap size={18} color="#D99B00" /> Placement Grade Point (PGP) Report
              </h4>
              <span className="pill pill-rating" style={{ background: 'var(--sece-gold-100)', color: 'var(--sece-navy-900)', fontWeight: 800 }}>
                Total Points: {pgpPoints.toLocaleString()}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem', textAlign: 'center', marginBottom: '0.75rem' }}>
              <div style={{ background: 'var(--bg-card)', padding: '0.65rem', borderRadius: '8px' }}>
                <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--sece-navy-700)' }}>
                  {(pgp.programsSolved ?? student.pgpProgramsSolved ?? 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Programs Solved</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '0.65rem', borderRadius: '8px' }}>
                <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#059669' }}>
                  {pgp.codeTests ?? student.pgpCodeTests ?? 0}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Code Tests</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '0.65rem', borderRadius: '8px' }}>
                <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#D97706' }}>
                  {pgp.codeTracks ?? student.pgpCodeTracks ?? 0}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Code Tracks</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '0.65rem', borderRadius: '8px' }}>
                <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#6366F1' }}>
                  {pgp.codeTutor ?? student.pgpCodeTutor ?? 0}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Code Tutor</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem', textAlign: 'center' }}>
              <div style={{ background: 'var(--bg-card)', padding: '0.65rem', borderRadius: '8px' }}>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--sece-navy-700)' }}>
                  {pgp.dc ?? student.pgpDc ?? 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Daily Challenge (DC)</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '0.65rem', borderRadius: '8px' }}>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0056B3' }}>
                  {pgp.dt ?? student.pgpDt ?? 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Daily Test (DT)</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '0.65rem', borderRadius: '8px' }}>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#10B981' }}>
                  {pgp.aptitudeScore ?? student.pgpAptitudeScore ?? 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Aptitude Score</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '0.65rem', borderRadius: '8px' }}>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--sece-gold-600)' }}>
                  {(pgp.skillrackRank ?? student.pgpSkillrackRank ?? 0) > 0 ? `#${(pgp.skillrackRank ?? student.pgpSkillrackRank).toLocaleString()}` : 'N/A'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SkillRack Rank</div>
              </div>
            </div>
          </div>

          {/* LeetCode Metrics Panel (if available) */}
          {(lc.leetcodeId || lcSolved > 0) && (
            <div style={{ background: 'var(--bg-primary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h4 style={{ fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--sece-navy-700)', margin: 0 }}>
                  <Code size={18} /> LeetCode Profile
                </h4>
                <span className="pill pill-rating">ID: {lc.leetcodeId || student.leetcodeId || 'N/A'}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem', textAlign: 'center', marginBottom: '0.75rem' }}>
                <div style={{ background: 'var(--bg-card)', padding: '0.65rem', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--sece-navy-700)' }}>{lcSolved}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ALL Solved</div>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '0.65rem', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#059669' }}>{lc.solvedEasy ?? student.lcSolvedEasy ?? 0}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Easy</div>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '0.65rem', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#D97706' }}>{lc.solvedMedium ?? student.lcSolvedMedium ?? 0}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Medium</div>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '0.65rem', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#DC2626' }}>{lc.solvedHard ?? student.lcSolvedHard ?? 0}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Hard</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem', textAlign: 'center' }}>
                <div style={{ background: 'var(--bg-card)', padding: '0.65rem', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--sece-navy-700)' }}>🔥 {Math.round(Number(lcRating || 1500))}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Contest Rating</div>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '0.65rem', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#0056B3' }}>{lc.contestAttended ?? student.lcContestsAttended ?? 0}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Contests Attended</div>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '0.65rem', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--sece-gold-600)' }}>
                    Top {lc.topPercentage ?? student.lcTopPercentage ?? 'N/A'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Global Rank #{(lc.globalRank ?? student.lcGlobalRank ?? 0) < 900000 ? (lc.globalRank ?? student.lcGlobalRank).toLocaleString() : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
