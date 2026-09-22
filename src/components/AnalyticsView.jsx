import React from 'react';
import { Users, Code, Flame, Award, Trophy } from 'lucide-react';

export function AnalyticsView({ students }) {
  const totalStudents = students.length;
  const totalLcSolved = students.reduce((sum, s) => sum + (s.leetcode?.solvedTotal || 0), 0);
  const totalContests = students.reduce((sum, s) => sum + (s.leetcode?.contestAttended || 0), 0);
  const maxRating = Math.max(...students.map(s => s.leetcode?.contestRating || 0), 0);
  const deptsCount = new Set(students.map(s => s.department)).size;

  return (
    <div className="stats-grid">
      <div className="stat-card gold-accent">
        <div className="stat-icon-wrapper">
          <Users size={24} />
        </div>
        <div className="stat-info">
          <div className="stat-value">{totalStudents}</div>
          <div className="stat-label">Active Student Coders</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrapper">
          <Code size={24} />
        </div>
        <div className="stat-info">
          <div className="stat-value">{totalLcSolved.toLocaleString()}</div>
          <div className="stat-label">LeetCode Solved (ALL)</div>
        </div>
      </div>

      <div className="stat-card gold-accent">
        <div className="stat-icon-wrapper">
          <Flame size={24} />
        </div>
        <div className="stat-info">
          <div className="stat-value">{maxRating}</div>
          <div className="stat-label">Highest Contest Rating</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrapper">
          <Trophy size={24} />
        </div>
        <div className="stat-info">
          <div className="stat-value">{totalContests}</div>
          <div className="stat-label">Total Contests Attended</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrapper">
          <Award size={24} />
        </div>
        <div className="stat-info">
          <div className="stat-value">{deptsCount}</div>
          <div className="stat-label">Active Departments</div>
        </div>
      </div>
    </div>
  );
}
