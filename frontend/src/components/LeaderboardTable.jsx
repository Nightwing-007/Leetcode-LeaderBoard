import React, { useState, useMemo, useEffect } from 'react';
import { Search, ArrowUpDown, ExternalLink, Edit2, Trash2, Award, Trophy, Zap, Sparkles, Target, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, SearchX } from 'lucide-react';
import { COLLEGE_DEPARTMENTS, COLLEGE_BATCHES, GENDER_FILTERS, calculateCompositeScore } from '../data/sampleData';
import { CustomSelect } from './CustomSelect';

export function LeaderboardTable({
  students,
  activeTab = 'pgp', // 'pgp' | 'weekly' | 'leetcode' | 'overall'
  setActiveTab,
  selectedDept,
  setSelectedDept,
  selectedBatch,
  setSelectedBatch,
  selectedGender,
  setSelectedGender,
  searchQuery,
  setSearchQuery,
  onSelectStudent,
  onEditStudent,
  onDeleteStudent
}) {
  const [sortBy, setSortBy] = useState('rank');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50); // 25 | 50 | 100 | 250 | 'All'

  // Reset pagination when activeTab or any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, selectedDept, selectedBatch, selectedGender, searchQuery, sortBy]);

  // Filter students with useMemo for instant in-memory processing
  const filteredStudents = useMemo(() => {
    const q = (searchQuery || '').toLowerCase().trim();
    return students.filter(st => {
      const matchesDept = selectedDept === 'All' || st.department === selectedDept;
      const matchesBatch = selectedBatch === 'All' || st.batch === selectedBatch;
      const matchesGender = selectedGender === 'All' || st.gender === selectedGender;
      const matchesSearch = !q || 
        st.name?.toLowerCase().includes(q) || 
        st.rollNo?.toLowerCase().includes(q) ||
        (st.leetcode?.leetcodeId && st.leetcode.leetcodeId.toLowerCase().includes(q)) ||
        (st.leetcodeId && st.leetcodeId.toLowerCase().includes(q));
      return matchesDept && matchesBatch && matchesGender && matchesSearch;
    });
  }, [students, selectedDept, selectedBatch, selectedGender, searchQuery]);

  // Sort students based on tab and selection with useMemo
  const sortedStudents = useMemo(() => {
    return [...filteredStudents].sort((a, b) => {
      if (activeTab === 'weekly') {
        if (sortBy === 'weekly_code') {
          const ca = a.weeklyAssessment?.codeScore ?? a.weeklyCodeScore ?? 0;
          const cb = b.weeklyAssessment?.codeScore ?? b.weeklyCodeScore ?? 0;
          return cb - ca;
        }
        if (sortBy === 'weekly_mcq') {
          const ma = a.weeklyAssessment?.mcqScore ?? a.weeklyMcqScore ?? 0;
          const mb = b.weeklyAssessment?.mcqScore ?? b.weeklyMcqScore ?? 0;
          return mb - ma;
        }
        if (sortBy === 'weekly_rank') {
          const ra = a.weeklyAssessment?.rank ?? a.weeklyRank ?? 999999;
          const rb = b.weeklyAssessment?.rank ?? b.weeklyRank ?? 999999;
          return ra - rb;
        }
        // Default: Assessment Score DESC then Assessment Rank ASC
        const sa = a.weeklyAssessment?.score ?? a.weeklyScore ?? 0;
        const sb = b.weeklyAssessment?.score ?? b.weeklyScore ?? 0;
        if (sb !== sa) return sb - sa;
        const ra = a.weeklyAssessment?.rank ?? a.weeklyRank ?? 999999;
        const rb = b.weeklyAssessment?.rank ?? b.weeklyRank ?? 999999;
        return ra - rb;
      } else if (activeTab === 'leetcode') {
        if (sortBy === 'lc_solved') {
          const sa = a.leetcode?.solvedTotal ?? a.lcSolvedTotal ?? 0;
          const sb = b.leetcode?.solvedTotal ?? b.lcSolvedTotal ?? 0;
          return sb - sa;
        }
        if (sortBy === 'lc_rating') {
          const ra = a.leetcode?.contestRating ?? a.lcContestRating ?? 0;
          const rb = b.leetcode?.contestRating ?? b.lcContestRating ?? 0;
          return rb - ra;
        }
        if (sortBy === 'lc_contests') {
          const ca = a.leetcode?.contestAttended ?? a.lcContestsAttended ?? 0;
          const cb = b.leetcode?.contestAttended ?? b.lcContestsAttended ?? 0;
          return cb - ca;
        }
        // Default: Global Rank ASC
        const ga = a.leetcode?.globalRank ?? a.lcGlobalRank ?? 999999;
        const gb = b.leetcode?.globalRank ?? b.lcGlobalRank ?? 999999;
        return ga - gb;
      } else if (activeTab === 'pgp') {
        if (sortBy === 'pgp_solved') {
          const pa = a.pgp?.programsSolved ?? a.pgpProgramsSolved ?? 0;
          const pb = b.pgp?.programsSolved ?? b.pgpProgramsSolved ?? 0;
          return pb - pa;
        }
        if (sortBy === 'pgp_dc') {
          const da = a.pgp?.dc ?? a.pgpDc ?? 0;
          const db = b.pgp?.dc ?? b.pgpDc ?? 0;
          return db - da;
        }
        if (sortBy === 'pgp_rank') {
          const ra = a.pgp?.skillrackRank ?? a.pgpSkillrackRank ?? 999999;
          const rb = b.pgp?.skillrackRank ?? b.pgpSkillrackRank ?? 999999;
          return ra - rb;
        }
        // Default: Total Points DESC
        const pa = a.pgp?.points ?? a.pgpPoints ?? 0;
        const pb = b.pgp?.points ?? b.pgpPoints ?? 0;
        return pb - pa;
      }

      // Overall Composite Score
      const ca = a.compositeScore ?? calculateCompositeScore(a);
      const cb = b.compositeScore ?? calculateCompositeScore(b);
      return cb - ca;
    });
  }, [filteredStudents, activeTab, sortBy]);

  // Paginated window for instant <1ms DOM rendering
  const paginatedStudents = useMemo(() => {
    if (pageSize === 'All') return sortedStudents;
    const start = (currentPage - 1) * Number(pageSize);
    return sortedStudents.slice(start, start + Number(pageSize));
  }, [sortedStudents, currentPage, pageSize]);

  const totalPages = pageSize === 'All' ? 1 : Math.max(1, Math.ceil(sortedStudents.length / Number(pageSize)));
  const startIndex = sortedStudents.length === 0 ? 0 : (pageSize === 'All' ? 1 : (currentPage - 1) * Number(pageSize) + 1);
  const endIndex = pageSize === 'All' ? sortedStudents.length : Math.min(currentPage * Number(pageSize), sortedStudents.length);

  return (
    <section>
      {/* Header & Tab Switcher */}
      <div className="section-header" style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Award size={26} color="var(--sece-gold-500)" />
          <h2 className="section-title" style={{ margin: 0 }}>
            <span>SECE Coding &amp; SkillRack Leaderboard</span>
          </h2>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '5px', gap: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', flexWrap: 'wrap' }}>
          <button
            className="btn"
            style={{
              fontSize: '0.875rem',
              padding: '0.5rem 0.9rem',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'pgp' ? 'var(--sece-gold-500)' : 'transparent',
              color: activeTab === 'pgp' ? '#002855' : 'var(--text-main)',
              fontWeight: activeTab === 'pgp' ? 800 : 600,
              boxShadow: activeTab === 'pgp' ? '0 2px 8px rgba(255, 184, 0, 0.35)' : 'none'
            }}
            onClick={() => setActiveTab && setActiveTab('pgp')}
          >
            <Zap size={16} />
            <span>PGP / SkillRack</span>
          </button>

          <button
            className="btn"
            style={{
              fontSize: '0.875rem',
              padding: '0.5rem 0.9rem',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'weekly' ? 'var(--sece-navy-900)' : 'transparent',
              color: activeTab === 'weekly' ? '#FFC72C' : 'var(--text-main)',
              fontWeight: activeTab === 'weekly' ? 800 : 600,
              boxShadow: activeTab === 'weekly' ? '0 2px 8px rgba(0, 40, 85, 0.35)' : 'none'
            }}
            onClick={() => setActiveTab && setActiveTab('weekly')}
          >
            <Target size={16} />
            <span>Weekly Assessment</span>
          </button>

          <button
            className="btn"
            style={{
              fontSize: '0.875rem',
              padding: '0.5rem 0.9rem',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'leetcode' ? 'var(--sece-navy-700)' : 'transparent',
              color: activeTab === 'leetcode' ? '#FFFFFF' : 'var(--text-main)',
              fontWeight: activeTab === 'leetcode' ? 800 : 600,
              boxShadow: activeTab === 'leetcode' ? '0 2px 8px rgba(0, 51, 102, 0.35)' : 'none'
            }}
            onClick={() => setActiveTab && setActiveTab('leetcode')}
          >
            <Trophy size={16} />
            <span>LeetCode Global</span>
          </button>

          <button
            className="btn"
            style={{
              fontSize: '0.875rem',
              padding: '0.5rem 0.9rem',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'overall' ? 'linear-gradient(135deg, var(--sece-navy-700), var(--sece-gold-500))' : 'transparent',
              color: activeTab === 'overall' ? '#FFFFFF' : 'var(--text-main)',
              fontWeight: activeTab === 'overall' ? 800 : 600,
              boxShadow: activeTab === 'overall' ? '0 2px 8px rgba(0, 51, 102, 0.3)' : 'none'
            }}
            onClick={() => setActiveTab && setActiveTab('overall')}
          >
            <Sparkles size={16} />
            <span>Composite Rank</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="filters-bar">
        <div className="filter-group">
          {/* Search Box */}
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search Name, Roll No, or LeetCode ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Department Filter */}
          <CustomSelect
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            options={COLLEGE_DEPARTMENTS.map(d => ({ value: d, label: d === 'All' ? 'All Departments' : d }))}
          />

          {/* Batch Filter */}
          <CustomSelect
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            options={COLLEGE_BATCHES.map(b => ({ value: b, label: b === 'All' ? 'All Batches' : b }))}
          />

          {/* Gender Filter */}
          <CustomSelect
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            options={GENDER_FILTERS.map(g => ({ value: g, label: g === 'All' ? 'All Genders' : g }))}
          />
        </div>

        {/* Sort By Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowUpDown size={16} color="var(--text-light)" />
          <CustomSelect
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={
              activeTab === 'weekly' ? [
                { value: 'rank', label: 'Sort by: Assessment Score' },
                { value: 'weekly_rank', label: 'Sort by: Assessment Rank' },
                { value: 'weekly_code', label: 'Sort by: Coding Score (4 Programs)' },
                { value: 'weekly_mcq', label: 'Sort by: Aptitude MCQ Score' },
              ] :
              activeTab === 'leetcode' ? [
                { value: 'rank', label: 'Sort by: Global Rank' },
                { value: 'lc_rating', label: 'Sort by: Contest Rating' },
                { value: 'lc_contests', label: 'Sort by: Contests Attended' },
                { value: 'lc_solved', label: 'Sort by: Solved Problems' },
              ] :
              activeTab === 'pgp' ? [
                { value: 'rank', label: 'Sort by: Total Points' },
                { value: 'pgp_solved', label: 'Sort by: Programs Solved' },
                { value: 'pgp_dc', label: 'Sort by: Daily Challenges (DC)' },
                { value: 'pgp_rank', label: 'Sort by: SkillRack Rank' },
              ] : [
                { value: 'rank', label: 'Sort by: Overall Composite Rank' },
              ]
            }
          />
        </div>
      </div>

      {/* Smart Hint Banner if looking at empty tab when other data exists */}
      {activeTab === 'leetcode' && !students.some(s => (s.leetcode?.solvedTotal ?? s.lcSolvedTotal ?? 0) > 0) && students.some(s => (s.pgp?.points ?? s.pgpPoints ?? 0) > 0) && (
        <div className="hint-banner hint-banner-gold">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>⚡ <strong>PGP Report Detected:</strong> Your uploaded records contain PGP / SkillRack scores.</span>
          </div>
          <button
            onClick={() => setActiveTab && setActiveTab('pgp')}
            className="btn btn-navy"
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
          >
            Switch to PGP Tab &rarr;
          </button>
        </div>
      )}

      {activeTab === 'pgp' && !students.some(s => (s.pgp?.points ?? s.pgpPoints ?? 0) > 0) && students.some(s => (s.leetcode?.solvedTotal ?? s.lcSolvedTotal ?? 0) > 0) && (
        <div className="hint-banner hint-banner-blue">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>⚡ <strong>LeetCode Report Detected:</strong> Your uploaded records contain LeetCode contest rankings.</span>
          </div>
          <button
            onClick={() => setActiveTab && setActiveTab('leetcode')}
            className="btn btn-gold"
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
          >
            Switch to LeetCode Tab &rarr;
          </button>
        </div>
      )}

      {/* Table Display */}
      <div className="table-responsive">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th style={{ width: '80px', minWidth: '80px', textAlign: 'center' }}>Rank</th>
              <th style={{ minWidth: '240px' }}>Student Details</th>
              <th style={{ minWidth: '130px' }}>Dept / Batch</th>
              {activeTab === 'weekly' && (
                <>
                  <th style={{ minWidth: '120px' }}>Test Score</th>
                  <th style={{ minWidth: '160px' }}>Coding (4 Programs)</th>
                  <th style={{ minWidth: '150px' }}>Aptitude MCQ (100)</th>
                  <th style={{ minWidth: '110px' }}>Test Rank</th>
                  <th style={{ minWidth: '120px' }}>Overall PGP</th>
                </>
              )}
              {activeTab === 'leetcode' && (
                <>
                  <th style={{ minWidth: '120px' }}>Global Rank</th>
                  <th style={{ minWidth: '100px' }}>Rating</th>
                  <th style={{ minWidth: '100px' }}>Contests</th>
                  <th style={{ minWidth: '120px' }}>Solved (ALL)</th>
                  <th style={{ minWidth: '150px' }}>Easy / Med / Hard</th>
                </>
              )}
              {activeTab === 'pgp' && (
                <>
                  <th style={{ minWidth: '120px' }}>Points</th>
                  <th style={{ minWidth: '140px' }}>Programs Solved</th>
                  <th style={{ minWidth: '110px' }}>Code Tests</th>
                  <th style={{ minWidth: '110px' }}>DC / DT</th>
                  <th style={{ minWidth: '130px' }}>SkillRack Rank</th>
                </>
              )}
              {activeTab === 'overall' && (
                <>
                  <th style={{ minWidth: '150px' }}>Composite Score</th>
                  <th style={{ minWidth: '130px' }}>LeetCode Rank</th>
                  <th style={{ minWidth: '120px' }}>PGP Points</th>
                  <th style={{ minWidth: '170px' }}>Solved (LC / PGP)</th>
                </>
              )}
              <th style={{ width: '90px', minWidth: '90px', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody key={activeTab} className="tab-content-fade">
            {paginatedStudents.length === 0 ? (
              <tr>
                <td colSpan="10" className="empty-state">
                  <div className="empty-state-icon">
                    <SearchX size={32} color="var(--text-light)" />
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem' }}>No student records found</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>Try adjusting your department, batch, or gender filters, or modify your search query.</div>
                </td>
              </tr>
            ) : (
              paginatedStudents.map((st, index) => {
                const rankNum = (pageSize === 'All' ? index : (currentPage - 1) * Number(pageSize) + index) + 1;
                const lcId = st.leetcode?.leetcodeId || st.leetcodeId || '';
                const lcGlobalRank = st.leetcode?.globalRank ?? st.lcGlobalRank ?? 999999;
                const lcRating = st.leetcode?.contestRating ?? st.lcContestRating ?? 1500;
                const lcContests = st.leetcode?.contestAttended ?? st.lcContestsAttended ?? 0;
                const lcSolved = st.leetcode?.solvedTotal ?? st.lcSolvedTotal ?? 0;
                const lcEasy = st.leetcode?.solvedEasy ?? st.lcSolvedEasy ?? 0;
                const lcMed = st.leetcode?.solvedMedium ?? st.lcSolvedMedium ?? 0;
                const lcHard = st.leetcode?.solvedHard ?? st.lcSolvedHard ?? 0;

                const pgpPoints = st.pgp?.points ?? st.pgpPoints ?? 0;
                const pgpSolved = st.pgp?.programsSolved ?? st.pgpProgramsSolved ?? 0;
                const pgpTests = st.pgp?.codeTests ?? st.pgpCodeTests ?? 0;
                const pgpDc = st.pgp?.dc ?? st.pgpDc ?? 0;
                const pgpDt = st.pgp?.dt ?? st.pgpDt ?? 0;
                const pgpRank = st.pgp?.skillrackRank ?? st.pgpSkillrackRank ?? 0;

                const weeklyScore = st.weeklyAssessment?.score ?? st.weeklyScore ?? 0;
                const weeklyRank = st.weeklyAssessment?.rank ?? st.weeklyRank ?? 0;
                const weeklyCode = st.weeklyAssessment?.codeScore ?? st.weeklyCodeScore ?? 0;
                const weeklyMcq = st.weeklyAssessment?.mcqScore ?? st.weeklyMcqScore ?? 0;

                const compScore = st.compositeScore ?? calculateCompositeScore(st);

                return (
                  <tr key={st.rollNo || st.id || index} onClick={() => onSelectStudent(st)} style={{ cursor: 'pointer' }}>
                    {/* Rank */}
                    <td style={{ textAlign: 'center' }}>
                      <span className={`rank-pill rank-${rankNum <= 3 ? rankNum : 'other'}`}>
                        {rankNum === 1 ? '🥇 #1' : rankNum === 2 ? '🥈 #2' : rankNum === 3 ? '🥉 #3' : `#${rankNum}`}
                      </span>
                    </td>

                    {/* Student Info */}
                    <td>
                      <div className="coder-info">
                        <div className="avatar-circle">
                          {st.name ? st.name.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <div>
                          <div className="coder-name">{st.name}</div>
                          <div className="coder-meta">
                            <span>{st.rollNo}</span>
                            {lcId && (
                              <span style={{ color: 'var(--sece-navy-600)', fontWeight: 600 }}>
                                • @{lcId}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Dept & Batch */}
                    <td>
                      <span className="badge-dept">{st.department}</span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '2px' }}>
                        {st.batch}
                      </div>
                    </td>

                    {/* Tab Specific Columns */}
                    {activeTab === 'weekly' && (
                      <>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="stat-highlight" style={{ color: weeklyScore >= 100 ? '#D99B00' : 'var(--sece-navy-700)', fontSize: '1rem', fontWeight: 900 }}>
                              {weeklyScore} pts
                            </span>
                            {weeklyScore >= 100 && (
                              <span style={{ background: '#FFB800', color: '#002855', fontSize: '0.65rem', fontWeight: 900, padding: '2px 5px', borderRadius: '4px' }}>
                                💯 100+
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 800, color: '#10B981', background: 'rgba(16,185,129,0.1)', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                            {weeklyCode} / 4 Solved
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: '#2563EB', fontSize: '0.85rem' }}>
                            {weeklyMcq} / 100
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            {weeklyRank > 0 ? `#${weeklyRank}` : 'N/A'}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.85rem', color: 'var(--sece-gold-600)', fontWeight: 700 }}>
                            {pgpPoints > 0 ? `${pgpPoints.toLocaleString()} pts` : '—'}
                          </span>
                        </td>
                      </>
                    )}

                    {activeTab === 'leetcode' && (
                      <>
                        <td>
                          <span className="stat-highlight">
                            {lcGlobalRank > 0 && lcGlobalRank < 900000 ? `#${lcGlobalRank.toLocaleString()}` : 'N/A'}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 800, color: 'var(--sece-navy-700)' }}>
                            {Math.round(Number(lcRating))}
                          </span>
                        </td>
                        <td>{lcContests}</td>
                        <td>
                          <span className="stat-highlight" style={{ color: '#10B981' }}>
                            {lcSolved}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.8rem', display: 'flex', gap: '6px' }}>
                            <span style={{ color: '#10B981' }}>{lcEasy}E</span>
                            <span style={{ color: '#F59E0B' }}>{lcMed}M</span>
                            <span style={{ color: '#EF4444' }}>{lcHard}H</span>
                          </div>
                        </td>
                      </>
                    )}

                    {activeTab === 'pgp' && (
                      <>
                        <td>
                          <span className="stat-highlight" style={{ color: '#D99B00', fontSize: '1rem' }}>
                            {pgpPoints.toLocaleString()}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700 }}>{pgpSolved}</span>
                        </td>
                        <td>{pgpTests}</td>
                        <td>
                          <span style={{ fontSize: '0.85rem' }}>{pgpDc} / {pgpDt}</span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {pgpRank > 0 ? `#${pgpRank.toLocaleString()}` : 'N/A'}
                          </span>
                        </td>
                      </>
                    )}

                    {activeTab === 'overall' && (
                      <>
                        <td>
                          <span className="stat-highlight" style={{ color: '#D99B00', fontSize: '1.05rem' }}>
                            {compScore.toLocaleString()}
                          </span>
                        </td>
                        <td>
                          {lcGlobalRank > 0 && lcGlobalRank < 900000 ? `#${lcGlobalRank.toLocaleString()}` : 'N/A'}
                        </td>
                        <td>{pgpPoints.toLocaleString()} pts</td>
                        <td>
                          <span style={{ fontSize: '0.85rem' }}>{lcSolved} LC / {pgpSolved} PGP</span>
                        </td>
                      </>
                    )}

                    {/* Actions */}
                    <td onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button
                          className="btn-icon"
                          title="Edit coder"
                          onClick={() => onEditStudent(st)}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="btn-icon delete"
                          title="Delete coder"
                          onClick={() => onDeleteStudent(st.rollNo || st.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Instant Pagination Controls Toolbar */}
      {sortedStudents.length > 0 && (
        <div className="pagination-toolbar">
          {/* Info & Page Size */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', color: 'var(--text-muted)' }}>
            <span>
              Showing <strong style={{ color: 'var(--text-main)' }}>{startIndex}</strong> to <strong style={{ color: 'var(--text-main)' }}>{endIndex}</strong> of <strong style={{ color: 'var(--text-main)' }}>{sortedStudents.length.toLocaleString()}</strong> students
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(e.target.value === 'All' ? 'All' : Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="select-dropdown"
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem', borderRadius: '6px' }}
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={250}>250</option>
                <option value="All">All</option>
              </select>
            </div>
          </div>

          {/* Navigation Buttons */}
          {pageSize !== 'All' && totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button
                className="btn-icon"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                title="First Page"
                style={{ opacity: currentPage === 1 ? 0.4 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                <ChevronsLeft size={16} />
              </button>

              <button
                className="btn-icon"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                title="Previous Page"
                style={{ opacity: currentPage === 1 ? 0.4 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                <ChevronLeft size={16} />
              </button>

              <span className="page-indicator">
                Page {currentPage} of {totalPages}
              </span>

              <button
                className="btn-icon"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                title="Next Page"
                style={{ opacity: currentPage === totalPages ? 0.4 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
              >
                <ChevronRight size={16} />
              </button>

              <button
                className="btn-icon"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                title="Last Page"
                style={{ opacity: currentPage === totalPages ? 0.4 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
