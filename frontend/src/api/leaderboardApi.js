const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

/**
 * Normalizes viewType strings to backend endpoint paths.
 */
function resolveEndpoint(viewType) {
  switch (viewType) {
    case 'college':
    case 'college-toppers':
      return 'leaderboard/college-toppers';
    case 'year':
    case 'year-toppers':
      return 'leaderboard/year-toppers';
    case 'department':
    case 'department-toppers':
      return 'leaderboard/department-toppers';
    case 'dept_year':
    case 'department-year-toppers':
      return 'leaderboard/department-year-toppers';
    case 'class':
    case 'class-toppers':
      return 'leaderboard/class-toppers';
    case 'overall':
      return 'leaderboard/overall';
    case 'overall-paginated':
      return 'leaderboard/overall/paginated';
    case 'leetcode':
      return 'leaderboard/leetcode';
    case 'pgp':
      return 'leaderboard/pgp';
    case 'weekly':
      return 'leaderboard/weekly';
    default:
      return `leaderboard/${viewType}`;
  }
}

/**
 * Fetch leaderboard or topper rankings with full pagination and multi-parameter filtering.
 * Transparently unpacks both Spring Data PaginatedResponse and plain array payloads.
 */
export async function fetchLeaderboard(viewType = 'college', filters = {}) {
  const {
    dept = 'All',
    batch = 'All',
    academicYear = null,
    section = 'All',
    gender = 'All',
    query = '',
    sortBy = 'rank',
    page = 0,
    size = 50
  } = filters;

  const endpoint = resolveEndpoint(viewType);
  const params = new URLSearchParams();

  if (dept && dept !== 'All') params.append('dept', dept);
  if (batch && batch !== 'All') params.append('batch', batch);
  if (academicYear && academicYear !== 'All') params.append('academicYear', String(academicYear));
  if (section && section !== 'All') params.append('section', section);
  if (gender && gender !== 'All') params.append('gender', gender);
  if (query && query.trim()) params.append('query', query.trim());
  if (sortBy) params.append('sortBy', sortBy);
  if (page !== undefined && page !== null) params.append('page', String(page));
  if (size !== undefined && size !== null) params.append('size', String(size));

  const url = `${API_BASE_URL}/${endpoint}?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${viewType} leaderboard: ${res.statusText}`);

  const data = await res.json();

  // If response is standardized PaginatedResponse ({ content, totalPages, totalElements, currentPage })
  if (data && Array.isArray(data.content)) {
    const responseArray = [...data.content];
    responseArray.content = data.content;
    responseArray.totalPages = data.totalPages || 1;
    responseArray.totalElements = data.totalElements || data.content.length;
    responseArray.currentPage = data.currentPage ?? 0;
    responseArray.pageSize = data.pageSize || size;
    responseArray.isFirst = data.first ?? true;
    responseArray.isLast = data.last ?? true;
    return responseArray;
  }

  // If response is plain Array
  if (Array.isArray(data)) {
    data.content = data;
    data.totalPages = 1;
    data.totalElements = data.length;
    data.currentPage = 0;
    data.pageSize = data.length;
    return data;
  }

  return data;
}

/**
 * Fetch top 3 podium performers.
 */
export async function fetchPodium(viewType = 'overall', filters = {}) {
  const { dept = 'All', batch = 'All' } = filters;
  const params = new URLSearchParams({ type: viewType, dept, batch });
  const res = await fetch(`${API_BASE_URL}/leaderboard/podium?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch podium: ${res.statusText}`);
  return await res.json();
}

/**
 * Fetch V2 Dashboard Statistics including active platforms, highest overall score,
 * and department-wise average composite scores.
 */
export async function fetchDashboardStatistics() {
  try {
    const res = await fetch(`${API_BASE_URL}/dashboard/statistics`);
    if (res.ok) return await res.json();
  } catch (ignored) {}

  // Fallback to /analytics/summary
  const res = await fetch(`${API_BASE_URL}/analytics/summary`);
  if (!res.ok) throw new Error(`Failed to fetch dashboard statistics: ${res.statusText}`);
  return await res.json();
}

export async function fetchAnalyticsSummary() {
  return await fetchDashboardStatistics();
}

export async function fetchDepartmentComparisons() {
  const res = await fetch(`${API_BASE_URL}/analytics/department-comparison`);
  if (!res.ok) throw new Error(`Failed to fetch department comparisons: ${res.statusText}`);
  return await res.json();
}

/**
 * Fetch comprehensive Student 360 Profile by register number.
 */
export async function fetchStudentDetail(rollNo) {
  const res = await fetch(`${API_BASE_URL}/students/${encodeURIComponent(rollNo)}`);
  if (!res.ok) throw new Error(`Failed to fetch student details: ${res.statusText}`);
  return await res.json();
}

export async function uploadExcelToBackend(file, adminPin = 'sece2026') {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/admin/upload-excel`, {
    method: 'POST',
    headers: {
      'X-Admin-PIN': adminPin
    },
    body: formData
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || errData.error || `Upload failed (${res.status})`);
  }
  return await res.json();
}

export async function saveStudentToBackend(studentData, adminPin = 'sece2026') {
  const res = await fetch(`${API_BASE_URL}/admin/students`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-PIN': adminPin
    },
    body: JSON.stringify(studentData)
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || errData.error || `Save failed (${res.status})`);
  }
  return await res.json();
}

export async function deleteStudentFromBackend(rollNo, adminPin = 'sece2026') {
  const res = await fetch(`${API_BASE_URL}/admin/students/${encodeURIComponent(rollNo)}`, {
    method: 'DELETE',
    headers: {
      'X-Admin-PIN': adminPin
    }
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || errData.error || `Delete failed (${res.status})`);
  }
  return await res.json();
}

export async function clearAllDataFromBackend(adminPin = 'sece2026') {
  const res = await fetch(`${API_BASE_URL}/admin/clear-all`, {
    method: 'DELETE',
    headers: {
      'X-Admin-PIN': adminPin
    }
  });
  if (!res.ok) throw new Error(`Clear data failed: ${res.statusText}`);
  return await res.json();
}

export async function triggerLeetCodeSyncBackend(adminPin = 'sece2026') {
  const res = await fetch(`${API_BASE_URL}/admin/sync-leetcode`, {
    method: 'POST',
    headers: {
      'X-Admin-PIN': adminPin
    }
  });
  if (!res.ok) throw new Error(`Sync trigger failed: ${res.statusText}`);
  return await res.json();
}
