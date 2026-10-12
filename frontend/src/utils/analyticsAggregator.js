/**
 * Utility functions for aggregating leaderboard category metrics across departments.
 */

/**
 * Returns the standardized category tier ('Starter' | 'Solver' | 'Challenger' | 'Specialist' | 'Elite')
 * for a student based on their explicit category string or score calculation.
 */
export function getCategoryFromScoreOrTier(student) {
  if (!student) return 'Starter';

  if (student.category) {
    const norm = String(student.category).trim().toLowerCase();
    if (norm === 'elite') return 'Elite';
    if (norm === 'specialist') return 'Specialist';
    if (norm === 'challenger') return 'Challenger';
    if (norm === 'solver') return 'Solver';
    if (norm === 'starter') return 'Starter';
  }

  const score = student.overallScore != null
    ? Number(student.overallScore)
    : (student.compositeScore != null ? Number(student.compositeScore) : 0);

  // If score is on 0-5000 scale vs 0-100 scale:
  if (score >= 500) {
    if (score >= 3500) return 'Elite';
    if (score >= 2500) return 'Specialist';
    if (score >= 1500) return 'Challenger';
    if (score >= 800) return 'Solver';
    return 'Starter';
  } else {
    if (score >= 80) return 'Elite';
    if (score >= 60) return 'Specialist';
    if (score >= 40) return 'Challenger';
    if (score >= 20) return 'Solver';
    return 'Starter';
  }
}

/**
 * Aggregates student category distribution grouped by department.
 * Output format: [
 *   { department: 'CSE', Elite: 10, Specialist: 24, Challenger: 30, Solver: 15, Starter: 8, total: 87 },
 *   ...
 * ]
 */
export function aggregateDepartmentCategories(students = []) {
  if (!Array.isArray(students) || students.length === 0) return [];

  const deptsMap = {};

  students.forEach((student) => {
    const rawDept = student.department || student.dept || 'OTHER';
    const dept = String(rawDept).trim().toUpperCase();
    if (!dept) return;

    if (!deptsMap[dept]) {
      deptsMap[dept] = {
        department: dept,
        Elite: 0,
        Specialist: 0,
        Challenger: 0,
        Solver: 0,
        Starter: 0,
        total: 0
      };
    }

    const tier = getCategoryFromScoreOrTier(student);
    deptsMap[dept][tier] = (deptsMap[dept][tier] || 0) + 1;
    deptsMap[dept].total += 1;
  });

  return Object.values(deptsMap).sort((a, b) => b.total - a.total);
}

export const CATEGORY_COLORS = {
  Elite: '#F59E0B',      // Gold / Amber
  Specialist: '#8B5CF6', // Purple
  Challenger: '#10B981', // Green
  Solver: '#3B82F6',     // Blue
  Starter: '#94A3B8'     // Slate Gray
};
