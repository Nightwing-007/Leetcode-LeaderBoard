import React, { useState } from 'react';
import { X, UploadCloud, FileSpreadsheet, Download, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { parseExcelData, generateLeetcodeTemplate } from '../utils/excelParser';
import { dbClearAll } from '../db/database';

export function ExcelUploaderModal({ isOpen, onClose, onUploadSuccess, currentStudents }) {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleFile = async (file) => {
    if (!file) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const parsedStudents = await parseExcelData(file, currentStudents);
      setSuccessMsg(`Successfully saved report data for ${parsedStudents.length} students into the database!`);
      
      setTimeout(() => {
        onUploadSuccess(parsedStudents);
        setLoading(false);
        onClose();
      }, 1400);
    } catch (err) {
      setErrorMsg(err.message || "Failed to parse LeetCode Excel file. Please verify sheet names and headers.");
      setLoading(false);
    }
  };

  const handleClearDb = async () => {
    if (window.confirm("Are you sure you want to clear all student data from the database? You can then upload fresh LeetCode reports.")) {
      setLoading(true);
      await dbClearAll();
      onUploadSuccess([]);
      setSuccessMsg("Database cleared successfully. Ready for fresh report uploads.");
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
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileSpreadsheet size={24} color="var(--sece-navy-700)" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Import LeetCode Report Excel Data</h3>
          </div>
          <button className="btn btn-outline" style={{ padding: '0.35rem' }} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Upload <strong>Leetcode Report.xlsx</strong> containing batch sheets (<code>23-27 leetcode, 24-28 leetcode, 25-29 leetcode</code>). Automatically updates student records across all departments (AIDS, AIML, CCE, CSBS, CSE, CYS, ECE, EEE, IT, MECH)!
          </p>

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
              Drag & Drop LeetCode Report (.xlsx) file here
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
            <div style={{ textAlign: 'center', marginTop: '1.25rem', color: 'var(--sece-navy-700)', fontWeight: 700 }}>
              Parsing LeetCode report sheets... Saving records in single database.
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
                <span>LeetCode Template</span>
              </button>
            </div>

            <button
              className="btn btn-outline"
              style={{ fontSize: '0.775rem', color: '#EF4444', padding: '0.4rem 0.75rem' }}
              onClick={handleClearDb}
              title="Clear Database to upload fresh files"
            >
              <RefreshCw size={14} />
              <span>Clear DB Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
