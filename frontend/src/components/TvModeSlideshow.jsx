import React, { useState, useEffect } from 'react';
import { X, Trophy, Award, Flame, Star, Play, Pause, Users, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { COLLEGE_DEPARTMENTS, COLLEGE_BATCHES } from '../data/sampleData';

export function TvModeSlideshow({ students, onCloseTvMode, soundEnabled }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const SLIDE_DURATION = 9000;

  // Helper score calculation
  const getStudentScore = (s) => {
    const pgpPts = s.pgp?.points ?? s.pgpPoints ?? 0;
    const lcSolved = s.leetcode?.solvedTotal ?? s.lcSolvedTotal ?? 0;
    const lcRating = s.leetcode?.contestRating ?? s.lcContestRating ?? 1500;
    if (pgpPts > 0) return pgpPts;
    return (lcRating * 2) + (lcSolved * 1.5);
  };

  const getStudentDisplayStat = (s) => {
    const pgpPts = s.pgp?.points ?? s.pgpPoints ?? 0;
    const lcSolved = s.leetcode?.solvedTotal ?? s.lcSolvedTotal ?? 0;
    if (pgpPts > 0) return `${pgpPts.toLocaleString()} PGP pts`;
    return `${lcSolved} LC Solved`;
  };

  // Top overall performers
  const sortedOverall = [...students].sort((a, b) => getStudentScore(b) - getStudentScore(a));
  const top10 = sortedOverall.slice(0, 10);

  // Weekly Assessment Toppers (Last Week's Test)
  const weeklyStudents = [...students].filter(s => (s.weeklyAssessment?.score ?? s.weeklyScore ?? 0) > 0);
  const sortedWeekly = weeklyStudents.sort((a, b) => {
    const sa = a.weeklyAssessment?.score ?? a.weeklyScore ?? 0;
    const sb = b.weeklyAssessment?.score ?? b.weeklyScore ?? 0;
    if (sb !== sa) return sb - sa;
    const ra = a.weeklyAssessment?.rank ?? a.weeklyRank ?? 999999;
    const rb = b.weeklyAssessment?.rank ?? b.weeklyRank ?? 999999;
    return ra - rb;
  });
  const top10Weekly = sortedWeekly.slice(0, 10);
  const centumCount = weeklyStudents.filter(s => (s.weeklyAssessment?.score ?? s.weeklyScore ?? 0) >= 100).length;
  const testTitle = weeklyStudents[0]?.weeklyAssessment?.testName || "Weekly Assessment #003 (SkillRack)";

  // Department Champions
  const allDepts = COLLEGE_DEPARTMENTS.filter(d => d !== 'All');
  const deptChampions = allDepts.map(d => {
    const deptStudents = students.filter(s => s.department === d);
    const top = deptStudents.sort((a, b) => getStudentScore(b) - getStudentScore(a))[0];
    return { dept: d, student: top };
  }).filter(item => item.student);

  // Batch-wise Toppers
  const allBatches = COLLEGE_BATCHES.filter(b => b !== 'All');
  const batchToppers = allBatches.map(batchName => {
    const top = students.filter(s => s.batch === batchName).sort((a, b) => getStudentScore(b) - getStudentScore(a))[0];
    return { batch: batchName, student: top };
  }).filter(item => item.student);

  // PGP / LeetCode Titans
  const sortedTitans = [...students].sort((a, b) => {
    const pa = a.pgp?.programsSolved ?? a.pgpProgramsSolved ?? (a.leetcode?.solvedTotal ?? a.lcSolvedTotal ?? 0);
    const pb = b.pgp?.programsSolved ?? b.pgpProgramsSolved ?? (b.leetcode?.solvedTotal ?? b.lcSolvedTotal ?? 0);
    return pb - pa;
  }).slice(0, 6);

  const TOTAL_SLIDES = 5;

  // Slide timer step
  useEffect(() => {
    if (!isPlaying) return;

    const intervalStep = 100;
    const increment = (intervalStep / SLIDE_DURATION) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setActiveSlide(s => (s + 1) % TOTAL_SLIDES);
          return 0;
        }
        return prev + increment;
      });
    }, intervalStep);

    return () => clearInterval(timer);
  }, [isPlaying, activeSlide]);

  useEffect(() => {
    if (activeSlide === 0 || activeSlide === 1) {
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.7 } });
    }
  }, [activeSlide]);

  return (
    <div className="tv-broadcast-overlay tv-light-theme">
      {/* TV Header Bar */}
      <div className="tv-header tv-header-light">
        <div className="tv-logo-group">
          <div className="tv-logo-badge">SE</div>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#FFFFFF' }}>
              Sri Eshwar College of Engineering
            </h1>
            <p style={{ color: '#FFC72C', fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.05em' }}>
              CAMPUS CODING &amp; SKILLRACK PGP LEADERBOARD • SMART TV BROADCAST
            </p>
          </div>
        </div>

        {/* Navigation Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.18)', padding: '0.4rem 0.9rem', borderRadius: '30px' }}>
            {[0, 1, 2, 3, 4].map(idx => (
              <button
                key={idx}
                onClick={() => { setActiveSlide(idx); setProgress(0); }}
                style={{
                  width: idx === activeSlide ? '30px' : '12px',
                  height: '12px',
                  borderRadius: '6px',
                  background: idx === activeSlide ? '#FFB800' : 'rgba(255,255,255,0.5)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </div>

          <button
            className="btn btn-navy"
            style={{ padding: '0.45rem 0.8rem', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#FFF' }}
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>

          <button
            className="btn btn-navy"
            style={{ padding: '0.45rem 0.8rem', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#FFF' }}
            onClick={onCloseTvMode}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Slide Progress Bar */}
      <div style={{ height: '4px', background: 'rgba(255,255,255,0.15)', width: '100%' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: '#FFB800', transition: 'width 0.1s linear' }} />
      </div>

      {/* Main Slide Content */}
      <div className="tv-content-container" style={{ padding: '2rem 3rem', flex: 1, overflowY: 'auto' }}>
        {/* Slide 0: Top 10 Hall of Fame Overall */}
        {activeSlide === 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Trophy size={32} color="#D99B00" />
                <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--sece-navy-900)', margin: 0 }}>
                  Top 10 College Champions • Hall of Fame
                </h2>
              </div>
              <span className="dept-tag" style={{ background: 'var(--sece-gold-500)', color: '#002855', fontWeight: 800, fontSize: '0.9rem', padding: '0.4rem 1rem' }}>
                Cumulative PGP Rank
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              {top10.map((st, idx) => (
                <div key={st.rollNo || idx} className="stat-card" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className={`rank-pill rank-${idx < 3 ? idx + 1 : 'other'}`} style={{ fontSize: '1.1rem', padding: '0.35rem 0.85rem' }}>
                      #{idx + 1}
                    </span>
                    <div>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>{st.name}</h4>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {st.rollNo} • {st.department} ({st.batch || '2024-2028'})
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--sece-gold-600)' }}>
                      {getStudentDisplayStat(st)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                      {(st.pgp?.programsSolved ?? st.pgpProgramsSolved ?? 0) > 0 ? `${st.pgp?.programsSolved ?? st.pgpProgramsSolved} Solved` : 'Rank Score'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Slide 1: Last Week's Weekly Assessment Toppers (SkillRack) */}
        {activeSlide === 1 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Zap size={32} color="#FFB800" />
                <div>
                  <h2 style={{ fontSize: '1.9rem', fontWeight: 900, color: 'var(--sece-navy-900)', margin: 0 }}>
                    🎯 Last Week's Weekly Assessment Toppers
                  </h2>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    SkillRack Assessment • {testTitle}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <span style={{ background: 'var(--sece-navy-900)', color: '#FFF', fontWeight: 800, fontSize: '0.9rem', padding: '0.45rem 1rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Star size={16} color="#FFB800" /> Centum Scorers: {centumCount}
                </span>
                <span style={{ background: 'var(--sece-gold-500)', color: '#002855', fontWeight: 800, fontSize: '0.9rem', padding: '0.45rem 1rem', borderRadius: '20px' }}>
                  {weeklyStudents.length > 0 ? `${weeklyStudents.length} Candidates` : 'Assessment Results'}
                </span>
              </div>
            </div>

            {top10Weekly.length === 0 ? (
              <div className="stat-card" style={{ padding: '3rem', textAlign: 'center', justifyContent: 'center' }}>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>
                  Upload <strong>CandidateRankingDetails.xlsx</strong> in the upload modal to display Last Week's Assessment Toppers live!
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                {top10Weekly.map((st, idx) => {
                  const score = st.weeklyAssessment?.score ?? st.weeklyScore ?? 0;
                  const codeScore = st.weeklyAssessment?.codeScore ?? st.weeklyCodeScore ?? 0;
                  const mcqScore = st.weeklyAssessment?.mcqScore ?? st.weeklyMcqScore ?? 0;
                  const rank = st.weeklyAssessment?.rank ?? st.weeklyRank ?? (idx + 1);
                  const isCentum = score >= 100;

                  return (
                    <div
                      key={st.rollNo || idx}
                      className="stat-card"
                      style={{
                        padding: '1rem 1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderLeft: isCentum ? '5px solid var(--sece-gold-500)' : '1px solid var(--border-color)',
                        background: idx < 3 ? 'var(--bg-card-hover)' : 'var(--bg-card)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span
                          className={`rank-pill rank-${rank <= 3 ? rank : 'other'}`}
                          style={{ fontSize: '1.1rem', padding: '0.35rem 0.85rem' }}
                        >
                          #{rank}
                        </span>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <h4 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                              {st.name}
                            </h4>
                            {isCentum && (
                              <span style={{ background: '#FFB800', color: '#002855', fontSize: '0.7rem', fontWeight: 900, padding: '0.15rem 0.45rem', borderRadius: '6px' }}>
                                100+ PERFECT
                              </span>
                            )}
                          </div>
                          <p style={{ margin: '3px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {st.rollNo} • <span style={{ fontWeight: 700, color: 'var(--sece-navy-700)' }}>{st.department}</span> ({st.batch || '2024-2028'})
                          </p>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.45rem', fontWeight: 900, color: isCentum ? '#D99B00' : 'var(--sece-navy-700)' }}>
                          {score} pts
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          Code: <strong style={{ color: '#10B981' }}>{codeScore}/4</strong> • MCQ: <strong style={{ color: '#3B82F6' }}>{mcqScore}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Slide 2: Department Champions */}
        {activeSlide === 2 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Award size={32} color="var(--sece-navy-700)" />
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--sece-navy-900)' }}>
                Department Toppers • Benchmark Leaders
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
              {deptChampions.map(({ dept, student }) => (
                <div key={dept} className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '0.75rem' }}>
                    <span className="dept-tag" style={{ fontSize: '0.95rem' }}>{dept}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--sece-gold-600)' }}>#1 Topper</span>
                  </div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.25rem' }}>{student.name}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{student.rollNo} • {student.batch || '2024-2028'}</p>
                  <div style={{ width: '100%', paddingTop: '0.6rem', borderTop: '1px dashed var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 800, color: 'var(--sece-navy-700)', fontSize: '1.1rem' }}>
                      {getStudentDisplayStat(student)}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                      {(student.pgp?.skillrackRank ?? student.pgpSkillrackRank ?? 0) > 0 ? `Rank #${student.pgp?.skillrackRank ?? student.pgpSkillrackRank}` : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Slide 3: Program Solvers & Titans */}
        {activeSlide === 3 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Flame size={32} color="#DC2626" />
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--sece-navy-900)' }}>
                Coding Titans • Maximum Programs Solved
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
              {sortedTitans.map((st, idx) => {
                const solved = st.pgp?.programsSolved ?? st.pgpProgramsSolved ?? (st.leetcode?.solvedTotal ?? st.lcSolvedTotal ?? 0);
                const pts = st.pgp?.points ?? st.pgpPoints ?? (st.leetcode?.contestRating ?? st.lcContestRating ?? 0);
                return (
                  <div key={st.rollNo || idx} className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '0.5rem' }}>
                      <span className={`rank-pill rank-${idx < 3 ? idx + 1 : 'other'}`}>#{idx + 1}</span>
                      <span className="badge-dept">{st.department}</span>
                    </div>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0.35rem 0' }}>{st.name}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{st.rollNo} • {st.batch || '2024-2028'}</p>
                    <div style={{ width: '100%', paddingTop: '0.6rem', borderTop: '1px dashed var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 800, color: '#10B981', fontSize: '1.15rem' }}>{solved.toLocaleString()} Solved</span>
                      <span style={{ fontWeight: 800, color: 'var(--sece-gold-600)', fontSize: '1.05rem' }}>{pts.toLocaleString()} pts</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Slide 4: Batch Leaders */}
        {activeSlide === 4 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Star size={32} color="#D99B00" />
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--sece-navy-900)' }}>
                Batch Champions • Academic Cohorts
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
              {batchToppers.map(({ batch, student }) => (
                <div key={batch} className="stat-card" style={{ flexDirection: 'column', padding: '1.75rem', alignItems: 'center', textAlign: 'center' }}>
                  <div className="avatar-circle" style={{ width: '64px', height: '64px', fontSize: '1.75rem', marginBottom: '1rem' }}>
                    {student.name ? student.name.charAt(0) : 'S'}
                  </div>
                  <span className="dept-tag" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>{batch} Cohort</span>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.25rem' }}>{student.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{student.rollNo} • {student.department}</p>
                  <div style={{ background: 'var(--bg-primary)', padding: '0.75rem 1.5rem', borderRadius: '12px', width: '100%' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--sece-navy-700)' }}>
                      {getStudentDisplayStat(student)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
