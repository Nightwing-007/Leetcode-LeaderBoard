const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export async function fetchLeaderboard(viewType = 'leetcode', filters = {}) {
  const { dept = 'All', batch = 'All', gender = 'All', query = '', sortBy = 'global_rank' } = filters;
  const params = new URLSearchParams({
    dept,
    batch,
    gender,
    query,
    sortBy
  });

  const res = await fetch(`${API_BASE_URL}/leaderboard/${viewType}?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch ${viewType} leaderboard: ${res.statusText}`);
  return await res.json();
}

export async function fetchPodium(viewType = 'leetcode', filters = {}) {
  const { dept = 'All', batch = 'All' } = filters;
  const params = new URLSearchParams({ type: viewType, dept, batch });
  const res = await fetch(`${API_BASE_URL}/leaderboard/podium?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch podium: ${res.statusText}`);
  return await res.json();
}

export async function fetchAnalyticsSummary() {
  const res = await fetch(`${API_BASE_URL}/analytics/summary`);
  if (!res.ok) throw new Error(`Failed to fetch analytics: ${res.statusText}`);
  return await res.json();
}

export async function fetchDepartmentComparisons() {
  const res = await fetch(`${API_BASE_URL}/analytics/department-comparison`);
  if (!res.ok) throw new Error(`Failed to fetch department comparisons: ${res.statusText}`);
  return await res.json();
}

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
