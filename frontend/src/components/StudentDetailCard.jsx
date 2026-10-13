import React, { useState, useEffect } from 'react';
import { X, Code, Star, Trophy, Award, Zap, Target, Globe, Cpu, ShieldCheck, Edit2, Trash2 } from 'lucide-react';
import { fetchStudentDetail } from '../api/leaderboardApi';
import { CategoryBadge } from './CategoryBadge';
import { calculateCompositeScore } from '../data/sampleData';

export function StudentDetailCard({ student, onClose, isAdmin = false, onEdit, onDelete }) {
  const [studentData, setStudentData] = useState(student);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!student) {
      setStudentData(null);
      return;
    }
    setStudentData(student);
    const rollNo = student.rollNo || student.registerNumber || student.id;
    if (!rollNo) return;

    let isMounted = true;
    setLoading(true);
    fetchStudentDetail(rollNo)
      .then((detail) => {
        if (isMounted && detail) {
          setStudentData((prev) => ({ ...prev, ...detail }));
        }
      })
      .catch((err) => {
        console.warn('Offline mode: Using client-side student profile data', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [student]);

  if (!student) return null;

  const current = studentData || student;

  // 1. Rankings & Institutional Standing
  const rankings = current.rankings || {};
  const collegeRank = rankings.collegeRank ?? current.collegeRank ?? current.rank ?? null;
  const yearRank = rankings.yearRank ?? current.yearRank;
  const deptRank = rankings.departmentRank ?? current.departmentRank;
  const classRank = rankings.classRank ?? current.classRank;
  const classSize = rankings.classSize ?? current.classSize ?? 60;
  const rawPercentile = rankings.percentile ?? current.percentile;
  const percentile = rawPercentile != null
    ? Number(rawPercentile).toFixed(1)
    : (classRank && classSize ? Math.max(0, Math.min(100, Math.round(((classSize - classRank) / classSize) * 100))).toFixed(1) : null);
  const overallScore = rankings.overallScore ?? current.overallScore ?? (current.compositeScore ?? calculateCompositeScore(current));

  // 2. Multi-Platform Performance Isolation list
  let platformList = Array.isArray(current.platformPerformance) && current.platformPerformance.length > 0
    ? current.platformPerformance
    : [];

  // Fallback if platformPerformance array is empty (offline or legacy object)
  if (platformList.length === 0) {
    const lc = current.leetcode || {};
    const pgp = current.pgp || {};

    if (lc.leetcodeId || current.leetcodeId || (lc.solvedTotal ?? current.lcSolvedTotal ?? 0) > 0 || (lc.contestRating ?? current.lcContestRating ?? 0) > 0) {
      platformList.push({
        platformName: 'LeetCode',
        platformUsername: lc.leetcodeId || current.leetcodeId || 'N/A',
        problemsSolved: lc.solvedTotal ?? current.lcSolvedTotal ?? 0,
        rating: lc.contestRating ?? current.lcContestRating ?? 1500,
        contestRating: lc.contestRating ?? current.lcContestRating ?? 1500,
        globalRank: lc.globalRank ?? current.lcGlobalRank ?? 0,
        easy: lc.solvedEasy ?? current.lcSolvedEasy ?? 0,
        medium: lc.solvedMedium ?? current.lcSolvedMedium ?? 0,
        hard: lc.solvedHard ?? current.lcSolvedHard ?? 0,
        contestsAttended: lc.contestAttended ?? current.lcContestsAttended ?? 0
      });
    }

    if ((pgp.points ?? current.pgpPoints ?? 0) > 0 || (pgp.programsSolved ?? current.pgpProgramsSolved ?? 0) > 0) {
      platformList.push({
        platformName: 'SkillRack',
        platformUsername: pgp.skillrackUsername || current.rollNo,
        problemsSolved: pgp.programsSolved ?? current.pgpProgramsSolved ?? 0,
        assessmentScore: pgp.points ?? current.pgpPoints ?? 0,
        globalRank: pgp.skillrackRank ?? current.pgpSkillrackRank ?? 0,
        dc: pgp.dc ?? current.pgpDc ?? 0,
        dt: pgp.dt ?? current.pgpDt ?? 0,
        codeTests: pgp.codeTests ?? current.pgpCodeTests ?? 0
      });
    }
  }

  // 3. Badges calculation
  const badges = [];
  const weeklyScore = current.weeklyAssessment?.score ?? current.weeklyScore ?? 0;
  const weeklyRank = current.weeklyAssessment?.rank ?? current.weeklyRank ?? 0;

  if (percentile && Number(percentile) >= 95) badges.push({ title: 'Top 5% Class Elite', color: '#10B981' });
  if (collegeRank != null && collegeRank <= 5) badges.push({ title: `College Top 5 (#${collegeRank})`, color: '#FFB800' });
  if (weeklyScore >= 100) badges.push({ title: 'Centum Weekly Achiever (100+)', color: '#FFB800' });
  if (weeklyRank > 0 && weeklyRank <= 10) badges.push({ title: `Weekly Top 10 (#${weeklyRank})`, color: '#3B82F6' });
  if (platformList.length >= 3) badges.push({ title: 'Multi-Platform Master', color: '#8B5CF6' });

  const getPlatformIcon = (name = '') => {
    const n = name.toLowerCase();
    if (n.includes('leet')) return <Code size={20} color="#FFA116" />;
    if (n.includes('skill') || n.includes('pgp')) return <Zap size={20} color="#FFB800" />;
    if (n.includes('atcoder')) return <Globe size={20} color="#3B82F6" />;
    if (n.includes('codeforces')) return <Award size={20} color="#EF4444" />;
    if (n.includes('degre')) return <Cpu size={20} color="#10B981" />;
    return <Trophy size={20} color="var(--sece-gold-500)" />;
  };

  return (
    <div className="student-inline-card" onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      <div className="modal-header premium-header" style={{ color: '#FFF', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #FFB800, #FFC72C)', color: '#002855', fontWeight: 900, fontSize: '1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(255, 184, 0, 0.4)', flexShrink: 0 }}>
            {current.name ? current.name.charAt(0).toUpperCase() : 'S'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF', margin: 0 }}>{current.name}</h3>
              <CategoryBadge category={current.category} score={overallScore} />
              {loading && <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px' }}>Syncing 360°...</span>}
            </div>
            <p style={{ fontSize: '0.8rem', color: '#FFC72C', fontFamily: 'var(--font-mono)', margin: '3px 0 0 0' }}>
              Roll: {current.rollNo || current.registerNumber} • {current.department} {current.academicYear ? `• Year ${current.academicYear}` : ''} {current.section ? `• Sec ${current.section}` : ''} {current.gender ? `• ${current.gender}` : ''} • ({current.batch || '2024-2028'})
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isAdmin && (
            <>
              <button
                type="button"
                className="btn btn-navy"
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                onClick={() => onEdit && onEdit(current)}
                title="Edit coder details"
              >
                <Edit2 size={13} />
                <span>Edit</span>
              </button>
              <button
                type="button"
                className="btn btn-navy"
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', borderColor: 'rgba(239,68,68,0.5)', color: '#EF4444' }}
                onClick={() => {
                  const roll = current.rollNo || current.registerNumber || current.id;
                  if (onDelete && roll) onDelete(roll);
                }}
                title="Delete coder record"
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>
            </>
          )}
          {onClose && (
            <button
              type="button"
              className="btn btn-navy"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              onClick={onClose}
              title="Close expanded details"
            >
              <X size={15} />
              <span>Close</span>
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: '1.25rem' }}>
        {/* 1. Dynamic Rankings & Institutional Standing */}
        <div style={{ background: 'linear-gradient(135deg, rgba(0, 40, 85, 0.04), rgba(255, 184, 0, 0.06))', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Trophy size={18} color="var(--sece-gold-500)" />
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--sece-navy-900)' }}>
                Institutional Rankings &amp; Standing
              </h4>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Composite Score:</span>
              <span style={{ background: 'var(--sece-navy-900)', color: '#FFC72C', fontWeight: 900, padding: '2px 9px', borderRadius: '8px', fontSize: '0.85rem' }}>
                ⭐ {Math.round(Number(overallScore)).toLocaleString()} pts
              </span>
            </div>
          </div>

          {/* 6-Card Institutional Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.5rem', textAlign: 'center' }}>
            {/* College Rank */}
            <div style={{ background: 'var(--bg-card)', padding: '0.65rem 0.4rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: collegeRank && collegeRank <= 3 ? '#D99B00' : 'var(--sece-navy-800)' }}>
                {collegeRank ? `#${collegeRank}` : '—'}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, marginTop: '2px' }}>College Rank</div>
            </div>

            {/* Year Rank */}
            <div style={{ background: 'var(--bg-card)', padding: '0.65rem 0.4rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--sece-navy-700)' }}>
                {yearRank ? `#${yearRank}` : '—'}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, marginTop: '2px' }}>Year Rank</div>
            </div>

            {/* Dept Rank */}
            <div style={{ background: 'var(--bg-card)', padding: '0.65rem 0.4rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0056B3' }}>
                {deptRank ? `#${deptRank}` : '—'}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, marginTop: '2px' }}>Dept Rank</div>
            </div>

            {/* Class Rank */}
            <div style={{ background: 'var(--bg-card)', padding: '0.65rem 0.4rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#059669' }}>
                {classRank ? `#${classRank}` : '—'}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, marginTop: '2px' }}>Class Rank</div>
            </div>

            {/* Class Size */}
            <div style={{ background: 'var(--bg-card)', padding: '0.65rem 0.4rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-main)' }}>
                {classSize || '60'}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, marginTop: '2px' }}>Class Size</div>
            </div>

            {/* Percentile */}
            <div style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.2))', padding: '0.65rem 0.4rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#059669' }}>
                {percentile ? `${percentile}%` : '—'}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#047857', fontWeight: 800, marginTop: '2px' }}>Percentile</div>
            </div>
          </div>
        </div>

        {/* Achievement Badges */}
        {badges.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
              Earned Achievements &amp; Honors
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {badges.map((b, i) => (
                <span key={i} className="badge-animated" style={{ background: 'var(--bg-card)', color: 'var(--text-main)', border: `1px solid ${b.color}`, padding: '0.25rem 0.65rem', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Star size={12} color={b.color} fill={b.color} />
                  {b.title}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 2. Dynamic Multi-Platform Performance Cards */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ShieldCheck size={15} color="var(--sece-navy-600)" />
            <span>Multi-Platform Performance Isolation</span>
          </div>

          {platformList.length === 0 ? (
            <div style={{ padding: '1rem', textAlign: 'center', background: 'var(--bg-primary)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No external coding platform records connected yet.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
              {platformList.map((platform, idx) => {
                const pName = platform.platformName || 'Platform';
                const pUser = platform.platformUsername || platform.username || 'N/A';
                const pSolved = platform.problemsSolved ?? 0;
                const pRating = platform.contestRating ?? platform.rating ?? null;
                const pScore = platform.assessmentScore ?? null;
                const pRank = platform.globalRank ?? null;

                return (
                  <div key={idx} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.85rem' }}>
                    {/* Platform Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.35rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {getPlatformIcon(pName)}
                        <h5 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: 'var(--sece-navy-900)' }}>
                          {pName}
                        </h5>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          @{pUser}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                        {pSolved > 0 && (
                          <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#059669', padding: '2px 7px', borderRadius: '5px', fontSize: '0.75rem', fontWeight: 800 }}>
                            {pSolved} Solved
                          </span>
                        )}
                        {pRating != null && Number(pRating) > 0 && (
                          <span style={{ background: 'var(--sece-navy-100)', color: 'var(--sece-navy-900)', padding: '2px 7px', borderRadius: '5px', fontSize: '0.75rem', fontWeight: 800 }}>
                            Rating: {Math.round(Number(pRating))}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Platform Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(85px, 1fr))', gap: '0.4rem', textAlign: 'center' }}>
                      <div style={{ background: 'var(--bg-card)', padding: '0.4rem', borderRadius: '6px' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#10B981' }}>{pSolved}</div>
                        <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Problems Solved</div>
                      </div>

                      {pRating != null && Number(pRating) > 0 && (
                        <div style={{ background: 'var(--bg-card)', padding: '0.4rem', borderRadius: '6px' }}>
                          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--sece-navy-700)' }}>
                            🔥 {Math.round(Number(pRating))}
                          </div>
                          <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Contest Rating</div>
                        </div>
                      )}

                      {pScore != null && Number(pScore) > 0 && (
                        <div style={{ background: 'var(--bg-card)', padding: '0.4rem', borderRadius: '6px' }}>
                          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#D97706' }}>
                            {Number(pScore).toLocaleString()}
                          </div>
                          <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Score</div>
                        </div>
                      )}

                      {pRank != null && Number(pRank) > 0 && Number(pRank) < 900000 && (
                        <div style={{ background: 'var(--bg-card)', padding: '0.4rem', borderRadius: '6px' }}>
                          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--sece-gold-600)' }}>
                            #{Number(pRank).toLocaleString()}
                          </div>
                          <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Global Rank</div>
                        </div>
                      )}

                      {platform.easy !== undefined && (
                        <div style={{ background: 'var(--bg-card)', padding: '0.4rem', borderRadius: '6px' }}>
                          <div style={{ fontWeight: 800, fontSize: '0.8rem', display: 'flex', justifyContent: 'center', gap: '3px' }}>
                            <span style={{ color: '#10B981' }}>{platform.easy}E</span>
                            <span style={{ color: '#F59E0B' }}>{platform.medium}M</span>
                            <span style={{ color: '#EF4444' }}>{platform.hard}H</span>
                          </div>
                          <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Difficulty Spread</div>
                        </div>
                      )}

                      {platform.dc !== undefined && (
                        <div style={{ background: 'var(--bg-card)', padding: '0.4rem', borderRadius: '6px' }}>
                          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                            {platform.dc} / {platform.dt}
                          </div>
                          <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>DC / DT</div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Weekly Assessment Section (if available) */}
        {weeklyScore > 0 && (
          <div style={{ background: 'var(--bg-primary)', padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <h5 style={{ fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--sece-navy-700)', margin: 0 }}>
                <Target size={15} color="#FFB800" /> Weekly Assessment Summary
              </h5>
              <span style={{ fontWeight: 900, fontSize: '0.8rem', color: '#D97706' }}>
                Score: {weeklyScore} pts {weeklyScore >= 100 ? '💯' : ''}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem', textAlign: 'center' }}>
              <div style={{ background: 'var(--bg-card)', padding: '0.4rem', borderRadius: '6px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#10B981' }}>{current.weeklyAssessment?.codeScore ?? current.weeklyCodeScore ?? 0} / 4</div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Programs Solved</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '0.4rem', borderRadius: '6px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#2563EB' }}>{current.weeklyAssessment?.mcqScore ?? current.weeklyMcqScore ?? 0} / 100</div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>MCQ Aptitude</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '0.4rem', borderRadius: '6px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--sece-gold-600)' }}>{weeklyRank > 0 ? `#${weeklyRank}` : 'N/A'}</div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Assessment Rank</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
