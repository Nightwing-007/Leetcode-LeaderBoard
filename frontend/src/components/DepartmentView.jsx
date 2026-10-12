import React from 'react';
import { Award, BarChart2, Trophy, Crown, Zap, Sparkles, Users } from 'lucide-react';
import { COLLEGE_DEPARTMENTS, calculateCompositeScore } from '../data/sampleData';

// Helper to determine student's category tier (Elite, Specialist, Challenger, Solver, Starter)
function getStudentCategoryTier(student) {
  if (student.category) {
    const lower = String(student.category).trim().toLowerCase();
    if (lower === 'elite') return 'Elite';
    if (lower === 'specialist') return 'Specialist';
    if (lower === 'challenger') return 'Challenger';
    if (lower === 'solver') return 'Solver';
    return 'Starter';
  }
  const score = student.overallScore != null ? Number(student.overallScore) : (student.compositeScore ?? calculateCompositeScore(student));
  if (score >= 500) {
    if (score >= 3500) return 'Elite';
    if (score >= 2500) return 'Specialist';
    if (score >= 1500) return 'Challenger';
    if (score >= 800) return 'Solver';
    return 'Starter';
  } else {
    if (score >= 80) return 'Elite';
    if (score >= 60) return 'Specialist';
    if (score >= 40) return 'Challenger';
    if (score >= 20) return 'Solver';
    return 'Starter';
  }
}

