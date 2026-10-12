import React, { useEffect, useRef } from 'react';
import { StudentDetailCard } from './StudentDetailCard';

export function StudentModal({ student, onClose, isAdmin = false, onEdit, onDelete }) {
  const modalContentRef = useRef(null);

  useEffect(() => {
    if (student && modalContentRef.current) {
      const timer = setTimeout(() => {
        if (modalContentRef.current) {
          modalContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [student]);

  if (!student) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        ref={modalContentRef}
        className="modal-content student-modal"
        onClick={(e) => e.stopPropagation()}
      >
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
