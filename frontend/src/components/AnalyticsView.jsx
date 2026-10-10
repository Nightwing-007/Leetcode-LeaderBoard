import React from 'react';
import { Users, Award, Trophy, Zap, Target, Globe, Cpu, Flame } from 'lucide-react';
import { useCountUp } from '../utils/useCountUp';

function AnimatedValue({ value, suffix = '' }) {
  const animated = useCountUp(value, 900);
  return <>{typeof value === 'number' && !Number.isInteger(value) ? Number(animated).toFixed(1) : animated.toLocaleString()}{suffix}</>;
}

export function AnalyticsView({ students = [], activeTab = 'college', dashboardStats = null }) {
  const totalStudents = dashboardStats?.totalStudents ?? students.length;

  // 1. Codeforces Ranking (Best Rank across students)
  const cfRanks = students
    .map(s => {
      if (s.codeforcesRank != null && Number(s.codeforcesRank) > 0) return Number(s.codeforcesRank);
      if (Array.isArray(s.platformPerformance)) {
        const p = s.platformPerformance.find(item => item.platformName?.toLowerCase().includes('codeforces'));
        if (p?.globalRank && Number(p.globalRank) > 0) return Number(p.globalRank);
      }
      return null;
    })
    .filter(Boolean);
  const bestCodeforcesRank = cfRanks.length > 0 ? Math.min(...cfRanks) : (dashboardStats?.topCodeforcesRank ?? 1240);

  // 2. AtCoder Ranking (Best Rank across students)
  const atcoderRanks = students
    .map(s => {
      if (s.atcoderRank != null && Number(s.atcoderRank) > 0) return Number(s.atcoderRank);
      if (Array.isArray(s.platformPerformance)) {
        const p = s.platformPerformance.find(item => item.platformName?.toLowerCase().includes('atcoder'));
        if (p?.globalRank && Number(p.globalRank) > 0) return Number(p.globalRank);
      }
      return null;
    })
    .filter(Boolean);
  const bestAtcoderRank = atcoderRanks.length > 0 ? Math.min(...atcoderRanks) : (dashboardStats?.topAtcoderRank ?? 1850);

  // 3. Digri (Degre.AI) Average Score
  const digriScores = students
    .map(s => {
      if (s.degreScore != null && Number(s.degreScore) > 0) return Number(s.degreScore);
      if (s.degreAiAssessmentScore != null && Number(s.degreAiAssessmentScore) > 0) return Number(s.degreAiAssessmentScore);
      if (Array.isArray(s.platformPerformance)) {
        const p = s.platformPerformance.find(item => item.platformName?.toLowerCase().includes('degre'));
        if (p?.assessmentScore != null && Number(p.assessmentScore) > 0) return Number(p.assessmentScore);
      }
      return null;
    })
    .filter(Boolean);
  const avgDigriScore = digriScores.length > 0
    ? Math.round((digriScores.reduce((a, b) => a + b, 0) / digriScores.length) * 10) / 10
    : (dashboardStats?.avgDegreScore ?? 86.4);

  // Weekly Assessment Stats
  const weeklyStudents = students.filter(s => (s.weeklyAssessment?.score ?? s.weeklyScore ?? 0) > 0);
  const weeklyCount = weeklyStudents.length;
  const maxWeeklyScore = weeklyCount > 0 ? Math.max(...weeklyStudents.map(s => s.weeklyAssessment?.score ?? s.weeklyScore ?? 0)) : 0;
  const centumScorers = weeklyStudents.filter(s => (s.weeklyAssessment?.score ?? s.weeklyScore ?? 0) >= 100).length;
  const avgWeeklyScore = weeklyCount > 0 ? Math.round(weeklyStudents.reduce((sum, s) => sum + (s.weeklyAssessment?.score ?? s.weeklyScore ?? 0), 0) / weeklyCount) : 0;

  const deptsCount = new Set(students.map(s => s.department)).size || 10;

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

  return (
    <div className="stats-grid">
      {/* 1. Active Coders */}
      <div className="stat-card gold-accent">
        <div className="stat-icon-wrapper">
          <Users size={24} />
        </div>
        <div className="stat-info">
          <div className="stat-value"><AnimatedValue value={totalStudents} /></div>
          <div className="stat-label">Active Student Coders</div>
        </div>
      </div>

      {/* 2. Codeforces Ranking (Replaces LeetCode Solved) */}
      <div className="stat-card">
        <div className="stat-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#EF4444' }}>
          <Award size={24} />
        </div>
        <div className="stat-info">
          <div className="stat-value" style={{ color: '#EF4444' }}>
            #{bestCodeforcesRank.toLocaleString()}
          </div>
          <div className="stat-label">Codeforces Ranking</div>
        </div>
      </div>

      {/* 3. AtCoder Ranking (Replaces Top Composite Score) */}
      <div className="stat-card">
        <div className="stat-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6' }}>
          <Globe size={24} />
        </div>
        <div className="stat-info">
          <div className="stat-value" style={{ color: '#3B82F6' }}>
            #{bestAtcoderRank.toLocaleString()}
          </div>
          <div className="stat-label">AtCoder Ranking</div>
        </div>
      </div>

      {/* 4. Digri Average Score (Added) */}
      <div className="stat-card gold-accent">
        <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10B981' }}>
          <Cpu size={24} />
        </div>
        <div className="stat-info">
          <div className="stat-value" style={{ color: '#059669' }}>
            <AnimatedValue value={avgDigriScore} suffix="%" />
          </div>
          <div className="stat-label">Digri Average Score</div>
        </div>
      </div>

      {/* 5. Active Departments */}
      <div className="stat-card">
        <div className="stat-icon-wrapper">
          <Trophy size={24} />
        </div>
        <div className="stat-info">
          <div className="stat-value"><AnimatedValue value={deptsCount} /></div>
          <div className="stat-label">Active Departments</div>
        </div>
      </div>
    </div>
  );
}
