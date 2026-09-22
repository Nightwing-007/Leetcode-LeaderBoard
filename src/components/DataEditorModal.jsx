import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Edit3 } from 'lucide-react';
import { COLLEGE_DEPARTMENTS, COLLEGE_BATCHES } from '../data/sampleData';

export function DataEditorModal({ isOpen, onClose, onSave, studentToEdit }) {
  const [formData, setFormData] = useState({
    rollNo: '',
    name: '',
    department: 'CSE',
    gender: 'Male',
    batch: '2023-2027',
    leetcodeId: '',
    contestRating: 1650,
    contestAttended: 15,
    globalRank: 20000,
    topPercentage: '3.5%',
    solvedTotal: 500,
    solvedEasy: 150,
    solvedMedium: 270,
    solvedHard: 80
  });

  useEffect(() => {
    if (studentToEdit) {
      setFormData({
        rollNo: studentToEdit.rollNo || '',
        name: studentToEdit.name || '',
        department: studentToEdit.department || 'CSE',
        gender: studentToEdit.gender || 'Male',
        batch: studentToEdit.batch || '2023-2027',
        leetcodeId: studentToEdit.leetcode?.leetcodeId || '',
        contestRating: studentToEdit.leetcode?.contestRating || 1500,
        contestAttended: studentToEdit.leetcode?.contestAttended || 0,
        globalRank: studentToEdit.leetcode?.globalRank || 50000,
        topPercentage: studentToEdit.leetcode?.topPercentage || 'N/A',
        solvedTotal: studentToEdit.leetcode?.solvedTotal || 0,
        solvedEasy: studentToEdit.leetcode?.solvedEasy || 0,
        solvedMedium: studentToEdit.leetcode?.solvedMedium || 0,
        solvedHard: studentToEdit.leetcode?.solvedHard || 0
      });
    } else {
      setFormData({
        rollNo: '',
        name: '',
        department: 'CSE',
        gender: 'Male',
        batch: '2023-2027',
        leetcodeId: '',
        contestRating: 1650,
        contestAttended: 15,
        globalRank: 20000,
        topPercentage: '3.5%',
        solvedTotal: 500,
        solvedEasy: 150,
        solvedMedium: 270,
        solvedHard: 80
      });
    }
  }, [studentToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.rollNo) return;

    const studentRecord = {
      id: formData.rollNo,
      rollNo: formData.rollNo,
      name: formData.name,
      department: formData.department,
      gender: formData.gender,
      batch: formData.batch,
      leetcode: {
        leetcodeId: formData.leetcodeId,
        contestRating: Number(formData.contestRating),
        contestAttended: Number(formData.contestAttended),
        globalRank: Number(formData.globalRank),
        topPercentage: formData.topPercentage,
        solvedTotal: Number(formData.solvedTotal),
        solvedEasy: Number(formData.solvedEasy),
        solvedMedium: Number(formData.solvedMedium),
        solvedHard: Number(formData.solvedHard)
      }
    };

    onSave(studentRecord);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {studentToEdit ? <Edit3 size={20} /> : <Plus size={20} />}
            <span>{studentToEdit ? 'Edit Coder Profile' : 'Add New Student Coder'}</span>
          </h3>
          <button className="btn btn-outline" style={{ padding: '0.35rem' }} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* Bio section */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>ROLL NO</label>
              <input
                type="text"
                required
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                value={formData.rollNo}
                onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
              />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>NAME</label>
              <input
                type="text"
                required
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>DEPT</label>
              <select
                className="select-dropdown"
                style={{ width: '100%' }}
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                {COLLEGE_DEPARTMENTS.filter(d => d !== 'All').map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>GENDER</label>
              <select
                className="select-dropdown"
                style={{ width: '100%' }}
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>BATCH</label>
              <select
                className="select-dropdown"
                style={{ width: '100%' }}
                value={formData.batch}
                onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
              >
                {COLLEGE_BATCHES.filter(b => b !== 'All').map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          {/* LeetCode Report Fields */}
          <div style={{ background: 'var(--bg-primary)', padding: '0.85rem', borderRadius: '8px', marginBottom: '1rem' }}>
            <h4 style={{ fontWeight: 800, fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--sece-navy-700)' }}>
              LeetCode Performance Parameters
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>LeetcodeId</span>
                <input type="text" style={{ width: '100%', padding: '0.35rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} value={formData.leetcodeId} onChange={(e) => setFormData({ ...formData, leetcodeId: e.target.value })} />
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>Contest Rating</span>
                <input type="number" style={{ width: '100%', padding: '0.35rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} value={formData.contestRating} onChange={(e) => setFormData({ ...formData, contestRating: e.target.value })} />
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>Contest Attended</span>
                <input type="number" style={{ width: '100%', padding: '0.35rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} value={formData.contestAttended} onChange={(e) => setFormData({ ...formData, contestAttended: e.target.value })} />
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>Top Percentage</span>
                <input type="text" style={{ width: '100%', padding: '0.35rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} value={formData.topPercentage} onChange={(e) => setFormData({ ...formData, topPercentage: e.target.value })} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem' }}>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>ALL (Total)</span>
                <input type="number" style={{ width: '100%', padding: '0.35rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} value={formData.solvedTotal} onChange={(e) => setFormData({ ...formData, solvedTotal: e.target.value })} />
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>Easy</span>
                <input type="number" style={{ width: '100%', padding: '0.35rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} value={formData.solvedEasy} onChange={(e) => setFormData({ ...formData, solvedEasy: e.target.value })} />
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>Medium</span>
                <input type="number" style={{ width: '100%', padding: '0.35rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} value={formData.solvedMedium} onChange={(e) => setFormData({ ...formData, solvedMedium: e.target.value })} />
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>Hard</span>
                <input type="number" style={{ width: '100%', padding: '0.35rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} value={formData.solvedHard} onChange={(e) => setFormData({ ...formData, solvedHard: e.target.value })} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-gold">
              <Save size={16} />
              <span>{studentToEdit ? 'Save Record' : 'Add Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