export function DepartmentView({ students, onSelectStudent, activeTab = 'college' }) {
  const depts = COLLEGE_DEPARTMENTS.filter(d => d !== 'All');
  const isWeekly = activeTab === 'weekly';
  const isTopperTab = ['college', 'year', 'department', 'dept_year', 'class', 'overall'].includes(activeTab);
  const isPgp = activeTab === 'pgp' || (!isWeekly && !isTopperTab && activeTab !== 'leetcode' && students.some(s => (s.pgp?.points ?? s.pgpPoints ?? 0) > 0));

  const deptStats = depts.map(deptName => {
    const deptStudents = students.filter(s => s.department === deptName);
    const count = deptStudents.length;

    if (count === 0) return null;

    let topStudent;
    let totalMetric = 0;
    let avgScore = 0;
    let topScore = 0;
    let metricLabel = 'Top Solved';
    let avgLabel = 'Avg Rating';

    if (isTopperTab) {
      const getScore = (s) => s.overallScore != null ? Number(s.overallScore) : (s.compositeScore ?? calculateCompositeScore(s));
      topStudent = [...deptStudents].sort((a, b) => getScore(b) - getScore(a))[0];
      topScore = topStudent ? Math.round(getScore(topStudent)) : 0;
      avgScore = Math.round(deptStudents.reduce((sum, s) => sum + getScore(s), 0) / count);
      totalMetric = deptStudents.reduce((sum, s) => sum + (s.leetcode?.solvedTotal ?? s.lcSolvedTotal ?? 0) + (s.pgp?.programsSolved ?? s.pgpProgramsSolved ?? 0), 0);
      metricLabel = 'Topper Score';
      avgLabel = 'Avg Score';
    } else if (isWeekly) {
      topStudent = [...deptStudents].sort((a, b) => {
        const sa = a.weeklyAssessment?.score ?? a.weeklyScore ?? 0;
        const sb = b.weeklyAssessment?.score ?? b.weeklyScore ?? 0;
        return sb - sa;
      })[0];
      topScore = topStudent ? (topStudent.weeklyAssessment?.score ?? topStudent.weeklyScore ?? 0) : 0;
      avgScore = Math.round(deptStudents.reduce((sum, s) => sum + (s.weeklyAssessment?.score ?? s.weeklyScore ?? 0), 0) / count);
      totalMetric = deptStudents.reduce((sum, s) => sum + (s.weeklyAssessment?.codeScore ?? s.weeklyCodeScore ?? 0), 0);
      metricLabel = 'Test Score';
      avgLabel = 'Avg Score';
    } else if (isPgp) {
      topStudent = [...deptStudents].sort((a, b) => (b.pgp?.points ?? b.pgpPoints ?? 0) - (a.pgp?.points ?? a.pgpPoints ?? 0))[0];
      topScore = topStudent ? (topStudent.pgp?.points ?? topStudent.pgpPoints ?? 0) : 0;
      avgScore = Math.round(deptStudents.reduce((sum, s) => sum + (s.pgp?.points ?? s.pgpPoints ?? 0), 0) / count);
      totalMetric = deptStudents.reduce((sum, s) => sum + (s.pgp?.programsSolved ?? s.pgpProgramsSolved ?? 0), 0);
      metricLabel = 'Top Points';
      avgLabel = 'Avg Points';
    } else {
      topStudent = [...deptStudents].sort((a, b) => (b.leetcode?.solvedTotal ?? b.lcSolvedTotal ?? 0) - (a.leetcode?.solvedTotal ?? a.lcSolvedTotal ?? 0))[0];
      topScore = topStudent ? (topStudent.leetcode?.solvedTotal ?? topStudent.lcSolvedTotal ?? 0) : 0;
      avgScore = Math.round(deptStudents.reduce((sum, s) => sum + (s.leetcode?.contestRating ?? s.lcContestRating ?? 0), 0) / count);
      totalMetric = deptStudents.reduce((sum, s) => sum + (s.leetcode?.solvedTotal ?? s.lcSolvedTotal ?? 0), 0);
      metricLabel = 'Top Solved';
      avgLabel = 'Avg Rating';
    }

    return {
      dept: deptName,
      count,
      topStudent,
      totalMetric,
      totalSolved: totalMetric || 0,
      avgScore,
      topScore,
      metricLabel,
      avgLabel,
      isPgp,
      isWeekly,
      isTopperTab
    };
  }).filter(Boolean);

  // Sort departments by totalSolved descending for ranking
  const sortedDeptStats = [...deptStats].sort((a, b) => (b.totalSolved ?? 0) - (a.totalSolved ?? 0));
  const maxTotalSolved = Math.max(...deptStats.map(d => d.totalSolved ?? d.totalMetric ?? 0), 1);

  // Build rank map for medal display
  const deptRankMap = {};
  sortedDeptStats.forEach((ds, idx) => { deptRankMap[ds.dept] = idx + 1; });

  // -------------------------------------------------------------
  // Category Breakdown: Elites and Specialists per department
  // -------------------------------------------------------------
  const deptCategoryStats = depts.map(deptName => {
    const deptStudents = students.filter(s => s.department === deptName);
    const count = deptStudents.length;
    if (count === 0) return null;

    let elites = 0;
    let specialists = 0;
    let challengers = 0;
    let solvers = 0;
    let starters = 0;

    deptStudents.forEach(st => {
      const tier = getStudentCategoryTier(st);
      if (tier === 'Elite') elites++;
      else if (tier === 'Specialist') specialists++;
      else if (tier === 'Challenger') challengers++;
      else if (tier === 'Solver') solvers++;
      else starters++;
    });

    return {
      dept: deptName,
      count,
      elites,
      specialists,
      challengers,
      solvers,
      starters,
      combinedEliteSpec: elites + specialists
    };
  }).filter(Boolean);

  // Department with the most elite counts
  const sortedByElites = [...deptCategoryStats].sort((a, b) => {
    if (b.elites !== a.elites) return b.elites - a.elites;
    if (b.specialists !== a.specialists) return b.specialists - a.specialists;
    return b.count - a.count;
  });

  const topEliteDept = sortedByElites[0] || null;
  const maxElitesInDept = Math.max(...deptCategoryStats.map(d => d.elites), 1);
  const maxCombinedCount = Math.max(...deptCategoryStats.map(d => d.elites + d.specialists), 1);
  const totalElitesCollege = deptCategoryStats.reduce((sum, d) => sum + d.elites, 0);
  const totalSpecialistsCollege = deptCategoryStats.reduce((sum, d) => sum + d.specialists, 0);

  return (
    <section style={{ marginTop: '2.5rem' }}>
      <div className="section-header">
        <h2 className="section-title">
          <Award size={26} color="var(--sece-gold-500)" />
          <span>Department Performance &amp; Benchmarks</span>
        </h2>
      </div>

      {/* Grid of Department Champions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {deptStats.map(ds => {
          const deptRank = deptRankMap[ds.dept];
          return (
            <div
              key={ds.dept}
              className="dept-champion-card"
              onClick={() => ds.topStudent && onSelectStudent && onSelectStudent(ds.topStudent)}
            >
              {/* Department rank medal */}
              {deptRank <= 3 && (
                <div className={`dept-rank-medal ${deptRank === 1 ? 'gold' : deptRank === 2 ? 'silver' : 'bronze'}`}>
                  {deptRank === 1 ? '🥇' : deptRank === 2 ? '🥈' : '🥉'}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '0.75rem' }}>
                <span className="dept-tag" style={{ fontSize: '0.9rem', padding: '0.35rem 0.75rem' }}>
                  {ds.dept}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {ds.count} Students
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--sece-navy-100)', color: 'var(--sece-navy-700)', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                  {ds.topStudent?.name ? ds.topStudent.name.charAt(0) : 'S'}
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--sece-gold-600)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Trophy size={12} /> #1 Dept Topper
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px' }}>
                    {ds.topStudent?.name || 'N/A'}
                  </div>
                </div>
              </div>

              <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--border-color)' }}>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--sece-navy-500)' }}>
                    {(ds.topScore ?? 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {ds.metricLabel}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--sece-gold-600)' }}>
                    {(ds.avgScore ?? 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {ds.avgLabel}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Side-by-Side Half Charts Container */}
      <div
        className="dept-dual-charts-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))',
          gap: '1.5rem',
          alignItems: 'stretch'
        }}
      >
        {/* Left Half: Existing Coding Problems Solved Bar Chart */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart2 size={20} color="var(--sece-navy-600)" />
              <span>
                {isWeekly
                  ? 'Total Solved by Dept (Weekly Test)'
                  : (isPgp ? 'Total Solved by Dept (SkillRack / PGP)' : (isTopperTab ? 'Total Solved Coding Problems by Dept' : 'Total LeetCode Problems Solved'))}
              </span>
            </h3>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', background: 'var(--bg-primary)', padding: '3px 8px', borderRadius: '6px' }}>
              Sorted by Volume
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, justifyContent: 'space-around' }}>
            {sortedDeptStats.map(ds => {
              const currentVal = ds.totalSolved ?? ds.totalMetric ?? 0;
              const pct = Math.round((currentVal / maxTotalSolved) * 100);
              return (
                <div key={ds.dept}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem', fontWeight: 700 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="dept-tag" style={{ fontSize: '0.75rem', padding: '1px 6px' }}>{ds.dept}</span>
                    </span>
                    <span style={{ color: 'var(--text-main)', fontFeatureSettings: '"tnum"' }}>
                      {currentVal.toLocaleString()} {isWeekly ? 'problems' : 'solved'} ({pct}%)
                    </span>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Half: Elite & Specialist Categories by Department */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} color="var(--sece-gold-500)" />
              <span>Department Category Tiers (Elites &amp; Specialists)</span>
            </h3>

            {/* Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.75rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#B45309', fontWeight: 800 }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#F59E0B' }} />
                💎 Elite
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#6D28D9', fontWeight: 800 }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#8B5CF6' }} />
                ⚡ Specialist
              </span>
            </div>
          </div>

          {/* Top Elite Department Standout Callout Banner */}
          {topEliteDept && topEliteDept.elites > 0 && (
            <div
              className="top-elite-banner"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 184, 0, 0.12) 0%, rgba(217, 155, 0, 0.05) 100%)',
                border: '1.5px solid var(--sece-gold-500)',
                borderRadius: '12px',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.25rem',
                flexWrap: 'wrap',
                gap: '0.6rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255, 184, 0, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Crown size={20} color="#D99B00" />
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--sece-gold-600)' }}>
                    Department with Most Elite Coders
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-main)' }}>
                    {topEliteDept.dept} Department leads with {topEliteDept.elites} Elites
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#D97706', border: '1px solid rgba(245, 158, 11, 0.35)', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                  💎 {topEliteDept.elites} Elites
                </span>
                <span style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6', border: '1px solid rgba(139, 92, 246, 0.35)', padding: '3px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                  ⚡ {topEliteDept.specialists} Specialists
                </span>
              </div>
            </div>
          )}

          {/* Department Breakdown Bar Comparison */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, justifyContent: 'space-around' }}>
            {sortedByElites.map(ds => {
              const isLeader = topEliteDept && ds.dept === topEliteDept.dept && ds.elites > 0;
              // Bar width relative to max combined count
              const elitePct = Math.round((ds.elites / maxCombinedCount) * 100);
              const specPct = Math.round((ds.specialists / maxCombinedCount) * 100);

              return (
                <div key={ds.dept}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', fontSize: '0.85rem', fontWeight: 700 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="dept-tag" style={{ fontSize: '0.75rem', padding: '1px 6px' }}>{ds.dept}</span>
                      {isLeader && (
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#D99B00', background: 'rgba(255, 184, 0, 0.15)', padding: '1px 5px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <Crown size={11} /> #1 Elite Dept
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                      <span style={{ color: '#B45309', fontWeight: 800 }}>
                        💎 {ds.elites}
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>•</span>
                      <span style={{ color: '#6D28D9', fontWeight: 800 }}>
                        ⚡ {ds.specialists}
                      </span>
                      <span style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>
                        ({ds.count} coders)
                      </span>
                    </div>
                  </div>

                  {/* Dual Segmented Progress Bar */}
                  <div
                    style={{
                      width: '100%',
                      height: '12px',
                      background: 'var(--bg-primary)',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      display: 'flex',
                      position: 'relative',
                      border: '1px solid var(--border-light)'
                    }}
                  >
                    {/* Elite Bar (Gold) */}
                    <div
                      style={{
                        width: `${elitePct}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%)',
                        transition: 'width 0.8s ease',
                        borderRight: ds.specialists > 0 ? '1px solid rgba(255,255,255,0.4)' : 'none'
                      }}
                      title={`${ds.dept}: ${ds.elites} Elite Coders`}
                    />
                    {/* Specialist Bar (Purple) */}
                    <div
                      style={{
                        width: `${specPct}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #8B5CF6 0%, #A78BFA 100%)',
                        transition: 'width 0.8s ease'
                      }}
                      title={`${ds.dept}: ${ds.specialists} Specialist Coders`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Totals */}
          <div
            style={{
              marginTop: '1.25rem',
              paddingTop: '0.85rem',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}
          >
            <span>Institutional Category Pool</span>
            <div style={{ display: 'flex', gap: '0.75rem', fontWeight: 800 }}>
              <span style={{ color: '#B45309' }}>Total Elites: {totalElitesCollege}</span>
              <span style={{ color: '#6D28D9' }}>Total Specialists: {totalSpecialistsCollege}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
