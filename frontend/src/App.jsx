import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AnalyticsView } from './components/AnalyticsView';
import { Podium } from './components/Podium';
import { LeaderboardTable } from './components/LeaderboardTable';
import { DepartmentView } from './components/DepartmentView';
import { TvModeSlideshow } from './components/TvModeSlideshow';
import { ExcelUploaderModal } from './components/ExcelUploaderModal';
import { StudentModal } from './components/StudentModal';
import { DataEditorModal } from './components/DataEditorModal';
import { INITIAL_STUDENTS_DATA, calculateCompositeScore } from './data/sampleData';
import {
  fetchLeaderboard,
  fetchPodium,
  fetchAnalyticsSummary,
  deleteStudentFromBackend,
  saveStudentToBackend
} from './api/leaderboardApi';
import {
  dbGetAllStudents,
  dbReplaceAllStudents,
  dbSaveStudent,
  dbDeleteStudent
} from './db/database';

export default function App() {
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('pgp'); // 'pgp' | 'leetcode' | 'overall'
  const [backendAvailable, setBackendAvailable] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('sece_theme') === 'dark';
  });

  const [tvMode, setTvMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Filters state
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedBatch, setSelectedBatch] = useState('All');
  const [selectedGender, setSelectedGender] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Sync dark mode HTML attribute
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('sece_theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('sece_theme', 'light');
    }
  }, [darkMode]);

  // Load students data from Backend or IndexedDB fallback
  const loadData = async () => {
    try {
      const data = await fetchLeaderboard('overall', {
        dept: 'All',
        batch: 'All',
        gender: 'All',
        query: ''
      });
      if (data && data.length > 0) {
        setStudents(data);
        setBackendAvailable(true);
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
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute Top 3 for Hall of Fame Podium with React.useMemo for instant updates
  const top3Rankers = React.useMemo(() => {
    return [...students]
      .sort((a, b) => {
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
  }, [students, activeTab]);

  // Handler when new Excel file is uploaded
  const handleUploadSuccess = async (newStudentsList, detectedType) => {
    const typeToSet = detectedType || newStudentsList?.detectedType || (newStudentsList?.some(s => (s.weeklyAssessment?.score ?? s.weeklyScore ?? 0) > 0) ? 'weekly' : 'pgp');
    if (typeToSet) {
      setActiveTab(typeToSet);
    }

    if (newStudentsList && newStudentsList.length > 0) {
      setStudents(newStudentsList);
    } else {
      await loadData();
    }
  };

  // Handler for adding/editing a student
  const handleSaveStudent = async (savedStudent) => {
    try {
      if (backendAvailable) {
        await saveStudentToBackend(savedStudent);
        await loadData();
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
          await loadData();
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

  return (
    <div className="app-root">
      {/* SECE College Header */}
      <Header
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenAddModal={() => { setStudentToEdit(null); setIsEditorOpen(true); }}
        onToggleTvMode={() => setTvMode(true)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        totalCoders={students.length}
      />

      {/* Main Content Area */}
      <main className="main-wrapper">
        {/* KPI Metrics */}
        <AnalyticsView students={students} activeTab={activeTab} />

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
          selectedGender={selectedGender}
          setSelectedGender={setSelectedGender}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSelectStudent={(st) => setSelectedStudent(st)}
          onEditStudent={(st) => { setStudentToEdit(st); setIsEditorOpen(true); }}
          onDeleteStudent={handleDeleteStudent}
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

      {/* Student Detailed Profile Modal */}
      <StudentModal
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
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
          Coding Leaderboard Portal — LeetCode • SkillRack • Weekly Assessments
        </p>
      </footer>
    </div>
  );
}
