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
  dbGetAllStudents,
  dbReplaceAllStudents,
  dbSaveStudent,
  dbDeleteStudent
} from './db/database';

export default function App() {
  const [students, setStudents] = useState([]);
  const [dbLoaded, setDbLoaded] = useState(false);

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

  // Load data strictly from single IndexedDB database on startup
  useEffect(() => {
    async function loadDatabaseData() {
      try {
        const recordsFromDb = await dbGetAllStudents();
        if (recordsFromDb && recordsFromDb.length > 0) {
          setStudents(recordsFromDb);
        } else {
          // Seed DB with initial dataset if empty
          await dbReplaceAllStudents(INITIAL_STUDENTS_DATA);
          const seeded = await dbGetAllStudents();
          setStudents(seeded);
        }
      } catch (err) {
        console.error("Failed to load records from DB:", err);
        setStudents(INITIAL_STUDENTS_DATA);
      } finally {
        setDbLoaded(true);
      }
    }

    loadDatabaseData();
  }, []);

  // Compute Top 3 for Hall of Fame Podium
  const top3Rankers = [...students]
    .sort((a, b) => calculateCompositeScore(b) - calculateCompositeScore(a))
    .slice(0, 3);

  // Handler when new Excel file is uploaded -> Update single DB & retrieve from DB
  const handleUploadSuccess = async (newStudentsList) => {
    try {
      // Replaces all records in DB with newly uploaded records
      await dbReplaceAllStudents(newStudentsList);
      // Retrieve updated data from single DB
      const updatedFromDb = await dbGetAllStudents();
      setStudents(updatedFromDb);
    } catch (err) {
      console.error("Failed to update database with uploaded data:", err);
      setStudents(newStudentsList);
    }
  };

  // Handler for adding/editing a student -> Save to DB & retrieve from DB
  const handleSaveStudent = async (savedStudent) => {
    try {
      await dbSaveStudent(savedStudent);
      const updatedFromDb = await dbGetAllStudents();
      setStudents(updatedFromDb);
    } catch (err) {
      console.error("Failed to save student to database:", err);
    }
  };

  // Handler for deleting a student -> Remove from DB & retrieve from DB
  const handleDeleteStudent = async (studentId) => {
    if (window.confirm("Are you sure you want to remove this student record from the database?")) {
      try {
        await dbDeleteStudent(studentId);
        const updatedFromDb = await dbGetAllStudents();
        setStudents(updatedFromDb);
      } catch (err) {
        console.error("Failed to delete student from database:", err);
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
        <AnalyticsView students={students} />

        {/* 3D Glassmorphism Podium for Top 3 */}
        <Podium
          top3={top3Rankers}
          onSelectStudent={(st) => setSelectedStudent(st)}
          soundEnabled={soundEnabled}
        />

        {/* Filterable Table */}
        <LeaderboardTable
          students={students}
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

      {/* Excel Multi-Sheet Drag & Drop Upload Modal */}
      <ExcelUploaderModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
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
    </div>
  );
}
