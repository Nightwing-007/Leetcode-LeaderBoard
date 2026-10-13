import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Header } from './components/Header';
import { AnalyticsView } from './components/AnalyticsView';
import { Podium } from './components/Podium';
import { LeaderboardTable } from './components/LeaderboardTable';
import { DepartmentView } from './components/DepartmentView';
import { TvModeSlideshow } from './components/TvModeSlideshow';
import { ExcelUploaderModal } from './components/ExcelUploaderModal';
import { DataEditorModal } from './components/DataEditorModal';
import { AdminLogin } from './components/AdminLogin';
import { INITIAL_STUDENTS_DATA, calculateCompositeScore } from './data/sampleData';
import {
  fetchLeaderboard,
  fetchDashboardStatistics,
  deleteStudentFromBackend,
  saveStudentToBackend,
  getAdminToken,
  removeAdminToken
} from './api/leaderboardApi';
import {
  dbGetAllStudents,
  dbReplaceAllStudents,
  dbSaveStudent,
  dbDeleteStudent
} from './db/database';

function Dashboard({
  isAdmin,
  setIsAdmin,
  handleLogout,
  theme,
  setTheme,
  darkMode,
  setDarkMode
}) {
  const [students, setStudents] = useState([]);
  const [allCollegeStudents, setAllCollegeStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('college');
  const [backendAvailable, setBackendAvailable] = useState(false);
  const [dashboardStats, setDashboardStats] = useState(null);

  const [tvMode, setTvMode] = useState(false);
  const [soundEnabled] = useState(true);

  // Filters state
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedBatch, setSelectedBatch] = useState('All');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('All');
  const [selectedSection, setSelectedSection] = useState('All');
  const [selectedGender, setSelectedGender] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination state
  const [serverPage, setServerPage] = useState(0);
  const [serverTotalPages, setServerTotalPages] = useState(1);
  const [serverTotalElements, setServerTotalElements] = useState(0);

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Debounce search query so server isn't hit on every single keystroke
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load students data from Backend or IndexedDB fallback
  const loadData = useCallback(async (page = 0, tab = activeTab, queryParam = debouncedSearchQuery) => {
    try {
      const data = await fetchLeaderboard(tab, {
        dept: selectedDept,
        batch: selectedBatch,
        academicYear: selectedAcademicYear,
        section: selectedSection,
        gender: selectedGender,
        query: queryParam,
        page: page,
        size: 50
      });

      if (data && (Array.isArray(data) || Array.isArray(data.content))) {
        const studentList = Array.isArray(data.content) ? data.content : data;
        setStudents(studentList);
        setServerTotalPages(data.totalPages ?? 1);
        setServerTotalElements(data.totalElements ?? studentList.length);
        setServerPage(page);
        setBackendAvailable(true);

        fetchDashboardStatistics()
          .then((stats) => setDashboardStats(stats))
          .catch(() => {});

        // Fetch unpaginated dataset for entire college analytics & charts
        // CRITICAL: NEVER pass query here so full cohort data is never stripped!
        fetchLeaderboard('overall', {
          dept: selectedDept,
          batch: selectedBatch,
          academicYear: selectedAcademicYear,
          section: selectedSection,
          gender: selectedGender,
          page: null,
          size: null
        })
          .then((allData) => {
            const fullList = Array.isArray(allData?.content) ? allData.content : (Array.isArray(allData) ? allData : []);
            if (fullList.length > 0) {
              setAllCollegeStudents(fullList);
            }
          })
          .catch(() => {});

        return;
      }
    } catch (err) {
      setBackendAvailable(false);
    }

    try {
      const recordsFromDb = await dbGetAllStudents();
      if (recordsFromDb && recordsFromDb.length > 0) {
        setStudents(recordsFromDb);
        setAllCollegeStudents(recordsFromDb);
      } else {
        await dbReplaceAllStudents(INITIAL_STUDENTS_DATA);
        const seeded = await dbGetAllStudents();
        setStudents(seeded);
        setAllCollegeStudents(seeded);
      }
    } catch (err) {
      setStudents(INITIAL_STUDENTS_DATA);
      setAllCollegeStudents(INITIAL_STUDENTS_DATA);
    }
  }, [activeTab, selectedDept, selectedBatch, selectedAcademicYear, selectedSection, selectedGender, debouncedSearchQuery]);

  useEffect(() => {
    loadData(0, activeTab);
  }, [loadData, activeTab]);

  const handlePageChange = (newPage) => {
    setServerPage(newPage);
    loadData(newPage, activeTab);
  };

  // Unpaginated full dataset across the college
  const fullStudentsList = useMemo(() => {
    if (allCollegeStudents && allCollegeStudents.length > 0) {
      return allCollegeStudents;
    }
    return students;
  }, [allCollegeStudents, students]);

  // Cohort dataset filtered ONLY by cohort attributes (Dept, Batch, Year, Section, Gender)
  // Strictly independent of table search text and table pagination
  const cohortStudents = useMemo(() => {
    return fullStudentsList.filter((st) => {
      const matchesDept = selectedDept === 'All' || st.department === selectedDept;
      const matchesBatch = selectedBatch === 'All' || st.batch === selectedBatch;
      const matchesYear = selectedAcademicYear === 'All' || String(st.academicYear) === String(selectedAcademicYear);
      const matchesSection = selectedSection === 'All' || (st.section && st.section.toUpperCase() === selectedSection.toUpperCase());
      const matchesGender = selectedGender === 'All' || (st.gender && st.gender.toLowerCase() === selectedGender.toLowerCase());
      return matchesDept && matchesBatch && matchesYear && matchesSection && matchesGender;
    });
  }, [fullStudentsList, selectedDept, selectedBatch, selectedAcademicYear, selectedSection, selectedGender]);

  // Full filtered dataset with table search query applied (for search result counting)
  const filteredStudents = useMemo(() => {
    const q = (searchQuery || '').toLowerCase().trim();
    if (!q) return cohortStudents;
    return cohortStudents.filter((st) => {
      return (
        st.name?.toLowerCase().includes(q) ||
        st.rollNo?.toLowerCase().includes(q) ||
        st.registerNumber?.toLowerCase().includes(q) ||
        (st.leetcode?.leetcodeId && st.leetcode.leetcodeId.toLowerCase().includes(q)) ||
        (st.leetcodeId && st.leetcodeId.toLowerCase().includes(q))
      );
    });
  }, [cohortStudents, searchQuery]);

  // Top 3 Podium Toppers are calculated from the cohort dataset, NEVER from the search query or table page!
  const top3Rankers = useMemo(() => {
    const listToRank = cohortStudents.length > 0 ? cohortStudents : fullStudentsList;
    return [...listToRank]
      .sort((a, b) => {
        if (['college', 'year', 'department', 'dept_year', 'class', 'overall'].includes(activeTab)) {
          if (a.rank !== undefined && b.rank !== undefined && a.rank !== null && b.rank !== null) {
            return a.rank - b.rank;
          }
          const ca = a.overallScore != null ? Number(a.overallScore) : (a.compositeScore ?? calculateCompositeScore(a));
          const cb = b.overallScore != null ? Number(b.overallScore) : (b.compositeScore ?? calculateCompositeScore(b));
          return cb - ca;
        }
        if (activeTab === 'weekly') {
          const sa = a.weeklyAssessment?.score ?? a.weeklyScore ?? 0;
          const sb = b.weeklyAssessment?.score ?? b.weeklyScore ?? 0;
          if (sb !== sa) return sb - sa;
          const getWeeklyRank = (st) => {
            const r = st.weeklyAssessment?.rank ?? st.weeklyRank;
            return (r && Number(r) > 0) ? Number(r) : 9999999;
          };
          return getWeeklyRank(a) - getWeeklyRank(b);
        }
        if (activeTab === 'leetcode') {
          const getLcRank = (st) => {
            const r = st.leetcode?.globalRank ?? st.lcGlobalRank;
            return (r && Number(r) > 0) ? Number(r) : 9999999;
          };
          const ga = getLcRank(a);
          const gb = getLcRank(b);
          if (ga !== gb) return ga - gb;
          const ra = a.leetcode?.contestRating ?? a.lcContestRating ?? 0;
          const rb = b.leetcode?.contestRating ?? b.lcContestRating ?? 0;
          if (rb !== ra) return rb - ra;
          const sa = a.leetcode?.solvedTotal ?? a.lcSolvedTotal ?? 0;
          const sb = b.leetcode?.solvedTotal ?? b.lcSolvedTotal ?? 0;
          return sb - sa;
        }
        if (activeTab === 'pgp') {
          const pa = a.pgp?.points ?? a.pgpPoints ?? 0;
          const pb = b.pgp?.points ?? b.pgpPoints ?? 0;
          return pb - pa;
        }
        const ca = a.compositeScore ?? calculateCompositeScore(a);
        const cb = b.compositeScore ?? calculateCompositeScore(b);
        return cb - ca;
      })
      .slice(0, 3);
  }, [cohortStudents, fullStudentsList, activeTab]);

  const handleUploadSuccess = async (newStudentsList, detectedType) => {
    const typeToSet = detectedType || newStudentsList?.detectedType || 'college';
    if (typeToSet) {
      setActiveTab(typeToSet);
    }

    if (newStudentsList && newStudentsList.length > 0) {
      setStudents(newStudentsList);
      setAllCollegeStudents(newStudentsList);
    } else {
      await loadData(0, typeToSet);
    }
  };

  const handleSaveStudent = async (savedStudent) => {
    try {
      if (backendAvailable) {
        await saveStudentToBackend(savedStudent);
        await loadData(serverPage, activeTab);
      } else {
        await dbSaveStudent(savedStudent);
        const updated = await dbGetAllStudents();
        setStudents(updated);
        setAllCollegeStudents(updated);
      }
    } catch (err) {
      console.error('Failed to save student:', err);
    }
  };

  const handleDeleteStudent = async (studentRollOrId) => {
    if (window.confirm('Are you sure you want to remove this student record?')) {
      try {
        if (backendAvailable) {
          await deleteStudentFromBackend(studentRollOrId);
          await loadData(serverPage, activeTab);
        } else {
          await dbDeleteStudent(studentRollOrId);
          const updated = await dbGetAllStudents();
          setStudents(updated);
          setAllCollegeStudents(updated);
        }
      } catch (err) {
        console.error('Failed to delete student:', err);
      }
    }
  };

  return (
    <div className="app-root">
      {/* SECE College Header */}
      <Header
        isAdmin={isAdmin}
        onLogout={handleLogout}
        onOpenUpload={() => setIsUploadOpen(true)}
        onToggleTvMode={() => setTvMode(true)}
        theme={theme}
        setTheme={setTheme}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        totalCoders={dashboardStats?.totalStudents ?? fullStudentsList.length}
      />

      {/* Main Content Area */}
      <main className="main-wrapper">
        {/* KPI Institutional Metrics & Department-Wise Category Breakdown */}
        <AnalyticsView
          data={cohortStudents}
          students={cohortStudents}
          activeTab={activeTab}
          dashboardStats={dashboardStats}
        />

        {/* 3D Glassmorphism Podium for Top 3 */}
        <Podium
          top3={top3Rankers}
          activeTab={activeTab}
          onSelectStudent={(st) => setSelectedStudent(st)}
          soundEnabled={soundEnabled}
        />

        {/* Multi-Tab Filterable Table */}
        <LeaderboardTable
          students={students}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedDept={selectedDept}
          setSelectedDept={setSelectedDept}
          selectedBatch={selectedBatch}
          setSelectedBatch={setSelectedBatch}
          selectedAcademicYear={selectedAcademicYear}
          setSelectedAcademicYear={setSelectedAcademicYear}
          selectedSection={selectedSection}
          setSelectedSection={setSelectedSection}
          selectedGender={selectedGender}
          setSelectedGender={setSelectedGender}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedStudent={selectedStudent}
          onSelectStudent={(st) => setSelectedStudent(st)}
          onEditStudent={(st) => {
            setStudentToEdit(st);
            setIsEditorOpen(true);
          }}
          onDeleteStudent={handleDeleteStudent}
          isAdmin={isAdmin}
          serverPage={backendAvailable ? serverPage : undefined}
          serverTotalPages={backendAvailable ? serverTotalPages : undefined}
          serverTotalElements={backendAvailable ? serverTotalElements : undefined}
          onPageChange={backendAvailable ? handlePageChange : undefined}
        />

        {/* Departmental Comparison */}
        <DepartmentView
          students={fullStudentsList}
          activeTab={activeTab}
          onSelectStudent={(st) => setSelectedStudent(st)}
        />
      </main>

      {/* Smart TV Kiosk Broadcast Slideshow Mode */}
      {tvMode && (
        <TvModeSlideshow
          students={fullStudentsList}
          onCloseTvMode={() => setTvMode(false)}
          soundEnabled={soundEnabled}
        />
      )}

      {/* Excel Multi-Sheet Upload Modal */}
      <ExcelUploaderModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        currentStudents={students}
      />

      {/* Data Add / Edit Record Modal */}
      <DataEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveStudent}
        studentToEdit={studentToEdit}
      />

      {/* Footer with subtle Admin Login Link */}
      <footer className="app-footer">
        <p style={{ fontWeight: 700, color: 'var(--text-muted)' }}>
          Sri Eshwar College of Engineering • Department of Technical Training
        </p>
        <p style={{ marginTop: '0.25rem', fontSize: '0.75rem' }}>
          College Performance Dashboard — Dynamic PostgreSQL Views • LeetCode • SkillRack • Multi-Platform Isolation
        </p>
        <div style={{ marginTop: '0.75rem' }}>
          {isAdmin ? (
            <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700 }}>
              Authenticated Admin Active •{' '}
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#EF4444',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: 0
                }}
              >
                Sign Out
              </button>
            </span>
          ) : (
            <Link
              to="/login"
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                textDecoration: 'none',
                opacity: 0.7,
                transition: 'opacity 0.2s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
            >
              <span>🔒 Admin Portal Access</span>
            </Link>
          )}
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  const [isAdmin, setIsAdmin] = useState(() => Boolean(getAdminToken()));

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('sece_theme');
    if (saved === 'dark') return 'dark';
    if (saved === 'antigravity' || saved === 'minimal') return 'antigravity';
    if (saved === 'classic' || saved === 'light') return 'classic';
    return 'classic';
  });

  const darkMode = theme === 'dark';
  const setDarkMode = (val) => setTheme(val ? 'dark' : 'classic');

  // Sync theme HTML attribute
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('sece_theme', 'dark');
    } else if (theme === 'antigravity' || theme === 'minimal') {
      document.documentElement.setAttribute('data-theme', 'antigravity');
      localStorage.setItem('sece_theme', 'antigravity');
    } else {
      document.documentElement.setAttribute('data-theme', 'classic');
      localStorage.setItem('sece_theme', 'classic');
    }
  }, [theme]);

  const handleLogout = () => {
    removeAdminToken();
    setIsAdmin(false);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Dashboard
              isAdmin={isAdmin}
              setIsAdmin={setIsAdmin}
              handleLogout={handleLogout}
              theme={theme}
              setTheme={setTheme}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
            />
          }
        />
        <Route
          path="/login"
          element={
            <AdminLogin
              isAdmin={isAdmin}
              onLoginSuccess={() => setIsAdmin(true)}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
