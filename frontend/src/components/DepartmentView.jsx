import React from 'react';
import { Award, BarChart2 } from 'lucide-react';
import { COLLEGE_DEPARTMENTS } from '../data/sampleData';

export function DepartmentView({ students, onSelectStudent, activeTab = 'pgp' }) {
  const depts = COLLEGE_DEPARTMENTS.filter(d => d !== 'All');

  const deptStats = depts.map(deptName => {
    const deptStudents = students.filter(s => s.department === deptName);
    const count = deptStudents.length;

    if (count === 0) return null;

    const isWeekly = activeTab === 'weekly';
    const isPgp = activeTab === 'pgp' || (!isWeekly && deptStudents.some(s => (s.pgp?.points ?? s.pgpPoints ?? 0) > 0));

    let topStudent;
    let totalMetric = 0;
    let avgScore = 0;
    let topScore = 0;
    let metricLabel = 'Top Solved';
    let avgLabel = 'Avg Rating';

    if (isWeekly) {
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
      isWeekly
    };
  }).filter(Boolean);

  const maxTotalSolved = Math.max(...deptStats.map(d => d.totalSolved ?? d.totalMetric ?? 0), 1);

  const isWeekly = activeTab === 'weekly';
  const isPgp = activeTab === 'pgp';

  return (
    <section style={{ marginTop: '2.5rem' }}>
      <div className="section-header">
        <h2 className="section-title">
          <Award size={26} color="var(--sece-gold-500)" />
          <span>Department Performance &amp; Benchmarks</span>
        </h2>
      </div>

      {/* Grid of Department Champions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {deptStats.map(ds => (
          <div
            key={ds.dept}
            className="stat-card"
            style={{ flexDirection: 'column', alignItems: 'flex-start', cursor: 'pointer' }}
            onClick={() => ds.topStudent && onSelectStudent(ds.topStudent)}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '0.75rem' }}>
              <span className="dept-tag" style={{ fontSize: '0.9rem', padding: '0.35rem 0.75rem' }}>
                {ds.dept}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {ds.count} Students
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--sece-navy-100)', color: 'var(--sece-navy-700)', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {ds.topStudent?.name ? ds.topStudent.name.charAt(0) : 'S'}
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--sece-gold-600)', fontWeight: 700 }}>#1 Dept Topper</div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px' }}>
                  {ds.topStudent?.name || 'N/A'}
                </div>
              </div>
            </div>

            <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--border-color)' }}>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--sece-navy-700)' }}>
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
        ))}
      </div>

      {/* Visual Bar Comparison Chart */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart2 size={20} color="var(--sece-navy-600)" />
          <span>
            {isWeekly 
              ? 'Total Coding Problems Solved by Department (Weekly Test)' 
              : (isPgp ? 'Total Solved Programs by Department (PGP)' : 'Total LeetCode Problems Solved by Department')}
          </span>
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {deptStats.map(ds => {
            const currentVal = ds.totalSolved ?? ds.totalMetric ?? 0;
            const pct = Math.round((currentVal / maxTotalSolved) * 100);
            return (
              <div key={ds.dept}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem', fontWeight: 700 }}>
                  <span>{ds.dept}</span>
                  <span>{currentVal.toLocaleString()} {isWeekly ? 'problems solved' : 'solved'}</span>
                </div>
                <div style={{ width: '100%', height: '12px', background: 'var(--bg-primary)', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${pct}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--sece-navy-700) 0%, var(--sece-gold-500) 100%)',
                    borderRadius: '6px',
                    transition: 'width 0.8s ease'
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
