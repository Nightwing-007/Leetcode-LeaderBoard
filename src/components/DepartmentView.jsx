import React from 'react';
import { Award, BarChart2 } from 'lucide-react';
import { COLLEGE_DEPARTMENTS } from '../data/sampleData';

export function DepartmentView({ students, onSelectStudent }) {
  const depts = COLLEGE_DEPARTMENTS.filter(d => d !== 'All');

  // Compute stats per department
  const deptStats = depts.map(deptName => {
    const deptStudents = students.filter(s => s.department === deptName);
    const count = deptStudents.length;

    if (count === 0) return null;

    const topStudent = [...deptStudents].sort((a, b) => (b.leetcode?.solvedTotal || 0) - (a.leetcode?.solvedTotal || 0))[0];
    const totalLcSolved = deptStudents.reduce((sum, s) => sum + (s.leetcode?.solvedTotal || 0), 0);
    const avgRating = Math.round(deptStudents.reduce((sum, s) => sum + (s.leetcode?.contestRating || 0), 0) / count);

    return {
      dept: deptName,
      count,
      topStudent,
      totalLcSolved,
      avgRating
    };
  }).filter(Boolean);

  const maxLcSolved = Math.max(...deptStats.map(d => d.totalLcSolved), 1);

  return (
    <section style={{ marginTop: '2.5rem' }}>
      <div className="section-header">
        <h2 className="section-title">
          <Award size={26} color="var(--sece-gold-500)" />
          <span>Department Coding Benchmarks & Toppers</span>
        </h2>
      </div>

      {/* Grid of Department Champions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {deptStats.map(ds => (
          <div
            key={ds.dept}
            className="stat-card"
            style={{ flexDirection: 'column', alignItems: 'flex-start', cursor: 'pointer' }}
            onClick={() => onSelectStudent(ds.topStudent)}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '0.75rem' }}>
              <span className="dept-tag" style={{ fontSize: '0.9rem', padding: '0.35rem 0.75rem' }}>
                {ds.dept} Dept
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {ds.count} Coders
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--sece-navy-100)', color: 'var(--sece-navy-700)', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {ds.topStudent.name.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--sece-gold-600)', fontWeight: 700 }}>#1 Dept Topper</div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>{ds.topStudent.name}</div>
              </div>
            </div>

            <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--border-color)' }}>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--sece-navy-700)' }}>{ds.topStudent.leetcode?.solvedTotal}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Top Solved</div>
              </div>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--sece-gold-600)' }}>{ds.avgRating}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Avg Rating</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Visual Bar Comparison Chart */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart2 size={20} color="var(--sece-navy-600)" />
          <span>Total LeetCode Problems Solved by Department</span>
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {deptStats.map(ds => {
            const pct = Math.round((ds.totalLcSolved / maxLcSolved) * 100);
            return (
              <div key={ds.dept}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem', fontWeight: 700 }}>
                  <span>{ds.dept}</span>
                  <span>{ds.totalLcSolved} problems</span>
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
