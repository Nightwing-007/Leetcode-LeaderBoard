import React from 'react';
import { Users, Code, Flame, Award, Trophy, Zap, Target } from 'lucide-react';
import { useCountUp } from '../utils/useCountUp';

function AnimatedValue({ value, suffix = '' }) {
  const animated = useCountUp(value, 900);
  return <>{animated.toLocaleString()}{suffix}</>;
}

export function AnalyticsView({ students, activeTab = 'pgp' }) {
  const totalStudents = students.length;
  
  // LeetCode Stats
  const totalLcSolved = students.reduce((sum, s) => sum + (s.leetcode?.solvedTotal ?? s.lcSolvedTotal ?? 0), 0);
  const maxRating = Math.max(...students.map(s => s.leetcode?.contestRating ?? s.lcContestRating ?? 0), 0);
  const totalContests = students.reduce((sum, s) => sum + (s.leetcode?.contestAttended ?? s.lcContestsAttended ?? 0), 0);

  // PGP Stats
  const totalPgpSolved = students.reduce((sum, s) => sum + (s.pgp?.programsSolved ?? s.pgpProgramsSolved ?? 0), 0);
  const maxPoints = Math.max(...students.map(s => s.pgp?.points ?? s.pgpPoints ?? 0), 0);
  const totalPointsSum = students.reduce((sum, s) => sum + (s.pgp?.points ?? s.pgpPoints ?? 0), 0);
  const avgPoints = totalStudents > 0 ? Math.round(totalPointsSum / totalStudents) : 0;

  // Weekly Assessment Stats
  const weeklyStudents = students.filter(s => (s.weeklyAssessment?.score ?? s.weeklyScore ?? 0) > 0);
  const weeklyCount = weeklyStudents.length;
  const maxWeeklyScore = weeklyCount > 0 ? Math.max(...weeklyStudents.map(s => s.weeklyAssessment?.score ?? s.weeklyScore ?? 0)) : 0;
  const centumScorers = weeklyStudents.filter(s => (s.weeklyAssessment?.score ?? s.weeklyScore ?? 0) >= 100).length;
  const avgWeeklyScore = weeklyCount > 0 ? Math.round(weeklyStudents.reduce((sum, s) => sum + (s.weeklyAssessment?.score ?? s.weeklyScore ?? 0), 0) / weeklyCount) : 0;

  const deptsCount = new Set(students.map(s => s.department)).size;

  if (activeTab === 'weekly') {
    return (
      <div className="stats-grid">
        <div className="stat-card gold-accent">
          <div className="stat-icon-wrapper">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value"><AnimatedValue value={weeklyCount} /></div>
            <div className="stat-label">Assessment Candidates</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <Flame size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: '#D99B00' }}>
              <AnimatedValue value={maxWeeklyScore} suffix=" pts" />
            </div>
            <div className="stat-label">Top Test Score</div>
          </div>
        </div>

        <div className="stat-card gold-accent">
          <div className="stat-icon-wrapper">
            <Target size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value"><AnimatedValue value={centumScorers} /></div>
            <div className="stat-label">Centum Achievers (100+)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <Zap size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value"><AnimatedValue value={avgWeeklyScore} suffix=" pts" /></div>
            <div className="stat-label">Avg Assessment Score</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <Award size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-value"><AnimatedValue value={deptsCount} /></div>
            <div className="stat-label">Active Departments</div>
          </div>
        </div>
      </div>
    );
  }

  const isPgpMode = activeTab === 'pgp' || (totalPgpSolved > 0 && totalLcSolved === 0);

  return (
    <div className="stats-grid">
      <div className="stat-card gold-accent">
        <div className="stat-icon-wrapper">
          <Users size={24} />
        </div>
        <div className="stat-info">
          <div className="stat-value"><AnimatedValue value={totalStudents} /></div>
          <div className="stat-label">Active Student Coders</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrapper">
          <Code size={24} />
        </div>
        <div className="stat-info">
          <div className="stat-value">
            <AnimatedValue value={isPgpMode ? totalPgpSolved : totalLcSolved} />
          </div>
          <div className="stat-label">
            {isPgpMode ? 'Programs Solved (PGP)' : 'LeetCode Solved (ALL)'}
          </div>
        </div>
      </div>

      <div className="stat-card gold-accent">
        <div className="stat-icon-wrapper">
          <Flame size={24} />
        </div>
        <div className="stat-info">
          <div className="stat-value">
            <AnimatedValue value={isPgpMode ? maxPoints : maxRating} />
          </div>
          <div className="stat-label">
            {isPgpMode ? 'Highest PGP Points' : 'Highest Contest Rating'}
          </div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrapper">
          {isPgpMode ? <Target size={24} /> : <Trophy size={24} />}
        </div>
        <div className="stat-info">
          <div className="stat-value">
            <AnimatedValue value={isPgpMode ? avgPoints : totalContests} suffix={isPgpMode ? ' pts' : ''} />
          </div>
          <div className="stat-label">
            {isPgpMode ? 'Avg Placement Score' : 'Total Contests Attended'}
          </div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrapper">
          <Award size={24} />
        </div>
        <div className="stat-info">
          <div className="stat-value"><AnimatedValue value={deptsCount} /></div>
          <div className="stat-label">Active Departments</div>
        </div>
      </div>
    </div>
  );
}
