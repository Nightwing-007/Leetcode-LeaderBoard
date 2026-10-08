import React from 'react';
import { Users, Code, Flame, Award, Trophy, Zap, Target } from 'lucide-react';
import { useCountUp } from '../utils/useCountUp';

function AnimatedValue({ value, suffix = '' }) {
  const animated = useCountUp(value, 900);
  return <>{animated.toLocaleString()}{suffix}</>;
}

export function AnalyticsView({ students, activeTab = 'college', dashboardStats = null }) {
  const totalStudents = dashboardStats?.totalStudents ?? students.length;
  
  // LeetCode Stats
  const totalLcSolved = dashboardStats?.totalLeetCodeSolved ?? students.reduce((sum, s) => sum + (s.leetcode?.solvedTotal ?? s.lcSolvedTotal ?? 0), 0);
  const maxRating = dashboardStats?.highestContestRating != null ? Number(dashboardStats.highestContestRating) : Math.max(...students.map(s => s.leetcode?.contestRating ?? s.lcContestRating ?? 0), 0);
  const totalContests = dashboardStats?.totalContestsAttended ?? students.reduce((sum, s) => sum + (s.leetcode?.contestAttended ?? s.lcContestsAttended ?? 0), 0);

  // PGP Stats
  const totalPgpSolved = students.reduce((sum, s) => sum + (s.pgp?.programsSolved ?? s.pgpProgramsSolved ?? 0), 0);
  const maxPoints = dashboardStats?.maxPgpPoints ?? Math.max(...students.map(s => s.pgp?.points ?? s.pgpPoints ?? 0), 0);
  const totalPointsSum = students.reduce((sum, s) => sum + (s.pgp?.points ?? s.pgpPoints ?? 0), 0);
  const avgPoints = dashboardStats?.avgPgpPoints ? Math.round(dashboardStats.avgPgpPoints) : (totalStudents > 0 ? Math.round(totalPointsSum / totalStudents) : 0);

  // V2 Metrics
  const highestOverallScore = dashboardStats?.highestOverallScore != null ? Number(dashboardStats.highestOverallScore) : Math.max(...students.map(s => s.overallScore ?? s.compositeScore ?? 0), 0);
  const activePlatforms = dashboardStats?.activePlatformsCount ?? (dashboardStats?.activePlatforms?.length ?? 5);

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
            {['college', 'year', 'department', 'dept_year', 'class', 'overall'].includes(activeTab) && highestOverallScore > 0 ? (
              <AnimatedValue value={Math.round(highestOverallScore)} suffix=" pts" />
            ) : (
              <AnimatedValue value={isPgpMode ? maxPoints : maxRating} />
            )}
          </div>
          <div className="stat-label">
            {['college', 'year', 'department', 'dept_year', 'class', 'overall'].includes(activeTab) && highestOverallScore > 0
              ? 'Top Composite Score'
              : (isPgpMode ? 'Highest PGP Points' : 'Highest Contest Rating')}
          </div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon-wrapper">
          {['college', 'year', 'department', 'dept_year', 'class', 'overall'].includes(activeTab) ? <Trophy size={24} /> : (isPgpMode ? <Target size={24} /> : <Trophy size={24} />)}
        </div>
        <div className="stat-info">
          <div className="stat-value">
            {['college', 'year', 'department', 'dept_year', 'class', 'overall'].includes(activeTab) ? (
              <AnimatedValue value={activePlatforms} suffix=" Connected" />
            ) : (
              <AnimatedValue value={isPgpMode ? avgPoints : totalContests} suffix={isPgpMode ? ' pts' : ''} />
            )}
          </div>
          <div className="stat-label">
            {['college', 'year', 'department', 'dept_year', 'class', 'overall'].includes(activeTab)
              ? 'Active Coding Platforms'
              : (isPgpMode ? 'Avg Placement Score' : 'Total Contests Attended')}
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
