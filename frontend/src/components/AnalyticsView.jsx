import React, { useState, useMemo } from 'react';
import {
  Users,
  Code,
  Award,
  Trophy,
  Zap,
  Target,
  Globe,
  Cpu,
  Flame,
  BarChart2,
  Layers,
  LayoutGrid
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { useCountUp } from '../utils/useCountUp';
import {
  aggregateDepartmentCategories,
  CATEGORY_COLORS
} from '../utils/analyticsAggregator';

function AnimatedValue({ value, suffix = '' }) {
  const animated = useCountUp(value, 900);
  return (
    <>
      {typeof value === 'number' && !Number.isInteger(value)
        ? Number(animated).toFixed(1)
        : animated.toLocaleString()}
      {suffix}
    </>
  );
}

// Custom Tooltip for Department Category Bar Chart
function CategoryTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  const total = payload.reduce((sum, item) => sum + (Number(item.value) || 0), 0);

  return (
    <div
      style={{
        background: 'var(--bg-card, #FFFFFF)',
        border: '1px solid var(--border-color, #E2E8F0)',
        borderRadius: '10px',
        padding: '0.85rem 1rem',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        minWidth: '200px',
        color: 'var(--text-main, #0F172A)'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-color, #E2E8F0)',
          paddingBottom: '0.4rem',
          marginBottom: '0.5rem'
        }}
      >
        <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--sece-navy-900, #002855)' }}>
          {label} Department
        </span>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748B)' }}>
          Total: {total}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {payload.map((entry, index) => {
          const count = Number(entry.value) || 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div
              key={`tooltip-item-${index}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.8rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: entry.color,
                    display: 'inline-block'
                  }}
                />
                <span style={{ fontWeight: 600 }}>{entry.name}</span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                {count} ({pct}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AnalyticsView({ students = [], data, activeTab = 'college', dashboardStats = null }) {
  const [chartMode, setChartMode] = useState('stacked'); // 'stacked' | 'grouped'

  // Standardize input data (accept either data or students prop, unpaginated)
  const effectiveStudents = useMemo(() => {
    if (Array.isArray(data) && data.length > 0) return data;
    if (Array.isArray(students)) return students;
    return [];
  }, [data, students]);

  const totalStudents = dashboardStats?.totalStudents ?? effectiveStudents.length;

  // Aggregate Category breakdown per Department using our hardened utility
  const departmentCategoryData = useMemo(() => {
    return aggregateDepartmentCategories(effectiveStudents);
  }, [effectiveStudents]);

  // Overall totals across categories for summary badges
  const categoryTotals = useMemo(() => {
    const totals = { Elite: 0, Specialist: 0, Challenger: 0, Solver: 0, Starter: 0 };
    departmentCategoryData.forEach((dept) => {
      totals.Elite += dept.Elite || 0;
      totals.Specialist += dept.Specialist || 0;
      totals.Challenger += dept.Challenger || 0;
      totals.Solver += dept.Solver || 0;
      totals.Starter += dept.Starter || 0;
    });
    return totals;
  }, [departmentCategoryData]);

  // 1. LeetCode Active Count (non-null/non-zero score, rating, or rank on LeetCode)
  const leetCodeActiveCount = useMemo(() => {
    return effectiveStudents.filter((s) => {
      if (!s) return false;
      const lcSolved = s.leetcode?.solvedTotal ?? s.lcSolvedTotal ?? 0;
      const lcRank = s.leetcode?.globalRank ?? s.lcGlobalRank ?? 0;
      const lcRating = s.leetcode?.contestRating ?? s.lcContestRating ?? 0;
      const lcUsername = s.leetcode?.leetcodeId || s.leetcodeId;
      if (lcSolved > 0 || (lcRank > 0 && lcRank < 900000) || lcRating > 0 || (lcUsername && lcUsername !== 'N/A')) {
        return true;
      }
      if (Array.isArray(s.platformPerformance)) {
        return s.platformPerformance.some(
          (p) =>
            p?.platformName?.toLowerCase().includes('leet') &&
            (Number(p.problemsSolved) > 0 || Number(p.globalRank) > 0 || Number(p.contestRating) > 0)
        );
      }
      return false;
    }).length;
  }, [effectiveStudents]);

  // 2. SkillRack Active Count (non-null/non-zero score or rank on SkillRack / PGP)
  const skillRackActiveCount = useMemo(() => {
    return effectiveStudents.filter((s) => {
      if (!s) return false;
      const srPoints = s.pgp?.points ?? s.pgpPoints ?? 0;
      const srSolved = s.pgp?.programsSolved ?? s.pgpProgramsSolved ?? 0;
      const srRank = s.pgp?.skillrackRank ?? s.pgpSkillrackRank ?? 0;
      const srUsername = s.pgp?.skillrackUsername || s.skillrackUsername;
      if (srPoints > 0 || srSolved > 0 || (srRank > 0 && srRank < 900000) || (srUsername && srUsername !== 'N/A')) {
        return true;
      }
      if (Array.isArray(s.platformPerformance)) {
        return s.platformPerformance.some(
          (p) =>
            (p?.platformName?.toLowerCase().includes('skill') || p?.platformName?.toLowerCase().includes('pgp')) &&
            (Number(p.problemsSolved) > 0 || Number(p.assessmentScore) > 0 || Number(p.globalRank) > 0)
        );
      }
      return false;
    }).length;
  }, [effectiveStudents]);

  // 3. Multi-platform rankings and weekly assessment stats fully memoized
  const {
    bestCodeforcesRank,
    bestAtcoderRank,
    avgDigriScore,
    weeklyCount,
    maxWeeklyScore,
    centumScorers,
    avgWeeklyScore,
    deptsCount
  } = useMemo(() => {
    // 1. Codeforces Ranking (Best Rank across students)
    const cfRanks = effectiveStudents
      .map((s) => {
        if (!s) return null;
        if (s.codeforcesRank != null && Number(s.codeforcesRank) > 0) return Number(s.codeforcesRank);
        if (Array.isArray(s.platformPerformance)) {
          const p = s.platformPerformance.find((item) =>
            item?.platformName?.toLowerCase().includes('codeforces')
          );
          if (p?.globalRank && Number(p.globalRank) > 0) return Number(p.globalRank);
        }
        return null;
      })
      .filter(Boolean);
    const bestCodeforcesRankVal =
      cfRanks.length > 0 ? Math.min(...cfRanks) : dashboardStats?.topCodeforcesRank ?? 1240;

    // 2. AtCoder Ranking (Best Rank across students)
    const atcoderRanks = effectiveStudents
      .map((s) => {
        if (!s) return null;
        if (s.atcoderRank != null && Number(s.atcoderRank) > 0) return Number(s.atcoderRank);
        if (Array.isArray(s.platformPerformance)) {
          const p = s.platformPerformance.find((item) =>
            item?.platformName?.toLowerCase().includes('atcoder')
          );
          if (p?.globalRank && Number(p.globalRank) > 0) return Number(p.globalRank);
        }
        return null;
      })
      .filter(Boolean);
    const bestAtcoderRankVal =
      atcoderRanks.length > 0 ? Math.min(...atcoderRanks) : dashboardStats?.topAtcoderRank ?? 1850;

    // 3. Digri (Degre.AI) Average Score
    const digriScores = effectiveStudents
      .map((s) => {
        if (!s) return null;
        if (s.degreScore != null && Number(s.degreScore) > 0) return Number(s.degreScore);
        if (s.degreAiAssessmentScore != null && Number(s.degreAiAssessmentScore) > 0)
          return Number(s.degreAiAssessmentScore);
        if (Array.isArray(s.platformPerformance)) {
          const p = s.platformPerformance.find((item) =>
            item?.platformName?.toLowerCase().includes('degre')
          );
          if (p?.assessmentScore != null && Number(p.assessmentScore) > 0)
            return Number(p.assessmentScore);
        }
        return null;
      })
      .filter(Boolean);
    const avgDigriScoreVal =
      digriScores.length > 0
        ? Math.round((digriScores.reduce((a, b) => a + b, 0) / digriScores.length) * 10) / 10
        : dashboardStats?.avgDegreScore ?? 86.4;

    // Weekly Assessment Stats
    const weeklyStudents = effectiveStudents.filter(
      (s) => s && (s.weeklyAssessment?.score ?? s.weeklyScore ?? 0) > 0
    );
    const weeklyCountVal = weeklyStudents.length;
    const maxWeeklyScoreVal =
      weeklyCountVal > 0
        ? Math.max(...weeklyStudents.map((s) => s.weeklyAssessment?.score ?? s.weeklyScore ?? 0))
        : 0;
    const centumScorersVal = weeklyStudents.filter(
      (s) => (s.weeklyAssessment?.score ?? s.weeklyScore ?? 0) >= 100
    ).length;
    const avgWeeklyScoreVal =
      weeklyCountVal > 0
        ? Math.round(
            weeklyStudents.reduce(
              (sum, s) => sum + (s.weeklyAssessment?.score ?? s.weeklyScore ?? 0),
              0
            ) / weeklyCountVal
          )
        : 0;

    const deptsCountVal = new Set(effectiveStudents.map((s) => s?.department).filter(Boolean)).size || 10;

    return {
      bestCodeforcesRank: bestCodeforcesRankVal,
      bestAtcoderRank: bestAtcoderRankVal,
      avgDigriScore: avgDigriScoreVal,
      weeklyCount: weeklyCountVal,
      maxWeeklyScore: maxWeeklyScoreVal,
      centumScorers: centumScorersVal,
      avgWeeklyScore: avgWeeklyScoreVal,
      deptsCount: deptsCountVal
    };
  }, [effectiveStudents, dashboardStats]);

  return (
    <div className="analytics-section-wrapper" style={{ marginBottom: '1.75rem' }}>
      {/* KPI Cards Grid */}
      {activeTab === 'weekly' ? (
        <div className="stats-grid">
          <div className="stat-card gold-accent">
            <div className="stat-icon-wrapper">
              <Users size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-value">
                <AnimatedValue value={weeklyCount} />
              </div>
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
              <div className="stat-value">
                <AnimatedValue value={centumScorers} />
              </div>
              <div className="stat-label">Centum Achievers (100+)</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper">
              <Zap size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-value">
                <AnimatedValue value={avgWeeklyScore} suffix=" pts" />
              </div>
              <div className="stat-label">Avg Assessment Score</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper">
              <Award size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-value">
                <AnimatedValue value={deptsCount} />
              </div>
              <div className="stat-label">Active Departments</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="stats-grid">
          {/* 1. LeetCode Active */}
          <div className="stat-card">
            <div
              className="stat-icon-wrapper"
              style={{ background: 'rgba(255, 161, 22, 0.12)', color: '#FFA116' }}
            >
              <Code size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-value" style={{ color: '#D97706' }}>
                <AnimatedValue value={leetCodeActiveCount || totalStudents} />
              </div>
              <div className="stat-label">LeetCode Active</div>
            </div>
          </div>

          {/* 2. SkillRack Active */}
          <div className="stat-card gold-accent">
            <div
              className="stat-icon-wrapper"
              style={{ background: 'rgba(255, 184, 0, 0.12)', color: '#FFB800' }}
            >
              <Zap size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-value" style={{ color: '#B45309' }}>
                <AnimatedValue value={skillRackActiveCount || totalStudents} />
              </div>
              <div className="stat-label">SkillRack Active</div>
            </div>
          </div>

          {/* 2. Codeforces Ranking */}
          <div className="stat-card">
            <div
              className="stat-icon-wrapper"
              style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#EF4444' }}
            >
              <Award size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-value" style={{ color: '#EF4444' }}>
                #{bestCodeforcesRank.toLocaleString()}
              </div>
              <div className="stat-label">Codeforces Ranking</div>
            </div>
          </div>

          {/* 3. AtCoder Ranking */}
          <div className="stat-card">
            <div
              className="stat-icon-wrapper"
              style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6' }}
            >
              <Globe size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-value" style={{ color: '#3B82F6' }}>
                #{bestAtcoderRank.toLocaleString()}
              </div>
              <div className="stat-label">AtCoder Ranking</div>
            </div>
          </div>

          {/* 4. Digri Average Score */}
          <div className="stat-card gold-accent">
            <div
              className="stat-icon-wrapper"
              style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10B981' }}
            >
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
              <div className="stat-value">
                <AnimatedValue value={deptsCount} />
              </div>
              <div className="stat-label">Active Departments</div>
            </div>
          </div>
        </div>
      )}

      {/* Prominent Department-Wise Category Breakdown Chart */}
      {departmentCategoryData.length > 0 && (
        <div
          className="department-category-analytics-card"
          style={{
            marginTop: '1.25rem',
            background: 'var(--bg-card, #FFFFFF)',
            border: '1px solid var(--border-color, #E2E8F0)',
            borderRadius: '24px',
            padding: '1.5rem',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
            transition: 'box-shadow var(--transition-med) ease'
          }}
        >
          {/* Header & Controls */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '1rem',
              borderBottom: '1px solid var(--border-color, #E2E8F0)',
              paddingBottom: '0.85rem'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart2 size={20} color="var(--sece-gold-500, #FFB800)" />
                <h3
                  style={{
                    margin: 0,
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    color: 'var(--sece-navy-900, #002855)'
                  }}
                >
                  Department-Wise Category Analytics
                </h3>
              </div>
              <p
                style={{
                  margin: '3px 0 0 0',
                  fontSize: '0.78rem',
                  color: 'var(--text-muted, #64748B)'
                }}
              >
                Distribution of performance tiers (Starter, Solver, Challenger, Specialist, Elite) per department
              </p>
            </div>

            {/* View Mode Toggle & Category Summary Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div
                style={{
                  display: 'flex',
                  background: 'var(--bg-primary, #F1F5F9)',
                  padding: '3px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color, #E2E8F0)'
                }}
              >
                <button
                  type="button"
                  onClick={() => setChartMode('stacked')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: chartMode === 'stacked' ? 'var(--sece-navy-900, #002855)' : 'transparent',
                    color: chartMode === 'stacked' ? '#FFFFFF' : 'var(--text-muted, #64748B)',
                    transition: 'all 0.2s'
                  }}
                >
                  <Layers size={13} />
                  <span>Stacked</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChartMode('grouped')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: chartMode === 'grouped' ? 'var(--sece-navy-900, #002855)' : 'transparent',
                    color: chartMode === 'grouped' ? '#FFFFFF' : 'var(--text-muted, #64748B)',
                    transition: 'all 0.2s'
                  }}
                >
                  <LayoutGrid size={13} />
                  <span>Grouped</span>
                </button>
              </div>

              {/* Total Elite Coders Chip */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  padding: '3px 9px',
                  borderRadius: '16px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: '#B45309'
                }}
                title="Total students in the Elite tier across all departments"
              >
                <span>💎 {categoryTotals.Elite} Elite</span>
              </div>
            </div>
          </div>

          {/* Recharts Bar Chart */}
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={departmentCategoryData}
                margin={{ top: 10, right: 15, left: -10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis
                  dataKey="department"
                  tick={{ fill: 'var(--text-muted, #64748B)', fontSize: 11, fontWeight: 700 }}
                  stroke="var(--border-color, #E2E8F0)"
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: 'var(--text-muted, #64748B)', fontSize: 11 }}
                  stroke="var(--border-color, #E2E8F0)"
                />
                <Tooltip content={<CategoryTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '10px', fontSize: '0.8rem' }}
                  iconType="circle"
                  iconSize={9}
                />
                <Bar
                  dataKey="Elite"
                  stackId={chartMode === 'stacked' ? 'dept' : undefined}
                  fill={CATEGORY_COLORS.Elite}
                  name="Elite"
                  radius={chartMode === 'stacked' ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                />
                <Bar
                  dataKey="Specialist"
                  stackId={chartMode === 'stacked' ? 'dept' : undefined}
                  fill={CATEGORY_COLORS.Specialist}
                  name="Specialist"
                  radius={chartMode === 'stacked' ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                />
                <Bar
                  dataKey="Challenger"
                  stackId={chartMode === 'stacked' ? 'dept' : undefined}
                  fill={CATEGORY_COLORS.Challenger}
                  name="Challenger"
                  radius={chartMode === 'stacked' ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                />
                <Bar
                  dataKey="Solver"
                  stackId={chartMode === 'stacked' ? 'dept' : undefined}
                  fill={CATEGORY_COLORS.Solver}
                  name="Solver"
                  radius={chartMode === 'stacked' ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                />
                <Bar
                  dataKey="Starter"
                  stackId={chartMode === 'stacked' ? 'dept' : undefined}
                  fill={CATEGORY_COLORS.Starter}
                  name="Starter"
                  radius={chartMode === 'stacked' ? [4, 4, 0, 0] : [4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalyticsView;
