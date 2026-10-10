import React from 'react';
import { StudentDetailCard } from './StudentDetailCard';

export function StudentModal({ student, onClose, isAdmin = false, onEdit, onDelete }) {
  if (!student) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content student-modal" onClick={(e) => e.stopPropagation()}>
        <StudentDetailCard
          student={student}
          onClose={onClose}
          isAdmin={isAdmin}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
