import * as XLSX from 'xlsx';

/**
 * Parses uploaded Excel files (LeetCode Reports across sheets 23-27 leetcode, 24-28 leetcode, 25-29 leetcode)
 * and updates the single database by ROLL NO.
 */
export function parseExcelData(file, existingStudents = []) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const studentMap = new Map();

        // Populate with existing DB records
        existingStudents.forEach(st => {
          if (st.rollNo) {
            studentMap.set(String(st.rollNo).trim().toUpperCase(), JSON.parse(JSON.stringify(st)));
          }
        });

        // Loop over all sheet names (e.g. 23-27 leetcode, 24-28 leetcode, 25-29 leetcode)
        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
          if (!rawRows || rawRows.length === 0) return;

          let inferredBatch = "2023-2027";
          if (sheetName.includes("23-27")) inferredBatch = "2023-2027";
          else if (sheetName.includes("24-28")) inferredBatch = "2024-2028";
          else if (sheetName.includes("25-29")) inferredBatch = "2025-2029";

          rawRows.forEach((row, index) => {
            const rollNoRaw = getFieldValue(row, ['ROLL NO', 'Roll No', 'ROLLNO', 'Register No', 'Reg No']);
            if (!rollNoRaw && !getFieldValue(row, ['NAME', 'Student Name', 'Name'])) return;

            const rollNo = rollNoRaw ? String(rollNoRaw).trim().toUpperCase() : `SECE_${index + 1}`;
            
            const existing = studentMap.get(rollNo) || {
              id: rollNo,
              rollNo: rollNo,
              name: getFieldValue(row, ['NAME', 'Student Name', 'Name']) || `Student ${rollNo}`,
              department: normalizeDept(getFieldValue(row, ['DEPT', 'DEPARTMENT', 'Dept', 'Branch']) || 'CSE'),
              gender: getFieldValue(row, ['GENDER', 'Gender']) || 'Male',
              batch: getFieldValue(row, ['Batch', 'BATCH', 'Academic Year']) || inferredBatch,
              leetcode: {
                leetcodeId: '',
                contestRating: 1500,
                contestAttended: 0,
                globalRank: 50000,
                topPercentage: 'N/A',
                solvedTotal: 0,
                solvedEasy: 0,
                solvedMedium: 0,
                solvedHard: 0
              }
            };

            // Bio updates
            if (getFieldValue(row, ['NAME', 'Student Name', 'Name'])) existing.name = getFieldValue(row, ['NAME', 'Student Name', 'Name']);
            if (getFieldValue(row, ['DEPT', 'DEPARTMENT'])) existing.department = normalizeDept(getFieldValue(row, ['DEPT', 'DEPARTMENT']));
            if (getFieldValue(row, ['GENDER', 'Gender'])) existing.gender = getFieldValue(row, ['GENDER', 'Gender']);
            if (getFieldValue(row, ['Batch', 'BATCH'])) existing.batch = getFieldValue(row, ['Batch', 'BATCH']);

            // Detect LeetCode Columns
            const lcId = getFieldValue(row, ['LeetcodeId', 'LeetCode ID', 'Leetcode Id']);
            const lcRating = getFieldValue(row, ['Contest Rating', 'Rating']);
            const lcContests = getFieldValue(row, ['Contest Attended', 'Contests Attended']);
            const lcRank = getFieldValue(row, ['Global Rank', 'GlobalRank']);
            const lcTopPct = getFieldValue(row, ['Top Percentage', 'Top %']);
            const lcAll = getFieldValue(row, ['ALL', 'LeetCode Solved', 'Total Solved']);
            const lcEasy = getFieldValue(row, ['Easy']);
            const lcMedium = getFieldValue(row, ['Medium']);
            const lcHard = getFieldValue(row, ['Hard']);

            existing.leetcode = {
              leetcodeId: String(lcId !== null && lcId !== '' ? lcId : existing.leetcode.leetcodeId),
              contestRating: lcRating !== null && lcRating !== '' ? parseNum(lcRating, existing.leetcode.contestRating) : existing.leetcode.contestRating,
              contestAttended: lcContests !== null && lcContests !== '' ? parseNum(lcContests, existing.leetcode.contestAttended) : existing.leetcode.contestAttended,
              globalRank: lcRank !== null && lcRank !== '' ? parseNum(lcRank, existing.leetcode.globalRank) : existing.leetcode.globalRank,
              topPercentage: String(lcTopPct !== null && lcTopPct !== '' ? lcTopPct : existing.leetcode.topPercentage),
              solvedTotal: lcAll !== null && lcAll !== '' ? parseNum(lcAll, existing.leetcode.solvedTotal) : existing.leetcode.solvedTotal,
              solvedEasy: lcEasy !== null && lcEasy !== '' ? parseNum(lcEasy, existing.leetcode.solvedEasy) : existing.leetcode.solvedEasy,
              solvedMedium: lcMedium !== null && lcMedium !== '' ? parseNum(lcMedium, existing.leetcode.solvedMedium) : existing.leetcode.solvedMedium,
              solvedHard: lcHard !== null && lcHard !== '' ? parseNum(lcHard, existing.leetcode.solvedHard) : existing.leetcode.solvedHard
            };

            studentMap.set(rollNo, existing);
          });
        });

        const studentList = Array.from(studentMap.values());
        if (studentList.length === 0) {
          throw new Error("No valid student data found in uploaded Excel file.");
        }

        resolve(studentList);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Downloads formatted Excel template for Leetcode Report.xlsx
 */
