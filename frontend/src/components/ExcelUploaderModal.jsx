import React, { useState } from 'react';
import { X, UploadCloud, FileSpreadsheet, Download, CheckCircle, AlertCircle, RefreshCw, Key } from 'lucide-react';
import { parseExcelData, generateLeetcodeTemplate } from '../utils/excelParser';
import { uploadExcelToBackend, clearAllDataFromBackend } from '../api/leaderboardApi';
import { dbReplaceAllStudents, dbClearAll } from '../db/database';

export function ExcelUploaderModal({ isOpen, onClose, onUploadSuccess, currentStudents }) {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [adminPin, setAdminPin] = useState('sece2026');

  if (!isOpen) return null;

  const handleFile = async (file) => {
    if (!file) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // First parse client-side to ensure IndexedDB and state stay synchronized
      const parsedStudents = await parseExcelData(file, currentStudents);
      await dbReplaceAllStudents(parsedStudents);
      const clientDetectedType = parsedStudents.detectedType || (parsedStudents.some(s => (s.weeklyAssessment?.score ?? s.weeklyScore ?? 0) > 0) ? 'weekly' : 'pgp');

      // Also upload to Spring Boot Backend if available
      let backendDetectedType = null;
      try {
        const backendRes = await uploadExcelToBackend(file, adminPin);
        if (backendRes && backendRes.success) {
          backendDetectedType = backendRes.detectedType;
          console.log(`Backend synchronized successfully: ${backendRes.totalRowsProcessed} rows processed.`);
        }
      } catch (backendErr) {
        console.warn("Backend upload failed or offline, continuing with local IndexedDB:", backendErr);
      }

      const finalDetectedType = backendDetectedType || clientDetectedType;
      const typeLabel = finalDetectedType === 'weekly' 
        ? "🎯 Weekly Assessment" 
        : (finalDetectedType === 'pgp' ? '🚀 PGP / SkillRack' : '⚡ LeetCode');

      setSuccessMsg(`Successfully processed ${parsedStudents.length} students! Switched to ${typeLabel} Leaderboard.`);

      setTimeout(() => {
        onUploadSuccess(parsedStudents, finalDetectedType);
        setLoading(false);
        onClose();
      }, 900);
    } catch (err) {
      setErrorMsg(err.message || "Failed to parse Excel file. Please verify sheet names and column headers.");
      setLoading(false);
    }
  };

  const handleClearDb = async () => {
    if (window.confirm("Are you sure you want to clear all student records from PostgreSQL and local storage?")) {
      setLoading(true);
      setErrorMsg('');
      setSuccessMsg('');

      try {
        await clearAllDataFromBackend(adminPin);
      } catch (e) {
        console.warn("Backend clear failed or offline:", e);
      }

      await dbClearAll();
      onUploadSuccess([], 'pgp');
      setSuccessMsg("Database cleared successfully! Ready for fresh report uploads.");
      setLoading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header premium-header" style={{ color: '#FFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileSpreadsheet size={24} color="#FFC72C" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFF' }}>Import Coding &amp; Placement Reports</h3>
          </div>
          <button className="btn btn-navy" style={{ padding: '0.35rem' }} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Upload <strong>Batch (2024-2028) PGP Report.xlsx</strong>, <strong>CandidateRankingDetails.xlsx</strong> (Weekly Assessment), or <strong>Leetcode Report.xlsx</strong>. The system automatically merges records by Register / Roll No and updates the Smart TV &amp; live leaderboard!
          </p>

          {/* Admin PIN Input */}
          <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-primary)', padding: '0.6rem 0.85rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <Key size={16} color="var(--sece-gold-500)" />
            <label style={{ fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap' }}>Admin PIN:</label>
            <input
              type="password"
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value)}
              placeholder="Enter Admin PIN"
              style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '0.9rem', color: 'var(--text-main)' }}
            />
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            style={{
              border: `2px dashed ${isDragging ? 'var(--sece-gold-500)' : 'var(--border-color)'}`,
              borderRadius: 'var(--radius-lg)',
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              background: isDragging ? 'var(--sece-gold-100)' : 'var(--bg-primary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={() => document.getElementById('excelFileInput').click()}
          >
            <UploadCloud size={48} color="var(--sece-navy-600)" style={{ margin: '0 auto 1rem auto' }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.35rem' }}>
              Drag &amp; Drop Excel Report (.xlsx) file here
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              or click to browse your computer
            </p>

            <input
              id="excelFileInput"
              type="file"
              accept=".xlsx, .xls, .csv"
              style={{ display: 'none' }}
              onChange={(e) => e.target.files && handleFile(e.target.files[0])}
            />
          </div>

          {/* Status Indicators */}
          {loading && (
            <div className="loading-spinner-wrapper">
              <div className="loading-spinner"></div>
              <span>Processing Excel sheets and updating records...</span>
            </div>
          )}

          {successMsg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10B981', fontWeight: 800, marginTop: '1rem', background: 'rgba(16,185,129,0.1)', padding: '0.75rem', borderRadius: '8px' }}>
              <CheckCircle size={20} />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#EF4444', fontWeight: 700, marginTop: '1rem', background: 'rgba(239,68,68,0.1)', padding: '0.75rem', borderRadius: '8px' }}>
              <AlertCircle size={20} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Template Download & Reset */}
          <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.875rem', marginBottom: '0.35rem' }}>Need sample Excel layout?</div>
              <button
                className="btn btn-gold"
                style={{ fontSize: '0.775rem', padding: '0.4rem 0.75rem' }}
                onClick={generateLeetcodeTemplate}
              >
                <Download size={14} />
                <span>Download Template</span>
              </button>
            </div>

            <button
              className="btn btn-outline"
              style={{ fontSize: '0.775rem', color: '#EF4444', padding: '0.4rem 0.75rem' }}
              onClick={handleClearDb}
              title="Clear Database"
            >
              <RefreshCw size={14} />
              <span>Clear All Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
