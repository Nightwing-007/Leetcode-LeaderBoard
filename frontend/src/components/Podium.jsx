import React from 'react';
import { Crown, Trophy, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { calculateCompositeScore } from '../data/sampleData';

export function Podium({ top3, activeTab = 'leetcode', onSelectStudent, soundEnabled }) {
  if (!top3 || top3.length < 3) return null;

  const [first, second, third] = top3;

  const triggerCelebration = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  const renderStats = (student, isFirst = false) => {
    if (activeTab === 'weekly') {
      const score = student.weeklyAssessment?.score ?? student.weeklyScore ?? 0;
      const code = student.weeklyAssessment?.codeScore ?? student.weeklyCodeScore ?? 0;
      const mcq = student.weeklyAssessment?.mcqScore ?? student.weeklyMcqScore ?? 0;
      const rank = student.weeklyAssessment?.rank ?? student.weeklyRank ?? 0;

      return (
        <div className="podium-stats-grid">
          <div className="p-stat" style={isFirst ? { background: 'rgba(255, 184, 0, 0.15)' } : {}}>
            <div className="val" style={isFirst ? { color: '#D99B00', fontSize: '1.25rem' } : {}}>
              {score} pts
            </div>
            <div className="lbl">Test Score</div>
          </div>
          <div className="p-stat" style={isFirst ? { background: 'rgba(16, 185, 129, 0.15)' } : {}}>
            <div className="val" style={{ color: '#10B981', fontSize: isFirst ? '1.15rem' : '1rem' }}>
              {code} / 4
            </div>
            <div className="lbl">Code Solved</div>
          </div>
          <div className="p-stat">
            <div className="val" style={{ color: '#2563EB' }}>{mcq} / 100</div>
            <div className="lbl">Aptitude MCQ</div>
          </div>
          <div className="p-stat">
            <div className="val">{rank > 0 ? `#${rank}` : 'N/A'}</div>
            <div className="lbl">Test Rank</div>
          </div>
        </div>
      );
    }

    if (activeTab === 'pgp') {
      const pts = student.pgp?.points ?? student.pgpPoints ?? 0;
      const solved = student.pgp?.programsSolved ?? student.pgpProgramsSolved ?? 0;
      const tests = student.pgp?.codeTests ?? student.pgpCodeTests ?? 0;
      const rank = student.pgp?.skillrackRank ?? student.pgpSkillrackRank ?? 0;

      return (
        <div className="podium-stats-grid">
          <div className="p-stat" style={isFirst ? { background: 'rgba(255, 184, 0, 0.15)' } : {}}>
            <div className="val" style={isFirst ? { color: '#D99B00', fontSize: '1.15rem' } : {}}>
              {pts.toLocaleString()}
            </div>
            <div className="lbl">PGP Points</div>
          </div>
          <div className="p-stat" style={isFirst ? { background: 'rgba(0, 86, 179, 0.12)' } : {}}>
            <div className="val" style={isFirst ? { color: 'var(--sece-navy-500)', fontSize: '1.15rem' } : {}}>
              {solved}
            </div>
            <div className="lbl">Programs Solved</div>
          </div>
          <div className="p-stat">
            <div className="val">{tests}</div>
            <div className="lbl">Code Tests</div>
          </div>
          <div className="p-stat">
            <div className="val">{rank > 0 ? `#${rank.toLocaleString()}` : 'N/A'}</div>
            <div className="lbl">SkillRack Rank</div>
          </div>
        </div>
      );
    }

    // Institutional Topper Views (College, Year, Dept, Class)
    if (['college', 'year', 'department', 'dept_year', 'class', 'overall'].includes(activeTab)) {
      const compScore = student.overallScore != null ? Number(student.overallScore) : (student.compositeScore ?? calculateCompositeScore(student));
      const lcSolved = student.leetcode?.solvedTotal ?? student.lcSolvedTotal ?? 0;
      const pgpPts = student.pgp?.points ?? student.pgpPoints ?? 0;
      const rankNum = student.rank ?? (isFirst ? 1 : (student === second ? 2 : 3));

      return (
        <div className="podium-stats-grid">
          <div className="p-stat" style={isFirst ? { background: 'rgba(255, 184, 0, 0.15)' } : {}}>
            <div className="val" style={isFirst ? { color: '#D99B00', fontSize: '1.25rem' } : {}}>
              ⭐ {Math.round(compScore).toLocaleString()}
            </div>
            <div className="lbl">Composite Score</div>
          </div>
          <div className="p-stat" style={isFirst ? { background: 'rgba(0, 86, 179, 0.12)' } : {}}>
            <div className="val" style={isFirst ? { color: 'var(--sece-navy-500)', fontSize: '1.15rem' } : {}}>
              #{rankNum}
            </div>
            <div className="lbl">Topper Rank</div>
          </div>
          <div className="p-stat">
            <div className="val">{lcSolved} LC</div>
            <div className="lbl">LeetCode Solved</div>
          </div>
          <div className="p-stat">
            <div className="val">{pgpPts > 0 ? `${pgpPts.toLocaleString()} pts` : '—'}</div>
            <div className="lbl">PGP Score</div>
          </div>
        </div>
      );
    }

    // LeetCode / Default
    const solved = student.leetcode?.solvedTotal ?? student.lcSolvedTotal ?? 0;
    const rating = student.leetcode?.contestRating ?? student.lcContestRating ?? 1500;
    const contests = student.leetcode?.contestAttended ?? student.lcContestsAttended ?? 0;
    const rank = student.leetcode?.globalRank ?? student.lcGlobalRank ?? 'N/A';

    return (
      <div className="podium-stats-grid">
        <div className="p-stat" style={isFirst ? { background: 'rgba(255, 184, 0, 0.15)' } : {}}>
          <div className="val" style={isFirst ? { color: '#D99B00', fontSize: '1.15rem' } : {}}>
            {solved}
          </div>
          <div className="lbl">LeetCode Solved</div>
        </div>
        <div className="p-stat" style={isFirst ? { background: 'rgba(0, 86, 179, 0.12)' } : {}}>
          <div className="val" style={isFirst ? { color: 'var(--sece-navy-500)', fontSize: '1.15rem' } : {}}>
            {Math.round(Number(rating))}
          </div>
          <div className="lbl">Contest Rating</div>
        </div>
        <div className="p-stat">
          <div className="val">{contests}</div>
          <div className="lbl">Contests</div>
        </div>
        <div className="p-stat">
          <div className="val">{rank && rank < 900000 ? `#${Number(rank).toLocaleString()}` : 'N/A'}</div>
          <div className="lbl">Global Rank</div>
        </div>
      </div>
    );
  };

  return (
    <section className="podium-section">
      <div className="section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Trophy size={26} />
          <h2 className="section-title" style={{ margin: 0 }}>
            <span>Elite Institutional Coders</span>
          </h2>
        </div>
        <button className="btn btn-gold" onClick={triggerCelebration} style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}>
          <Sparkles size={16} />
          <span>Celebrate #1 Champion</span>
        </button>
      </div>

      <div className="podium-container">
        {/* Rank 2 - Silver */}
        <div className="podium-card rank-2" onClick={() => onSelectStudent && onSelectStudent(second)}>
          <div className="rank-badge">#2</div>
          <div className="avatar-wrapper" style={{ color: '#FFFFFF' }}>
            {second.name ? second.name.charAt(0) : 'S'}
          </div>
          <h3 className="student-name">{second.name}</h3>
          <span className="dept-tag">{second.department} • {second.batch}</span>
          {renderStats(second, false)}
        </div>

        {/* Rank 1 - Gold Champion */}
        <div className="podium-card rank-1" onClick={() => onSelectStudent && onSelectStudent(first)}>
          <Crown size={38} className="crown-icon" />
          <div className="rank-badge">#1</div>
          <div className="avatar-wrapper" style={{ color: '#FFFFFF' }}>
            {first.name ? first.name.charAt(0) : 'S'}
          </div>
          <h3 className="student-name" style={{ fontSize: '1.35rem' }}>{first.name}</h3>
          <span className="dept-tag" style={{ background: '#FFB800', color: '#002855' }}>
            {first.department} • {first.batch} Champion
          </span>
          {renderStats(first, true)}
        </div>

        {/* Rank 3 - Bronze */}
        <div className="podium-card rank-3" onClick={() => onSelectStudent && onSelectStudent(third)}>
          <div className="rank-badge">#3</div>
          <div className="avatar-wrapper" style={{ color: '#FFFFFF' }}>
            {third.name ? third.name.charAt(0) : 'S'}
          </div>
          <h3 className="student-name">{third.name}</h3>
          <span className="dept-tag">{third.department} • {third.batch}</span>
          {renderStats(third, false)}
        </div>
      </div>
    </section>
  );
}
