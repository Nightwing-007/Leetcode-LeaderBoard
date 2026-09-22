import React, { useState } from 'react';
import { Search, ArrowUpDown, ExternalLink, Edit2, Trash2, Award } from 'lucide-react';
import { COLLEGE_DEPARTMENTS, COLLEGE_BATCHES, GENDER_FILTERS, calculateCompositeScore } from '../data/sampleData';

export function LeaderboardTable({
  students,
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
  const [sortBy, setSortBy] = useState('rank'); // 'rank', 'lc_solved', 'lc_rating', 'lc_contests', 'lc_global_rank'

  // Filter students
  const filteredStudents = students.filter(st => {
    const matchesDept = selectedDept === 'All' || st.department === selectedDept;
    const matchesBatch = selectedBatch === 'All' || st.batch === selectedBatch;
    const matchesGender = selectedGender === 'All' || st.gender === selectedGender;
    const matchesSearch = !searchQuery || 
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      st.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (st.leetcode?.leetcodeId && st.leetcode.leetcodeId.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDept && matchesBatch && matchesGender && matchesSearch;
  });

  // Sort students based on user selection
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (sortBy === 'lc_solved') return (b.leetcode?.solvedTotal || 0) - (a.leetcode?.solvedTotal || 0);
    if (sortBy === 'lc_rating') return (b.leetcode?.contestRating || 0) - (a.leetcode?.contestRating || 0);
    if (sortBy === 'lc_contests') return (b.leetcode?.contestAttended || 0) - (a.leetcode?.contestAttended || 0);
    if (sortBy === 'lc_global_rank') return (a.leetcode?.globalRank || 999999) - (b.leetcode?.globalRank || 999999);
    
    // Default composite score
    return calculateCompositeScore(b) - calculateCompositeScore(a);
  });

  return (
    <section>
      {/* Header Banner */}
      <div className="section-header" style={{ marginBottom: '1rem' }}>
        <h2 className="section-title">
          <Award size={26} color="var(--sece-gold-500)" />
          <span>LeetCode College Leaderboard</span>
        </h2>
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
          <select
            className="select-dropdown"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            {COLLEGE_DEPARTMENTS.map(d => (
              <option key={d} value={d}>
                {d === 'All' ? 'All Departments' : `Dept: ${d}`}
              </option>
            ))}
          </select>

          {/* Batch Filter */}
          <select
            className="select-dropdown"
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
          >
            {COLLEGE_BATCHES.map(b => (
              <option key={b} value={b}>
                {b === 'All' ? 'All Batches' : `Batch: ${b}`}
              </option>
            ))}
          </select>

          {/* Gender Filter */}
          <select
            className="select-dropdown"
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
          >
            {GENDER_FILTERS.map(g => (
              <option key={g} value={g}>
                {g === 'All' ? 'All Genders' : g}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowUpDown size={16} color="var(--text-light)" />
          <select
            className="select-dropdown"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="rank">Sort by: Overall Rank</option>
            <option value="lc_rating">Sort by: Contest Rating</option>
            <option value="lc_contests">Sort by: Max Contests Attended</option>
            <option value="lc_solved">Sort by: LeetCode Solved (ALL)</option>
            <option value="lc_global_rank">Sort by: Global Rank</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: '60px', textAlign: 'center' }}>S.NO</th>
              <th>Roll No & Name</th>
              <th>Dept & Batch</th>
              <th>LeetCode ID</th>
              <th>Solved (ALL)</th>
              <th>Breakdown (E / M / H)</th>
              <th>Contest Rating</th>
              <th>Contests Attended</th>
              <th>Global Rank & Top %</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedStudents.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No records found matching current filters.
                </td>
              </tr>
            ) : (
              sortedStudents.map((student, index) => {
                const rankNum = index + 1;
                return (
                  <tr key={student.id} onClick={() => onSelectStudent(student)}>
                    {/* Rank Badge */}
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: rankNum === 1 ? '#FFB800' : rankNum === 2 ? '#94A3B8' : rankNum === 3 ? '#D97706' : 'var(--sece-navy-100)',
                        color: rankNum === 1 ? '#002855' : rankNum === 2 ? '#FFF' : rankNum === 3 ? '#FFF' : 'var(--sece-navy-700)'
                      }}>
                        {rankNum}
                      </span>
                    </td>

                    {/* Name, Roll No & Gender */}
                    <td>
                      <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                        {student.name}
                      </div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--text-light)', fontFamily: 'var(--font-mono)' }}>
                        {student.rollNo} • <span style={{ opacity: 0.8 }}>{student.gender}</span>
                      </div>
                    </td>

                    {/* Dept & Batch */}
                    <td>
                      <span className="dept-tag">{student.department}</span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{student.batch}</div>
                    </td>

                    {/* LeetCode ID */}
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.825rem', color: 'var(--sece-navy-700)', fontWeight: 700 }}>
                      {student.leetcode?.leetcodeId || 'N/A'}
                    </td>

                    {/* Solved ALL */}
                    <td>
                      <div style={{ fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                        {student.leetcode?.solvedTotal || 0}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ALL Solved</div>
                    </td>

                    {/* Breakdown */}
                    <td>
                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        <span className="pill pill-easy">{student.leetcode?.solvedEasy || 0} E</span>
                        <span className="pill pill-medium">{student.leetcode?.solvedMedium || 0} M</span>
                        <span className="pill pill-hard">{student.leetcode?.solvedHard || 0} H</span>
                      </div>
                    </td>

                    {/* Contest Rating */}
                    <td>
                      <span className="pill pill-rating">
                        🔥 {student.leetcode?.contestRating || 1500}
                      </span>
                    </td>

                    {/* Contests Attended */}
                    <td>
                      <div style={{ fontWeight: 800, color: '#0056B3' }}>
                        {student.leetcode?.contestAttended || 0}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>contests</div>
                    </td>

                    {/* Global Rank & Top % */}
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>#{student.leetcode?.globalRank || 'N/A'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--sece-gold-600)', fontWeight: 700 }}>Top {student.leetcode?.topPercentage || 'N/A'}</div>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn btn-outline"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                        onClick={() => onSelectStudent(student)}
                        title="View Profile Modal"
                      >
                        <ExternalLink size={14} />
                      </button>

                      <button
                        className="btn btn-outline"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', marginLeft: '0.3rem' }}
                        onClick={() => onEditStudent(student)}
                        title="Edit Record"
                      >
                        <Edit2 size={14} />
                      </button>

                      <button
                        className="btn btn-outline"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', marginLeft: '0.3rem', color: '#EF4444' }}
                        onClick={() => onDeleteStudent(student.id)}
                        title="Delete Record"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
