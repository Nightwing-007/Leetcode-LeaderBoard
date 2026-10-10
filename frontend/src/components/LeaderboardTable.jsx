import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  ArrowUpDown,
  Edit2,
  Trash2,
  Award,
  Trophy,
  Zap,
  Sparkles,
  Target,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  SearchX,
  Users,
  GraduationCap,
  Building,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  COLLEGE_DEPARTMENTS,
  COLLEGE_BATCHES,
  ACADEMIC_YEARS,
  COLLEGE_SECTIONS,
  GENDER_FILTERS,
  calculateCompositeScore
} from '../data/sampleData';
import { CustomSelect } from './CustomSelect';
import { CategoryBadge } from './CategoryBadge';
import { StudentDetailCard } from './StudentDetailCard';

export function LeaderboardTable({
  students = [],
  activeTab = 'college',
  setActiveTab,
  selectedDept = 'All',
  setSelectedDept,
  selectedBatch = 'All',
  setSelectedBatch,
  selectedAcademicYear = 'All',
  setSelectedAcademicYear,
  selectedSection = 'All',
  setSelectedSection,
  selectedGender = 'All',
  setSelectedGender,
  searchQuery = '',
  setSearchQuery,
  selectedStudent = null,
  onSelectStudent,
  onEditStudent,
  onDeleteStudent,
  isAdmin = false,
  serverPage,
  serverTotalPages,
  serverTotalElements,
  onPageChange
}) {
  const [sortBy, setSortBy] = useState('rank');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50); // 25 | 50 | 100 | 250 | 'All'
  const [expandedStudentRoll, setExpandedStudentRoll] = useState(null);

  const handleToggleExpand = (st) => {
    const roll = st.rollNo || st.registerNumber || st.id;
    const isCurrentlyExpanded = expandedStudentRoll === roll;
    setExpandedStudentRoll(isCurrentlyExpanded ? null : roll);
    if (onSelectStudent) {
      onSelectStudent(isCurrentlyExpanded ? null : st);
    }
  };

  // Reset pagination when tab or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, selectedDept, selectedBatch, selectedAcademicYear, selectedSection, selectedGender, searchQuery, sortBy]);

  // Reset sort when tab switches
  useEffect(() => {
    setSortBy('rank');
  }, [activeTab]);

  // Determine if this is a PostgreSQL Topper View tab
  const isTopperTab = ['college', 'year', 'department', 'dept_year', 'class'].includes(activeTab);

  // Client-side filtering when working with in-memory array
  const filteredStudents = useMemo(() => {
    const q = (searchQuery || '').toLowerCase().trim();
    return students.filter(st => {
      const matchesDept = selectedDept === 'All' || st.department === selectedDept;
      const matchesBatch = selectedBatch === 'All' || st.batch === selectedBatch;
      const matchesYear = selectedAcademicYear === 'All' || String(st.academicYear) === String(selectedAcademicYear);
      const matchesSection = selectedSection === 'All' || (st.section && st.section.toUpperCase() === selectedSection.toUpperCase());
      const matchesGender = selectedGender === 'All' || st.gender === selectedGender;
      const matchesSearch = !q ||
        st.name?.toLowerCase().includes(q) ||
        st.rollNo?.toLowerCase().includes(q) ||
        st.registerNumber?.toLowerCase().includes(q) ||
        (st.leetcode?.leetcodeId && st.leetcode.leetcodeId.toLowerCase().includes(q)) ||
        (st.leetcodeId && st.leetcodeId.toLowerCase().includes(q));
      return matchesDept && matchesBatch && matchesYear && matchesSection && matchesGender && matchesSearch;
    });
  }, [students, selectedDept, selectedBatch, selectedAcademicYear, selectedSection, selectedGender, searchQuery]);

  // Sorting
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
        const pa = a.pgp?.points ?? a.pgpPoints ?? 0;
        const pb = b.pgp?.points ?? b.pgpPoints ?? 0;
        return pb - pa;
      } else if (activeTab === 'class') {
        if (sortBy === 'percentile') {
          const pa = a.percentile != null ? Number(a.percentile) : 0;
          const pb = b.percentile != null ? Number(b.percentile) : 0;
          return pb - pa;
        }
        const ra = a.rank ?? 999999;
        const rb = b.rank ?? 999999;
        return ra - rb;
      }

      // Topper Views and Composite Rank
      const ca = a.overallScore != null ? Number(a.overallScore) : (a.compositeScore ?? calculateCompositeScore(a));
      const cb = b.overallScore != null ? Number(b.overallScore) : (b.compositeScore ?? calculateCompositeScore(b));
      if (sortBy === 'score') {
        return cb - ca;
      }
      if (a.rank !== undefined && b.rank !== undefined && a.rank !== null && b.rank !== null) {
        return a.rank - b.rank;
      }
      return cb - ca;
    });
  }, [filteredStudents, activeTab, sortBy]);

  // Paginated window
  const isServerPaged = serverPage !== undefined && serverTotalPages !== undefined;

  const paginatedStudents = useMemo(() => {
    if (isServerPaged) return sortedStudents;
    if (pageSize === 'All') return sortedStudents;
    const start = (currentPage - 1) * Number(pageSize);
    return sortedStudents.slice(start, start + Number(pageSize));
  }, [sortedStudents, currentPage, pageSize, isServerPaged]);

  const activePage = isServerPaged ? (serverPage + 1) : currentPage;
  const totalPages = isServerPaged
    ? Math.max(1, serverTotalPages)
    : (pageSize === 'All' ? 1 : Math.max(1, Math.ceil(sortedStudents.length / Number(pageSize))));
  const totalCount = isServerPaged ? (serverTotalElements ?? sortedStudents.length) : sortedStudents.length;

  const startIndex = totalCount === 0 ? 0 : (pageSize === 'All' ? 1 : (activePage - 1) * Number(pageSize) + 1);
  const endIndex = pageSize === 'All' ? totalCount : Math.min(activePage * Number(pageSize), totalCount);

  // When selectedStudent changes from outside (e.g. Podium or DepartmentView), auto-expand and scroll to them
  useEffect(() => {
    if (selectedStudent) {
      const roll = selectedStudent.rollNo || selectedStudent.registerNumber || selectedStudent.id;
      if (roll) {
        // If student is in filtered/sorted list and on another page, navigate to that page
        const studentIndex = sortedStudents.findIndex(
          s => (s.rollNo || s.registerNumber || s.id) === roll
        );
        if (studentIndex !== -1 && pageSize !== 'All') {
          const targetPage = Math.floor(studentIndex / Number(pageSize)) + 1;
          if (currentPage !== targetPage) {
            setCurrentPage(targetPage);
          }
        }

        setExpandedStudentRoll(roll);
        setTimeout(() => {
          const el = document.getElementById(`student-row-${roll}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 150);
      }
    }
  }, [selectedStudent, sortedStudents, pageSize, currentPage]);

  const handlePageNavigation = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    if (isServerPaged && onPageChange) {
      onPageChange(newPage - 1);
    } else {
      setCurrentPage(newPage);
    }
  };

  return (
    <section>
      {/* Header & Tabs */}
      <div className="section-header" style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Trophy size={28} color="var(--sece-gold-500)" />
          <div>
            <h2 className="section-title" style={{ margin: 0 }}>
              <span>SECE Institutional Performance Leaderboards</span>
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Dynamic PostgreSQL view-calculated rankings across College, Year, Department, and Class cohorts
            </p>
          </div>
        </div>

        {/* 5 Major Ranking Tabs & Platform Tabs */}
        <div style={{ display: 'flex', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '5px', gap: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', flexWrap: 'wrap' }}>
          {/* Tab 1: College Toppers */}
          <button
            className="btn"
            style={{
              fontSize: '0.825rem',
              padding: '0.45rem 0.8rem',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'college' ? 'linear-gradient(135deg, #FFB800, #FFC72C)' : 'transparent',
              color: activeTab === 'college' ? '#002855' : 'var(--text-main)',
              fontWeight: activeTab === 'college' ? 800 : 600,
              boxShadow: activeTab === 'college' ? '0 2px 8px rgba(255, 184, 0, 0.4)' : 'none'
            }}
            onClick={() => setActiveTab && setActiveTab('college')}
          >
            <Award size={15} />
            <span>College Toppers</span>
          </button>

          {/* Tab 2: Year-Wise Toppers */}
          <button
            className="btn"
            style={{
              fontSize: '0.825rem',
              padding: '0.45rem 0.8rem',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'year' ? 'var(--sece-navy-900)' : 'transparent',
              color: activeTab === 'year' ? '#FFC72C' : 'var(--text-main)',
              fontWeight: activeTab === 'year' ? 800 : 600,
              boxShadow: activeTab === 'year' ? '0 2px 8px rgba(0, 40, 85, 0.35)' : 'none'
            }}
            onClick={() => setActiveTab && setActiveTab('year')}
          >
            <GraduationCap size={15} />
            <span>Year Toppers</span>
          </button>

          {/* Tab 3: Department-Wise */}
          <button
            className="btn"
            style={{
              fontSize: '0.825rem',
              padding: '0.45rem 0.8rem',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'department' ? 'var(--sece-navy-800)' : 'transparent',
              color: activeTab === 'department' ? '#FFF' : 'var(--text-main)',
              fontWeight: activeTab === 'department' ? 800 : 600,
              boxShadow: activeTab === 'department' ? '0 2px 8px rgba(0, 40, 85, 0.35)' : 'none'
            }}
            onClick={() => setActiveTab && setActiveTab('department')}
          >
            <Building size={15} />
            <span>Dept Toppers</span>
          </button>

          {/* Tab 4: Dept + Year-Wise */}
          <button
            className="btn"
            style={{
              fontSize: '0.825rem',
              padding: '0.45rem 0.8rem',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'dept_year' ? 'var(--sece-navy-700)' : 'transparent',
              color: activeTab === 'dept_year' ? '#FFF' : 'var(--text-main)',
              fontWeight: activeTab === 'dept_year' ? 800 : 600,
              boxShadow: activeTab === 'dept_year' ? '0 2px 8px rgba(0, 51, 102, 0.35)' : 'none'
            }}
            onClick={() => setActiveTab && setActiveTab('dept_year')}
          >
            <Layers size={15} />
            <span>Dept + Year</span>
          </button>

          {/* Tab 5: Class / Section Toppers */}
          <button
            className="btn"
            style={{
              fontSize: '0.825rem',
              padding: '0.45rem 0.8rem',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'class' ? 'linear-gradient(135deg, #059669, #10B981)' : 'transparent',
              color: activeTab === 'class' ? '#FFF' : 'var(--text-main)',
              fontWeight: activeTab === 'class' ? 800 : 600,
              boxShadow: activeTab === 'class' ? '0 2px 8px rgba(16, 185, 129, 0.4)' : 'none'
            }}
            onClick={() => setActiveTab && setActiveTab('class')}
          >
            <Users size={15} />
            <span>Class Toppers</span>
          </button>

          {/* Platform Tab: SkillRack / PGP */}
          <button
            className="btn"
            style={{
              fontSize: '0.825rem', 
              padding: '0.45rem 0.8rem',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'pgp' ? 'var(--sece-gold-500)' : 'transparent',
              color: activeTab === 'pgp' ? '#002855' : 'var(--text-muted)',
              fontWeight: activeTab === 'pgp' ? 800 : 600
            }}
            onClick={() => setActiveTab && setActiveTab('pgp')}
          >
            <Zap size={14} />
            <span>SkillRack</span>
          </button>

          {/* Platform Tab: LeetCode Global */}
          <button
            className="btn"
            style={{
              fontSize: '0.825rem',
              padding: '0.45rem 0.8rem',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'leetcode' ? 'var(--sece-navy-900)' : 'transparent',
              color: activeTab === 'leetcode' ? '#FFF' : 'var(--text-muted)',
              fontWeight: activeTab === 'leetcode' ? 800 : 600
            }}
            onClick={() => setActiveTab && setActiveTab('leetcode')}
          >
            <Trophy size={14} />
            <span>LeetCode</span>
          </button>

          {/* Platform Tab: Weekly Assessment */}
          <button
            className="btn"
            style={{
              fontSize: '0.825rem',
              padding: '0.45rem 0.8rem',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'weekly' ? 'var(--sece-navy-900)' : 'transparent',
              color: activeTab === 'weekly' ? '#FFC72C' : 'var(--text-muted)',
              fontWeight: activeTab === 'weekly' ? 800 : 600
            }}
            onClick={() => setActiveTab && setActiveTab('weekly')}
          >
            <Target size={14} />
            <span>Weekly</span>
          </button>
        </div>
      </div>

      {/* Filters Bar: Multi-Cohort Selection */}
      <div className="filters-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div className="filter-group" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', flex: 1 }}>
          {/* Search Box */}
          <div className="search-box" style={{ minWidth: '220px' }}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Search Name, Roll No, Handle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Department Filter */}
          <CustomSelect
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            options={COLLEGE_DEPARTMENTS.map(d => ({ value: d, label: d === 'All' ? 'Dept: All' : `Dept: ${d}` }))}
          />

          {/* Academic Year Filter (1, 2, 3, 4) */}
          {setSelectedAcademicYear && (
            <CustomSelect
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
              options={ACADEMIC_YEARS.map(y => ({ value: y, label: y === 'All' ? 'Year: All' : `Year ${y}` }))}
            />
          )}

          {/* Section Filter (A, B, C, D) */}
          {setSelectedSection && (
            <CustomSelect
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              options={COLLEGE_SECTIONS.map(s => ({ value: s, label: s === 'All' ? 'Sec: All' : `Sec ${s}` }))}
            />
          )}

          {/* Batch Filter */}
          <CustomSelect
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            options={COLLEGE_BATCHES.map(b => ({ value: b, label: b === 'All' ? 'Batch: All' : b }))}
          />

          {/* Gender Filter */}
          <CustomSelect
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            options={GENDER_FILTERS.map(g => ({ value: g, label: g === 'All' ? 'Gender: All' : g }))}
          />
        </div>

        {/* Sort By Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowUpDown size={16} color="var(--text-light)" />
          <CustomSelect
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={
              activeTab === 'class' ? [
                { value: 'rank', label: 'Sort by: Class Rank' },
                { value: 'percentile', label: 'Sort by: Percentile' }
              ] :
              activeTab === 'weekly' ? [
                { value: 'rank', label: 'Sort by: Assessment Score' },
                { value: 'weekly_rank', label: 'Sort by: Assessment Rank' },
                { value: 'weekly_code', label: 'Sort by: Coding Score' },
                { value: 'weekly_mcq', label: 'Sort by: MCQ Score' }
              ] :
              activeTab === 'leetcode' ? [
                { value: 'rank', label: 'Sort by: Global Rank' },
                { value: 'lc_rating', label: 'Sort by: Contest Rating' },
                { value: 'lc_contests', label: 'Sort by: Contests Attended' },
                { value: 'lc_solved', label: 'Sort by: Solved Problems' }
              ] :
              activeTab === 'pgp' ? [
                { value: 'rank', label: 'Sort by: Total Points' },
                { value: 'pgp_solved', label: 'Sort by: Programs Solved' },
                { value: 'pgp_dc', label: 'Sort by: Daily Challenges' },
                { value: 'pgp_rank', label: 'Sort by: SkillRack Rank' }
              ] : [
                { value: 'rank', label: 'Sort by: Institutional Rank' },
                { value: 'score', label: 'Sort by: Overall Composite Score' }
              ]
            }
          />
        </div>
      </div>

      {/* Table Display */}
      <div className="table-responsive">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th style={{ width: '80px', minWidth: '80px', textAlign: 'center' }}>
                {activeTab === 'class' ? 'Class Rank' : activeTab === 'department' ? 'Dept Rank' : activeTab === 'year' ? 'Year Rank' : 'Rank'}
              </th>
              <th style={{ minWidth: '240px' }}>Student Details</th>
              <th style={{ minWidth: '130px' }}>Dept / Cohort</th>

              {/* Class Toppers View Columns */}
              {activeTab === 'class' && (
                <>
                  <th style={{ minWidth: '140px' }}>Composite Score</th>
                  <th style={{ minWidth: '110px', textAlign: 'center' }}>Class Size</th>
                  <th style={{ minWidth: '130px', textAlign: 'center' }}>Percentile</th>
                  <th style={{ minWidth: '140px' }}>LeetCode / SkillRack</th>
                </>
              )}

              {/* Other Topper Views (College, Year, Dept, Dept+Year) */}
              {['college', 'year', 'department', 'dept_year'].includes(activeTab) && (
                <>
                  <th style={{ minWidth: '140px' }}>Composite Score</th>
                  <th style={{ minWidth: '130px' }}>LeetCode Rank</th>
                  <th style={{ minWidth: '120px' }}>SkillRack Pts</th>
                </>
              )}

              {/* Weekly Assessment Columns */}
              {activeTab === 'weekly' && (
                <>
                  <th style={{ minWidth: '120px' }}>Test Score</th>
                  <th style={{ minWidth: '160px' }}>Coding (4 Programs)</th>
                  <th style={{ minWidth: '150px' }}>Aptitude MCQ (100)</th>
                  <th style={{ minWidth: '110px' }}>Test Rank</th>
                  <th style={{ minWidth: '120px' }}>Overall PGP</th>
                </>
              )}

              {/* LeetCode Columns */}
              {activeTab === 'leetcode' && (
                <>
                  <th style={{ minWidth: '120px' }}>Global Rank</th>
                  <th style={{ minWidth: '100px' }}>Rating</th>
                  <th style={{ minWidth: '100px' }}>Contests</th>
                  <th style={{ minWidth: '120px' }}>Solved (ALL)</th>
                  <th style={{ minWidth: '150px' }}>Easy / Med / Hard</th>
                </>
              )}

              {/* SkillRack / PGP Columns */}
              {activeTab === 'pgp' && (
                <>
                  <th style={{ minWidth: '120px' }}>Points</th>
                  <th style={{ minWidth: '140px' }}>Programs Solved</th>
                  <th style={{ minWidth: '110px' }}>Code Tests</th>
                  <th style={{ minWidth: '110px' }}>DC / DT</th>
                  <th style={{ minWidth: '130px' }}>SkillRack Rank</th>
                </>
              )}
            </tr>
          </thead>
          <tbody key={activeTab} className="tab-content-fade">
            {paginatedStudents.length === 0 ? (
              <tr>
                <td colSpan={10} className="empty-state">
                  <div className="empty-state-icon">
                    <SearchX size={32} color="var(--text-light)" />
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem' }}>No student records found</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto' }}>
                    Adjust your department, academic year, section, or batch filters, or try modifying your search query.
                  </div>
                </td>
              </tr>
            ) : (
              paginatedStudents.map((st, index) => {
                const computedRank = st.rank ?? (pageSize === 'All' ? index + 1 : (activePage - 1) * Number(pageSize) + index + 1);
                const rankNum = Number(computedRank);

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

                const compScore = st.overallScore != null ? Number(st.overallScore) : (st.compositeScore ?? calculateCompositeScore(st));

                // Class Topper specific metrics
                const classSize = st.classSize ?? 60;
                const percentileVal = st.percentile != null
                  ? Number(st.percentile).toFixed(1)
                  : (rankNum && classSize ? Math.max(0, Math.min(100, Math.round(((classSize - rankNum) / classSize) * 100))).toFixed(1) : '95.0');

                const rollId = st.rollNo || st.registerNumber || st.id;
                const isExpanded = expandedStudentRoll === rollId;

                return (
                  <React.Fragment key={rollId || index}>
                    <tr
                      id={`student-row-${rollId}`}
                      className={`student-table-row ${isExpanded ? 'row-expanded' : ''}`}
                      onClick={() => handleToggleExpand(st)}
                      style={{
                        cursor: 'pointer',
                        background: isExpanded ? 'rgba(255, 184, 0, 0.08)' : undefined,
                        borderLeft: isExpanded ? '4px solid var(--sece-gold-500)' : '4px solid transparent',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {/* Rank */}
                      <td style={{ textAlign: 'center' }}>
                        <span className={`rank-pill rank-${rankNum <= 3 ? rankNum : 'other'}`}>
                          {rankNum === 1 ? '🥇 #1' : rankNum === 2 ? '🥈 #2' : rankNum === 3 ? '🥉 #3' : `#${rankNum}`}
                        </span>
                      </td>

                      {/* Student Info */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                          <div className="coder-info">
                            <div className="avatar-circle">
                              {st.name ? st.name.charAt(0).toUpperCase() : 'S'}
                            </div>
                            <div>
                              <div className="coder-name">{st.name}</div>
                              <div className="coder-meta">
                                <span>{st.rollNo || st.registerNumber}</span>
                              </div>
                            </div>
                          </div>
                          <span
                            className="row-expand-arrow"
                            title={isExpanded ? 'Collapse profile' : 'Expand full 360° profile right here'}
                            style={{
                              color: isExpanded ? 'var(--sece-gold-600)' : 'var(--text-light)',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              background: isExpanded ? 'rgba(255, 184, 0, 0.15)' : 'transparent',
                              flexShrink: 0
                            }}
                          >
                            {isExpanded ? (
                              <>
                                <span>Close</span>
                                <ChevronUp size={14} />
                              </>
                            ) : (
                              <>
                                <span>View</span>
                                <ChevronDown size={14} />
                              </>
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Dept / Cohort */}
                      <td>
                        <span className="badge-dept">{st.department}</span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '2px' }}>
                          {st.academicYear ? `Yr ${st.academicYear}` : ''} {st.section ? `• Sec ${st.section}` : ''} ({st.batch || '2024-2028'})
                        </div>
                      </td>

                      {/* Tab Specific: Class Toppers View */}
                      {activeTab === 'class' && (
                        <>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span className="stat-highlight" style={{ color: '#D99B00', fontSize: '1rem', fontWeight: 900 }}>
                                ⭐ {Math.round(compScore).toLocaleString()}
                              </span>
                              <CategoryBadge category={st.category} score={compScore} />
                            </div>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{ fontWeight: 700, color: 'var(--text-main)', background: 'var(--bg-primary)', padding: '3px 8px', borderRadius: '6px', fontSize: '0.85rem' }}>
                              {classSize}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{
                              background: Number(percentileVal) >= 90 ? 'rgba(16, 185, 129, 0.15)' : 'var(--sece-navy-100)',
                              color: Number(percentileVal) >= 90 ? '#059669' : 'var(--sece-navy-900)',
                              fontWeight: 900,
                              padding: '3px 9px',
                              borderRadius: '12px',
                              fontSize: '0.85rem'
                            }}>
                              {percentileVal}%
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                              {lcSolved > 0 ? `${lcSolved} LC` : ''} {pgpPoints > 0 ? `• ${pgpPoints.toLocaleString()} PGP` : ''}
                            </span>
                          </td>
                        </>
                      )}

                      {/* Tab Specific: Other Topper Views (College, Year, Dept, Dept+Year) */}
                      {['college', 'year', 'department', 'dept_year'].includes(activeTab) && (
                        <>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span className="stat-highlight" style={{ color: '#D99B00', fontSize: '1.05rem', fontWeight: 900 }}>
                                ⭐ {Math.round(compScore).toLocaleString()}
                              </span>
                              <CategoryBadge category={st.category} score={compScore} />
                            </div>
                          </td>
                          <td>
                            {lcGlobalRank > 0 && lcGlobalRank < 900000 ? `#${lcGlobalRank.toLocaleString()}` : (lcRating > 1500 ? `Rating ${Math.round(lcRating)}` : '—')}
                          </td>
                          <td>
                            <span style={{ fontWeight: 700, color: 'var(--sece-navy-800)' }}>
                              {pgpPoints > 0 ? `${pgpPoints.toLocaleString()} pts` : '—'}
                            </span>
                          </td>
                        </>
                      )}

                      {/* Tab Specific: Weekly */}
                      {activeTab === 'weekly' && (
                        <>
                          <td>
                            <span className="stat-highlight" style={{ color: weeklyScore >= 100 ? '#D99B00' : 'var(--sece-navy-700)', fontSize: '1rem', fontWeight: 900 }}>
                              {weeklyScore} pts
                            </span>
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

                      {/* Tab Specific: LeetCode */}
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

                      {/* Tab Specific: SkillRack */}
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
                    </tr>

                    {/* Inline Expanded Student Profile Card - Opens right here! */}
                    {isExpanded && (
                      <tr className="expanded-detail-row">
                        <td colSpan={100} style={{ padding: '0.5rem 1rem 1rem 1rem', background: 'var(--bg-primary)' }}>
                          <StudentDetailCard
                            student={st}
                            onClose={() => {
                              setExpandedStudentRoll(null);
                              if (onSelectStudent) onSelectStudent(null);
                            }}
                            isAdmin={isAdmin}
                            onEdit={(student) => onEditStudent && onEditStudent(student)}
                            onDelete={(roll) => onDeleteStudent && onDeleteStudent(roll)}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls Toolbar */}
      {totalCount > 0 && (
        <div className="pagination-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', padding: '1rem 0' }}>
          {/* Info & Page Size */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            <span>
              Showing <strong style={{ color: 'var(--text-main)' }}>{startIndex}</strong> to <strong style={{ color: 'var(--text-main)' }}>{endIndex}</strong> of <strong style={{ color: 'var(--text-main)' }}>{totalCount.toLocaleString()}</strong> students
            </span>

            {!isServerPaged && (
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
            )}
          </div>

          {/* Navigation Buttons */}
          {(pageSize !== 'All' || isServerPaged) && totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button
                className="btn-icon"
                onClick={() => handlePageNavigation(1)}
                disabled={activePage === 1}
                title="First Page"
                style={{ opacity: activePage === 1 ? 0.4 : 1, cursor: activePage === 1 ? 'not-allowed' : 'pointer' }}
              >
                <ChevronsLeft size={16} />
              </button>

              <button
                className="btn-icon"
                onClick={() => handlePageNavigation(activePage - 1)}
                disabled={activePage === 1}
                title="Previous Page"
                style={{ opacity: activePage === 1 ? 0.4 : 1, cursor: activePage === 1 ? 'not-allowed' : 'pointer' }}
              >
                <ChevronLeft size={16} />
              </button>

              <span className="page-indicator" style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem', fontWeight: 700, background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                Page {activePage} of {totalPages}
              </span>

              <button
                className="btn-icon"
                onClick={() => handlePageNavigation(activePage + 1)}
                disabled={activePage === totalPages}
                title="Next Page"
                style={{ opacity: activePage === totalPages ? 0.4 : 1, cursor: activePage === totalPages ? 'not-allowed' : 'pointer' }}
              >
                <ChevronRight size={16} />
              </button>

              <button
                className="btn-icon"
                onClick={() => handlePageNavigation(totalPages)}
                disabled={activePage === totalPages}
                title="Last Page"
                style={{ opacity: activePage === totalPages ? 0.4 : 1, cursor: activePage === totalPages ? 'not-allowed' : 'pointer' }}
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