export function generateLeetcodeTemplate() {
  const wb = XLSX.utils.book_new();

  const sampleData = [
    {
      "S.NO": 1,
      "ROLL NO": "721421104042",
      "NAME": "Karthik Raja S",
      "DEPT": "CSE",
      "GENDER": "Male",
      "LeetcodeId": "karthik_sece",
      "Contest Rating": 1942,
      "Contest Attended": 34,
      "Global Rank": 9840,
      "Top Percentage": "1.8%",
      "ALL": 685,
      "Easy": 220,
      "Medium": 365,
      "Hard": 100
    }
  ];

  ["23-27 leetcode", "24-28 leetcode", "25-29 leetcode"].forEach(sheetName => {
    const ws = XLSX.utils.json_to_sheet(sampleData);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  XLSX.writeFile(wb, "Leetcode_Report.xlsx");
}

/* Helper utilities */
function getFieldValue(row, possibleKeys) {
  for (const key of Object.keys(row)) {
    const cleanKey = key.trim().toLowerCase();
    for (const matchKey of possibleKeys) {
      if (cleanKey === matchKey.toLowerCase()) {
        return row[key];
      }
    }
  }
  return null;
}

function parseNum(val, fallback = 0) {
  if (val === null || val === undefined || val === '') return fallback;
  const num = Number(val);
  return isNaN(num) ? fallback : num;
}

function normalizeDept(deptStr) {
  const d = String(deptStr).toUpperCase().trim();
  if (d.includes('AIDS') || d.includes('ARTIFICIAL INT') || d.includes('DATA SCIENCE')) return 'AIDS';
  if (d.includes('AIML') || d.includes('MACHINE LEARNING')) return 'AIML';
  if (d.includes('CCE') || d.includes('COMPUTER AND COMMUNICATION')) return 'CCE';
  if (d.includes('CSBS') || d.includes('BUSINESS')) return 'CSBS';
  if (d.includes('CYS') || d.includes('CYBER')) return 'CYS';
  if (d.includes('CSE') || d.includes('COMPUTER SCIENCE')) return 'CSE';
  if (d.includes('ECE') || d.includes('ELECTRONICS')) return 'ECE';
  if (d.includes('EEE') || d.includes('ELECTRICAL')) return 'EEE';
  if (d.includes('IT') || d.includes('INFORMATION')) return 'IT';
  if (d.includes('MECH') || d.includes('MECHANICAL')) return 'MECH';
  return d || 'CSE';
}
