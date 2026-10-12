import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { AnalyticsView } from './components/AnalyticsView';
import { Podium } from './components/Podium';
import { LeaderboardTable } from './components/LeaderboardTable';
import { DepartmentView } from './components/DepartmentView';
import { TvModeSlideshow } from './components/TvModeSlideshow';
import { ExcelUploaderModal } from './components/ExcelUploaderModal';
import { DataEditorModal } from './components/DataEditorModal';
import { INITIAL_STUDENTS_DATA, calculateCompositeScore } from './data/sampleData';
import {
  fetchLeaderboard,
  fetchPodium,
  fetchDashboardStatistics,
  fetchAnalyticsSummary,
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

export default function App() {
  const [isAdmin, setIsAdmin] = useState(() => Boolean(getAdminToken()));
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('college'); // 'college' | 'year' | 'department' | 'dept_year' | 'class' | 'pgp' | 'leetcode' | 'weekly'
  const [backendAvailable, setBackendAvailable] = useState(false);
  const [dashboardStats, setDashboardStats] = useState(null);

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('sece_theme');
    if (saved === 'dark') return 'dark';
    if (saved === 'minimal') return 'minimal';
    if (saved === 'classic') return 'classic';
    if (saved === 'light') return 'classic';
    return 'classic';
  });

  const darkMode = theme === 'dark';
  const setDarkMode = (val) => setTheme(val ? 'dark' : 'classic');

  const [tvMode, setTvMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

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

  // Sync theme HTML attribute
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('sece_theme', 'dark');
    } else if (theme === 'minimal') {
      document.documentElement.setAttribute('data-theme', 'minimal');
      localStorage.setItem('sece_theme', 'minimal');
    } else {
      document.documentElement.setAttribute('data-theme', 'classic');
      localStorage.setItem('sece_theme', 'classic');
    }
  }, [theme]);

  // Load students data from Backend or IndexedDB fallback
  const loadData = useCallback(async (page = 0, tab = activeTab) => {
    try {
      const data = await fetchLeaderboard(tab, {
        dept: selectedDept,
        batch: selectedBatch,
        academicYear: selectedAcademicYear,
        section: selectedSection,
        gender: selectedGender,
        query: searchQuery,
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

        // Fetch Dashboard Statistics asynchronously
        fetchDashboardStatistics()
          .then(stats => setDashboardStats(stats))
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
      } else {
        await dbReplaceAllStudents(INITIAL_STUDENTS_DATA);
        const seeded = await dbGetAllStudents();
        setStudents(seeded);
      }
    } catch (err) {
      setStudents(INITIAL_STUDENTS_DATA);
    }
  }, [activeTab, selectedDept, selectedBatch, selectedAcademicYear, selectedSection, selectedGender, searchQuery]);

  useEffect(() => {
    loadData(0, activeTab);
  }, [loadData, activeTab]);

  // Handle server-side page navigation
  const handlePageChange = (newPage) => {
    setServerPage(newPage);
    loadData(newPage, activeTab);
  };

  // Synchronized client-side filtering across the entire dashboard
  const filteredStudents = useMemo(() => {
    if (backendAvailable) return students;
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
  }, [backendAvailable, students, selectedDept, selectedBatch, selectedAcademicYear, selectedSection, selectedGender, searchQuery]);

  // Compute Top 3 for Hall of Fame Podium with React.useMemo for instant updates
  const top3Rankers = useMemo(() => {
    const listToRank = filteredStudents.length > 0 ? filteredStudents : students;
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
          const ra = a.weeklyAssessment?.rank ?? a.weeklyRank ?? 999999;
          const rb = b.weeklyAssessment?.rank ?? b.weeklyRank ?? 999999;
          return ra - rb;
        }
        if (activeTab === 'leetcode') {
          const ga = a.leetcode?.globalRank ?? a.lcGlobalRank ?? 999999;
          const gb = b.leetcode?.globalRank ?? b.lcGlobalRank ?? 999999;
          return ga - gb;
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
  }, [students, filteredStudents, activeTab]);

  // Handler when new Excel file is uploaded
  const handleUploadSuccess = async (newStudentsList, detectedType) => {
    const typeToSet = detectedType || newStudentsList?.detectedType || 'college';
    if (typeToSet) {
      setActiveTab(typeToSet);
    }

    if (newStudentsList && newStudentsList.length > 0) {
      setStudents(newStudentsList);
    } else {
      await loadData(0, typeToSet);
    }
  };

  // Handler for adding/editing a student
  const handleSaveStudent = async (savedStudent) => {
    try {
      if (backendAvailable) {
        await saveStudentToBackend(savedStudent);
        await loadData(serverPage, activeTab);
      } else {
        await dbSaveStudent(savedStudent);
        const updated = await dbGetAllStudents();
        setStudents(updated);
      }
    } catch (err) {
      console.error("Failed to save student:", err);
    }
  };

  // Handler for deleting a student
  const handleDeleteStudent = async (studentRollOrId) => {
    if (window.confirm("Are you sure you want to remove this student record?")) {
      try {
        if (backendAvailable) {
          await deleteStudentFromBackend(studentRollOrId);
          await loadData(serverPage, activeTab);
        } else {
          await dbDeleteStudent(studentRollOrId);
          const updated = await dbGetAllStudents();
          setStudents(updated);
        }
      } catch (err) {
        console.error("Failed to delete student:", err);
      }
    }
  };

  const handleLogout = () => {
    removeAdminToken();
    setIsAdmin(false);
  };

  return (
    <div className="app-root">
      {/* SECE College Header */}
      <Header
        isAdmin={isAdmin}
        onLoginSuccess={() => setIsAdmin(true)}
        onLogout={handleLogout}
        onOpenUpload={() => setIsUploadOpen(true)}
        onToggleTvMode={() => setTvMode(true)}
        theme={theme}
        setTheme={setTheme}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        totalCoders={dashboardStats?.totalStudents ?? students.length}
      />

      {/* Main Content Area */}
      <main className="main-wrapper">
        {/* KPI Institutional Metrics */}
        <AnalyticsView
          students={filteredStudents}
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
          onEditStudent={(st) => { setStudentToEdit(st); setIsEditorOpen(true); }}
          onDeleteStudent={handleDeleteStudent}
          isAdmin={isAdmin}
          serverPage={backendAvailable ? serverPage : undefined}
          serverTotalPages={backendAvailable ? serverTotalPages : undefined}
          serverTotalElements={backendAvailable ? serverTotalElements : undefined}
          onPageChange={backendAvailable ? handlePageChange : undefined}
        />

        {/* Departmental Comparison */}
        <DepartmentView
          students={students}
          activeTab={activeTab}
          onSelectStudent={(st) => setSelectedStudent(st)}
        />
      </main>

      {/* Smart TV Kiosk Broadcast Slideshow Mode */}
      {tvMode && (
        <TvModeSlideshow
          students={students}
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

      {/* Footer */}
      <footer className="app-footer">
        <p style={{ fontWeight: 700, color: 'var(--text-muted)' }}>
          Sri Eshwar College of Engineering • Department of Technical Training
        </p>
        <p style={{ marginTop: '0.25rem', fontSize: '0.75rem' }}>
          College Performance Dashboard — Dynamic PostgreSQL Views • LeetCode • SkillRack • Multi-Platform Isolation
        </p>
      </footer>
    </div>
  );
}
