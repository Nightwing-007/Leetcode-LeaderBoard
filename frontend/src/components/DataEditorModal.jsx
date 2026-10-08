import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Edit3, Award, Code, Zap, Globe, Cpu } from 'lucide-react';
import { COLLEGE_DEPARTMENTS, COLLEGE_BATCHES, ACADEMIC_YEARS, COLLEGE_SECTIONS } from '../data/sampleData';

export function DataEditorModal({ isOpen, onClose, onSave, studentToEdit }) {
  const [activePlatformTab, setActivePlatformTab] = useState('leetcode');

  const [formData, setFormData] = useState({
    rollNo: '',
    name: '',
    department: 'CSE',
    gender: 'Male',
    batch: '2023-2027',
    academicYear: 3,
    section: 'A',
    // LeetCode
    leetcodeId: '',
    contestRating: 1650,
    contestAttended: 15,
    globalRank: 20000,
    topPercentage: '3.5%',
    solvedTotal: 500,
    solvedEasy: 150,
    solvedMedium: 270,
    solvedHard: 80,
    // SkillRack / PGP
    skillrackUsername: '',
    points: 1850,
    programsSolved: 720,
    codeTests: 45,
    codeTracks: 32,
    codeTutor: 88,
    dc: 180,
    dt: 175,
    aptitudeScore: 85,
    skillrackRank: 1250,
    // AtCoder
    atcoderId: '',
    atcoderRating: 1200,
    atcoderSolved: 140,
    // Codeforces
    codeforcesId: '',
    codeforcesRating: 1350,
    codeforcesSolved: 190,
    // Degre.AI
    degreId: '',
    degreScore: 88.5,
    degreSolved: 120
  });

  useEffect(() => {
    if (studentToEdit) {
      setFormData({
        rollNo: studentToEdit.rollNo || studentToEdit.registerNumber || '',
        name: studentToEdit.name || '',
        department: studentToEdit.department || 'CSE',
        gender: studentToEdit.gender || 'Male',
        batch: studentToEdit.batch || '2023-2027',
        academicYear: Number(studentToEdit.academicYear || 3),
        section: studentToEdit.section || 'A',
        // LeetCode
        leetcodeId: studentToEdit.leetcode?.leetcodeId || studentToEdit.leetcodeId || '',
        contestRating: studentToEdit.leetcode?.contestRating ?? studentToEdit.lcContestRating ?? 1500,
        contestAttended: studentToEdit.leetcode?.contestAttended ?? studentToEdit.lcContestsAttended ?? 0,
        globalRank: studentToEdit.leetcode?.globalRank ?? studentToEdit.lcGlobalRank ?? 50000,
        topPercentage: studentToEdit.leetcode?.topPercentage || studentToEdit.lcTopPercentage || 'N/A',
        solvedTotal: studentToEdit.leetcode?.solvedTotal ?? studentToEdit.lcSolvedTotal ?? 0,
        solvedEasy: studentToEdit.leetcode?.solvedEasy ?? studentToEdit.lcSolvedEasy ?? 0,
        solvedMedium: studentToEdit.leetcode?.solvedMedium ?? studentToEdit.lcSolvedMedium ?? 0,
        solvedHard: studentToEdit.leetcode?.solvedHard ?? studentToEdit.lcSolvedHard ?? 0,
        // SkillRack
        skillrackUsername: studentToEdit.pgp?.skillrackUsername || studentToEdit.skillrackUsername || '',
        points: studentToEdit.pgp?.points ?? studentToEdit.pgpPoints ?? 0,
        programsSolved: studentToEdit.pgp?.programsSolved ?? studentToEdit.pgpProgramsSolved ?? 0,
        codeTests: studentToEdit.pgp?.codeTests ?? studentToEdit.pgpCodeTests ?? 0,
        codeTracks: studentToEdit.pgp?.codeTracks ?? studentToEdit.pgpCodeTracks ?? 0,
        codeTutor: studentToEdit.pgp?.codeTutor ?? studentToEdit.pgpCodeTutor ?? 0,
        dc: studentToEdit.pgp?.dc ?? studentToEdit.pgpDc ?? 0,
        dt: studentToEdit.pgp?.dt ?? studentToEdit.pgpDt ?? 0,
        aptitudeScore: studentToEdit.pgp?.aptitudeScore ?? studentToEdit.pgpAptitudeScore ?? 0,
        skillrackRank: studentToEdit.pgp?.skillrackRank ?? studentToEdit.pgpSkillrackRank ?? 0,
        // AtCoder
        atcoderId: studentToEdit.atcoderId || studentToEdit.atcoderUsername || '',
        atcoderRating: studentToEdit.atcoderRating ?? 0,
        atcoderSolved: studentToEdit.atcoderSolved ?? 0,
        // Codeforces
        codeforcesId: studentToEdit.codeforcesId || studentToEdit.codeforcesUsername || '',
        codeforcesRating: studentToEdit.codeforcesRating ?? 0,
        codeforcesSolved: studentToEdit.codeforcesSolved ?? 0,
        // Degre.AI
        degreId: studentToEdit.degreId || studentToEdit.degreUsername || '',
        degreScore: studentToEdit.degreScore ?? studentToEdit.degreAiAssessmentScore ?? 0,
        degreSolved: studentToEdit.degreSolved ?? 0
      });
    } else {
      setFormData({
        rollNo: '',
        name: '',
        department: 'CSE',
        gender: 'Male',
        batch: '2023-2027',
        academicYear: 3,
        section: 'A',
        leetcodeId: '',
        contestRating: 1650,
        contestAttended: 15,
        globalRank: 20000,
        topPercentage: '3.5%',
        solvedTotal: 500,
        solvedEasy: 150,
        solvedMedium: 270,
        solvedHard: 80,
        skillrackUsername: '',
        points: 1850,
        programsSolved: 720,
        codeTests: 45,
        codeTracks: 32,
        codeTutor: 88,
        dc: 180,
        dt: 175,
        aptitudeScore: 85,
        skillrackRank: 1250,
        atcoderId: '',
        atcoderRating: 1200,
        atcoderSolved: 140,
        codeforcesId: '',
        codeforcesRating: 1350,
        codeforcesSolved: 190,
        degreId: '',
        degreScore: 88.5,
        degreSolved: 120
      });
    }
  }, [studentToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.rollNo) return;

    const studentRecord = {
      id: formData.rollNo,
      rollNo: formData.rollNo.toUpperCase().trim(),
      name: formData.name.trim(),
      department: formData.department,
      gender: formData.gender,
      batch: formData.batch,
      academicYear: Number(formData.academicYear),
      section: formData.section.toUpperCase(),
      // Top-level fields for Spring Boot StudentSaveRequest
      leetcodeId: formData.leetcodeId.trim(),
      contestRating: Number(formData.contestRating) || 0,
      contestAttended: Number(formData.contestAttended) || 0,
      globalRank: Number(formData.globalRank) || 0,
      topPercentage: formData.topPercentage,
      solvedTotal: Number(formData.solvedTotal) || 0,
      solvedEasy: Number(formData.solvedEasy) || 0,
      solvedMedium: Number(formData.solvedMedium) || 0,
      solvedHard: Number(formData.solvedHard) || 0,
      // SkillRack
      points: Number(formData.points) || 0,
      programsSolved: Number(formData.programsSolved) || 0,
      codeTests: Number(formData.codeTests) || 0,
      codeTracks: Number(formData.codeTracks) || 0,
      codeTutor: Number(formData.codeTutor) || 0,
      dc: Number(formData.dc) || 0,
      dt: Number(formData.dt) || 0,
      aptitudeScore: Number(formData.aptitudeScore) || 0,
      skillrackRank: Number(formData.skillrackRank) || 0,
      // AtCoder
      atcoderId: formData.atcoderId.trim(),
      atcoderRating: Number(formData.atcoderRating) || 0,
      atcoderSolved: Number(formData.atcoderSolved) || 0,
      // Codeforces
      codeforcesId: formData.codeforcesId.trim(),
      codeforcesRating: Number(formData.codeforcesRating) || 0,
      codeforcesSolved: Number(formData.codeforcesSolved) || 0,
      // Degre.AI
      degreId: formData.degreId.trim(),
      degreScore: Number(formData.degreScore) || 0,
      degreSolved: Number(formData.degreSolved) || 0,
      // Legacy nested structures for backward compatibility
      leetcode: {
        leetcodeId: formData.leetcodeId.trim(),
        contestRating: Number(formData.contestRating) || 0,
        contestAttended: Number(formData.contestAttended) || 0,
        globalRank: Number(formData.globalRank) || 0,
        topPercentage: formData.topPercentage,
        solvedTotal: Number(formData.solvedTotal) || 0,
        solvedEasy: Number(formData.solvedEasy) || 0,
        solvedMedium: Number(formData.solvedMedium) || 0,
        solvedHard: Number(formData.solvedHard) || 0
      },
      pgp: {
        points: Number(formData.points) || 0,
        programsSolved: Number(formData.programsSolved) || 0,
        codeTests: Number(formData.codeTests) || 0,
        codeTracks: Number(formData.codeTracks) || 0,
        codeTutor: Number(formData.codeTutor) || 0,
        dc: Number(formData.dc) || 0,
        dt: Number(formData.dt) || 0,
        aptitudeScore: Number(formData.aptitudeScore) || 0,
        skillrackRank: Number(formData.skillrackRank) || 0
      }
    };

    onSave(studentRecord);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px', maxHeight: '92vh', overflowY: 'auto' }}>
        <div className="modal-header premium-header" style={{ color: '#FFF' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#FFF', margin: 0 }}>
            {studentToEdit ? <Edit3 size={20} /> : <Plus size={20} />}
            <span>{studentToEdit ? 'Edit Coder Profile' : 'Add New Student Coder'}</span>
          </h3>
          <button className="btn btn-navy" style={{ padding: '0.35rem' }} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body" style={{ padding: '1.25rem' }}>
          {/* Base Demographics Section */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Base Student Demographics
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>ROLL / REG NO *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 721421104042"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)' }}
                  value={formData.rollNo}
                  onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>FULL NAME *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Karthik Raja S"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-main)' }}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>DEPT</label>
                <select
                  className="select-dropdown"
                  style={{ width: '100%', padding: '0.45rem' }}
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                >
                  {COLLEGE_DEPARTMENTS.filter(d => d !== 'All').map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>YEAR</label>
                <select
                  className="select-dropdown"
                  style={{ width: '100%', padding: '0.45rem' }}
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: Number(e.target.value) })}
                >
                  {ACADEMIC_YEARS.filter(y => y !== 'All').map(y => (
                    <option key={y} value={y}>Year {y}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>SEC</label>
                <select
                  className="select-dropdown"
                  style={{ width: '100%', padding: '0.45rem' }}
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                >
                  {COLLEGE_SECTIONS.filter(s => s !== 'All').map(s => (
                    <option key={s} value={s}>Sec {s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>BATCH</label>
                <select
                  className="select-dropdown"
                  style={{ width: '100%', padding: '0.45rem' }}
                  value={formData.batch}
                  onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                >
                  {COLLEGE_BATCHES.filter(b => b !== 'All').map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>GENDER</label>
                <select
                  className="select-dropdown"
                  style={{ width: '100%', padding: '0.45rem' }}
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>
          </div>

          {/* Platform Performance Tab Switcher */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Coding Platform Metrics (Multi-Platform Isolation)
            </div>

            <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--bg-primary)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
              {[
                { id: 'leetcode', label: 'LeetCode', icon: <Code size={14} /> },
                { id: 'skillrack', label: 'SkillRack / PGP', icon: <Zap size={14} /> },
                { id: 'atcoder', label: 'AtCoder', icon: <Globe size={14} /> },
                { id: 'codeforces', label: 'Codeforces', icon: <Award size={14} /> },
                { id: 'degre', label: 'Degre.AI', icon: <Cpu size={14} /> },
              ].map(tab => (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setActivePlatformTab(tab.id)}
                  style={{
                    flex: '1 1 auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    padding: '0.45rem 0.6rem',
                    fontSize: '0.8rem',
                    fontWeight: activePlatformTab === tab.id ? 800 : 600,
                    borderRadius: '6px',
                    border: 'none',
                    background: activePlatformTab === tab.id ? 'var(--sece-navy-800)' : 'transparent',
                    color: activePlatformTab === tab.id ? '#FFC72C' : 'var(--text-main)',
                    cursor: 'pointer'
                  }}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab 1: LeetCode */}
          {activePlatformTab === 'leetcode' && (
            <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem', marginBottom: '0.6rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>Username</span>
                  <input type="text" style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} value={formData.leetcodeId} onChange={(e) => setFormData({ ...formData, leetcodeId: e.target.value })} placeholder="username" />
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>Contest Rating</span>
                  <input type="number" style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} value={formData.contestRating} onChange={(e) => setFormData({ ...formData, contestRating: e.target.value })} />
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>Contests Attended</span>
                  <input type="number" style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} value={formData.contestAttended} onChange={(e) => setFormData({ ...formData, contestAttended: e.target.value })} />
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>Global Rank</span>
                  <input type="number" style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} value={formData.globalRank} onChange={(e) => setFormData({ ...formData, globalRank: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>ALL Solved</span>
                  <input type="number" style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} value={formData.solvedTotal} onChange={(e) => setFormData({ ...formData, solvedTotal: e.target.value })} />
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>Easy</span>
                  <input type="number" style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} value={formData.solvedEasy} onChange={(e) => setFormData({ ...formData, solvedEasy: e.target.value })} />
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>Medium</span>
                  <input type="number" style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} value={formData.solvedMedium} onChange={(e) => setFormData({ ...formData, solvedMedium: e.target.value })} />
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>Hard</span>
                  <input type="number" style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} value={formData.solvedHard} onChange={(e) => setFormData({ ...formData, solvedHard: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: SkillRack / PGP */}
          {activePlatformTab === 'skillrack' && (
            <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem', marginBottom: '0.6rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>Total Points</span>
                  <input type="number" style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} value={formData.points} onChange={(e) => setFormData({ ...formData, points: e.target.value })} />
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>Programs Solved</span>
                  <input type="number" style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} value={formData.programsSolved} onChange={(e) => setFormData({ ...formData, programsSolved: e.target.value })} />
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>SkillRack Rank</span>
                  <input type="number" style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} value={formData.skillrackRank} onChange={(e) => setFormData({ ...formData, skillrackRank: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>Daily Challenge (DC)</span>
                  <input type="number" style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} value={formData.dc} onChange={(e) => setFormData({ ...formData, dc: e.target.value })} />
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>Daily Test (DT)</span>
                  <input type="number" style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} value={formData.dt} onChange={(e) => setFormData({ ...formData, dt: e.target.value })} />
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>Code Tests</span>
                  <input type="number" style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} value={formData.codeTests} onChange={(e) => setFormData({ ...formData, codeTests: e.target.value })} />
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>Aptitude Score</span>
                  <input type="number" style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} value={formData.aptitudeScore} onChange={(e) => setFormData({ ...formData, aptitudeScore: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: AtCoder */}
          {activePlatformTab === 'atcoder' && (
            <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>AtCoder Handle</span>
                  <input type="text" placeholder="atcoder_username" style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} value={formData.atcoderId} onChange={(e) => setFormData({ ...formData, atcoderId: e.target.value })} />
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>AtCoder Rating</span>
                  <input type="number" style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} value={formData.atcoderRating} onChange={(e) => setFormData({ ...formData, atcoderRating: e.target.value })} />
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>Problems Solved</span>
                  <input type="number" style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} value={formData.atcoderSolved} onChange={(e) => setFormData({ ...formData, atcoderSolved: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Codeforces */}
          {activePlatformTab === 'codeforces' && (
            <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>Codeforces Handle</span>
                  <input type="text" placeholder="cf_handle" style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} value={formData.codeforcesId} onChange={(e) => setFormData({ ...formData, codeforcesId: e.target.value })} />
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>Contest Rating</span>
                  <input type="number" style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} value={formData.codeforcesRating} onChange={(e) => setFormData({ ...formData, codeforcesRating: e.target.value })} />
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>Problems Solved</span>
                  <input type="number" style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} value={formData.codeforcesSolved} onChange={(e) => setFormData({ ...formData, codeforcesSolved: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Degre.AI */}
          {activePlatformTab === 'degre' && (
            <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>Degre.AI ID / Email</span>
                  <input type="text" placeholder="degre_id" style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} value={formData.degreId} onChange={(e) => setFormData({ ...formData, degreId: e.target.value })} />
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>Assessment Score</span>
                  <input type="number" step="0.1" style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} value={formData.degreScore} onChange={(e) => setFormData({ ...formData, degreScore: e.target.value })} />
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>Problems Solved</span>
                  <input type="number" style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} value={formData.degreSolved} onChange={(e) => setFormData({ ...formData, degreSolved: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-gold">
              <Save size={16} />
              <span>{studentToEdit ? 'Update Profile' : 'Save Coder'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
