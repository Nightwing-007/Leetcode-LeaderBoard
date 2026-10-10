import React from 'react';

/**
 * CategoryBadge displays the student's percentile tier based on their cumulative CT score:
 * - 0 to <20: Starter (Gray)
 * - 20 to <40: Solver (Blue)
 * - 40 to <60: Challenger (Green)
 * - 60 to <80: Specialist (Purple)
 * - 80 to 100: Elite (Gold)
 */
export function CategoryBadge({ category, score, style = {} }) {
  let cat = category;
  if (!cat && score != null) {
    const s = Number(score);
    if (s >= 500) {
      if (s >= 3500) cat = 'Elite';
      else if (s >= 2500) cat = 'Specialist';
      else if (s >= 1500) cat = 'Challenger';
      else if (s >= 800) cat = 'Solver';
      else cat = 'Starter';
    } else {
      if (s >= 80) cat = 'Elite';
      else if (s >= 60) cat = 'Specialist';
      else if (s >= 40) cat = 'Challenger';
      else if (s >= 20) cat = 'Solver';
      else cat = 'Starter';
    }
  }

  let normalizedKey = 'Starter';
  if (cat) {
    const lower = String(cat).trim().toLowerCase();
    if (lower === 'elite') normalizedKey = 'Elite';
    else if (lower === 'specialist') normalizedKey = 'Specialist';
    else if (lower === 'challenger') normalizedKey = 'Challenger';
    else if (lower === 'solver') normalizedKey = 'Solver';
    else normalizedKey = 'Starter';
  }

  const config = {
    Starter: {
      bg: '#F3F4F6',
      color: '#4B5563',
      border: '#D1D5DB',
      label: 'Starter'
    },
    Solver: {
      bg: '#EFF6FF',
      color: '#1D4ED8',
      border: '#BFDBFE',
      label: 'Solver'
    },
    Challenger: {
      bg: '#ECFDF5',
      color: '#047857',
      border: '#A7F3D0',
      label: 'Challenger'
    },
    Specialist: {
      bg: '#F5F3FF',
      color: '#6D28D9',
      border: '#DDD6FE',
      label: 'Specialist'
    },
    Elite: {
      bg: '#FFFBEB',
      color: '#B45309',
      border: '#FDE68A',
      label: 'Elite'
    }
  };

  const current = config[normalizedKey] || config.Starter;

  return (
    <span
      className={`category-badge category-${normalizedKey.toLowerCase()}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        borderRadius: '9999px',
        fontSize: '0.72rem',
        fontWeight: 800,
        letterSpacing: '0.03em',
        textTransform: 'uppercase',
        backgroundColor: current.bg,
        color: current.color,
        border: `1px solid ${current.border}`,
        boxShadow: cat === 'Elite' ? '0 1px 4px rgba(245, 158, 11, 0.25)' : 'none',
        whiteSpace: 'nowrap',
        lineHeight: 1.4,
        ...style
      }}
    >
      {cat === 'Elite' && <span style={{ fontSize: '0.7rem' }}>💎</span>}
      {current.label}
    </span>
  );
}

export default CategoryBadge;
