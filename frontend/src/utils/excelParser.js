import * as XLSX from 'xlsx';

/**
 * Parses uploaded Excel files (both PGP Report and LeetCode Report sheets)
 */
export function parseExcelData(file, existingStudents = []) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const studentMap = new Map();

        // Populate with existing DB records and normalize nested structures
        (existingStudents || []).forEach(st => {
          if (st && st.rollNo) {
            const copy = JSON.parse(JSON.stringify(st));
            if (!copy.leetcode) {
              copy.leetcode = {
                leetcodeId: copy.leetcodeId || '',
                contestRating: copy.lcContestRating || 1500,
                contestAttended: copy.lcContestsAttended || 0,
                globalRank: copy.lcGlobalRank || 999999,
                topPercentage: copy.lcTopPercentage || 'N/A',
                solvedTotal: copy.lcSolvedTotal || 0,
                solvedEasy: copy.lcSolvedEasy || 0,
                solvedMedium: copy.lcSolvedMedium || 0,
                solvedHard: copy.lcSolvedHard || 0
              };
            }
            if (!copy.pgp) {
              copy.pgp = {
                programsSolved: copy.pgpProgramsSolved || 0,
                codeTests: copy.pgpCodeTests || 0,
                codeTracks: copy.pgpCodeTracks || 0,
                codeTutor: copy.pgpCodeTutor || 0,
                dc: copy.pgpDc || 0,
                dt: copy.pgpDt || 0,
                aptitudeScore: copy.pgpAptitudeScore || 0,
                points: copy.pgpPoints || 0,
                skillrackRank: copy.pgpSkillrackRank || 0
              };
            }
            if (!copy.weeklyAssessment) {
              copy.weeklyAssessment = {
                rank: copy.weeklyRank || 0,
                score: copy.weeklyScore || 0,
                codeScore: copy.weeklyCodeScore || 0,
                mcqScore: copy.weeklyMcqScore || 0,
                testName: copy.weeklyTestName || '',
                college: ''
              };
            }
            studentMap.set(String(copy.rollNo).trim().toUpperCase(), copy);
          }
        });

        let detectedFileType = 'pgp';

        // Loop through all sheets in the uploaded file
        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
          if (!rawRows || rawRows.length < 2) return;

          // Find header row (search first 10 rows)
          let headerIdx = -1;
          for (let i = 0; i < Math.min(rawRows.length, 10); i++) {
            const rowStr = (rawRows[i] || []).map(c => String(c || '').toUpperCase()).join(' ');
            if (rowStr.includes('ROLL NO') || rowStr.includes('REGISTER NO') || rowStr.includes('REGN NUMBER') || rowStr.includes('REG NO') || (rowStr.includes('NAME') && (rowStr.includes('DEPARTMENT') || rowStr.includes('BRANCH') || rowStr.includes('SCORE') || rowStr.includes('DEPT')))) {
              headerIdx = i;
              break;
            }
          }

          if (headerIdx === -1) return;

          const headerRow = rawRows[headerIdx].map(h => String(h || '').trim());
          const colMap = mapHeaders(headerRow);

          if (colMap.test_score !== undefined || colMap.test_code_score !== undefined) {
            detectedFileType = 'weekly';
          } else if (colMap.programs_solved !== undefined || colMap.points !== undefined) {
            detectedFileType = 'pgp';
          } else if (colMap.leetcode_id !== undefined || colMap.solved_total !== undefined) {
            detectedFileType = 'leetcode';
          }

          let inferredBatch = "2024-2028";
          if (sheetName.includes("23-27") || sheetName.includes("2023")) inferredBatch = "2023-2027";
          else if (sheetName.includes("24-28") || sheetName.includes("2024")) inferredBatch = "2024-2028";
          else if (sheetName.includes("25-29") || sheetName.includes("2025")) inferredBatch = "2025-2029";

          for (let r = headerIdx + 1; r < rawRows.length; r++) {
            const row = rawRows[r];
            if (!row || row.length === 0) continue;

            let rollNoRaw = getVal(row, colMap.roll_no);
            // In sheets like 25-29 LeetCode, Col 1 is application no (IC25...) and Col 2 is the actual roll number (25AD...)
            if (colMap.roll_no !== undefined && row[colMap.roll_no + 1]) {
              const nextVal = String(row[colMap.roll_no + 1]).trim();
              if (/^\d{2}[A-Za-z]{2,4}\d{2,4}/.test(nextVal)) {
                rollNoRaw = nextVal;
              }
            }

            const nameRaw = getVal(row, colMap.name);
            if (!rollNoRaw && !nameRaw) continue;

            const rollNo = rollNoRaw ? String(rollNoRaw).trim().toUpperCase() : `SECE_${r}`;
            const name = nameRaw ? String(nameRaw).trim() : `Student ${rollNo}`;
            const rawDept = getVal(row, colMap.department) || 'CSE';
            const dept = normalizeDept(rawDept);
            const subBatch = getVal(row, colMap.batch) || '';
            const batch = (subBatch && subBatch.includes("202")) ? subBatch : inferredBatch;
            const gender = getVal(row, colMap.gender) || 'Male';

            let existing = studentMap.get(rollNo);
            if (!existing) {
              existing = {
                id: rollNo,
                rollNo,
                name,
                department: dept,
                section: rawDept,
                gender,
                batch,
                subBatch,
                leetcode: {
                  leetcodeId: '',
                  contestRating: 1500,
                  contestAttended: 0,
                  globalRank: 999999,
                  topPercentage: 'N/A',
                  solvedTotal: 0,
                  solvedEasy: 0,
                  solvedMedium: 0,
                  solvedHard: 0
                },
                pgp: {
                  programsSolved: 0,
                  codeTests: 0,
                  codeTracks: 0,
                  codeTutor: 0,
                  dc: 0,
                  dt: 0,
                  aptitudeScore: 0,
                  points: 0,
                  skillrackRank: 0
                },
                weeklyAssessment: {
                  rank: 0,
                  score: 0,
                  codeScore: 0,
                  mcqScore: 0,
                  testName: '',
                  college: ''
                }
              };
            }

            // Ensure nested objects always exist on existing record
            if (!existing.leetcode) {
              existing.leetcode = {
                leetcodeId: existing.leetcodeId || '',
                contestRating: existing.lcContestRating || 1500,
                contestAttended: existing.lcContestsAttended || 0,
                globalRank: existing.lcGlobalRank || 999999,
                topPercentage: existing.lcTopPercentage || 'N/A',
                solvedTotal: existing.lcSolvedTotal || 0,
                solvedEasy: existing.lcSolvedEasy || 0,
                solvedMedium: existing.lcSolvedMedium || 0,
                solvedHard: existing.lcSolvedHard || 0
              };
            }
            if (!existing.pgp) {
              existing.pgp = {
                programsSolved: existing.pgpProgramsSolved || 0,
                codeTests: existing.pgpCodeTests || 0,
                codeTracks: existing.pgpCodeTracks || 0,
                codeTutor: existing.pgpCodeTutor || 0,
                dc: existing.pgpDc || 0,
                dt: existing.pgpDt || 0,
                aptitudeScore: existing.pgpAptitudeScore || 0,
                points: existing.pgpPoints || 0,
                skillrackRank: existing.pgpSkillrackRank || 0
              };
            }
            if (!existing.weeklyAssessment) {
              existing.weeklyAssessment = {
                rank: existing.weeklyRank || 0,
                score: existing.weeklyScore || 0,
                codeScore: existing.weeklyCodeScore || 0,
                mcqScore: existing.weeklyMcqScore || 0,
                testName: existing.weeklyTestName || '',
                college: ''
              };
            }

            // Update basic bio
            if (name) existing.name = name;
            if (dept) existing.department = dept;
            if (rawDept && !existing.section) existing.section = rawDept;
            if (batch) existing.batch = batch;
            if (subBatch) existing.subBatch = subBatch;

            // Update LeetCode fields
            if (colMap.leetcode_id !== undefined) existing.leetcode.leetcodeId = String(getVal(row, colMap.leetcode_id) || existing.leetcode.leetcodeId || '');
            if (colMap.contest_rating !== undefined) existing.leetcode.contestRating = parseNum(getVal(row, colMap.contest_rating), existing.leetcode.contestRating || 1500);
            if (colMap.contests_attended !== undefined) existing.leetcode.contestAttended = parseNum(getVal(row, colMap.contests_attended), existing.leetcode.contestAttended || 0);
            if (colMap.global_rank !== undefined) existing.leetcode.globalRank = parseNum(getVal(row, colMap.global_rank), existing.leetcode.globalRank || 999999);
            if (colMap.top_percentage !== undefined) existing.leetcode.topPercentage = String(getVal(row, colMap.top_percentage) || existing.leetcode.topPercentage || 'N/A');
            if (colMap.solved_total !== undefined) existing.leetcode.solvedTotal = parseNum(getVal(row, colMap.solved_total), existing.leetcode.solvedTotal || 0);
            if (colMap.easy !== undefined) existing.leetcode.solvedEasy = parseNum(getVal(row, colMap.easy), existing.leetcode.solvedEasy || 0);
            if (colMap.medium !== undefined) existing.leetcode.solvedMedium = parseNum(getVal(row, colMap.medium), existing.leetcode.solvedMedium || 0);
            if (colMap.hard !== undefined) existing.leetcode.solvedHard = parseNum(getVal(row, colMap.hard), existing.leetcode.solvedHard || 0);

            // Update PGP fields
            if (colMap.programs_solved !== undefined) existing.pgp.programsSolved = parseNum(getVal(row, colMap.programs_solved), existing.pgp.programsSolved || 0);
            if (colMap.code_tests !== undefined) existing.pgp.codeTests = parseNum(getVal(row, colMap.code_tests), existing.pgp.codeTests || 0);
            if (colMap.code_tracks !== undefined) existing.pgp.codeTracks = parseNum(getVal(row, colMap.code_tracks), existing.pgp.codeTracks || 0);
            if (colMap.code_tutor !== undefined) existing.pgp.codeTutor = parseNum(getVal(row, colMap.code_tutor), existing.pgp.codeTutor || 0);
            if (colMap.dc !== undefined) existing.pgp.dc = parseNum(getVal(row, colMap.dc), existing.pgp.dc || 0);
            if (colMap.dt !== undefined) existing.pgp.dt = parseNum(getVal(row, colMap.dt), existing.pgp.dt || 0);
            if (colMap.aptitude !== undefined) existing.pgp.aptitudeScore = parseNum(getVal(row, colMap.aptitude), existing.pgp.aptitudeScore || 0);
            if (colMap.points !== undefined) existing.pgp.points = parseNum(getVal(row, colMap.points), existing.pgp.points || 0);
            if (colMap.skillrack_rank !== undefined) existing.pgp.skillrackRank = parseNum(getVal(row, colMap.skillrack_rank), existing.pgp.skillrackRank || 0);

            // Update Weekly Assessment fields (from CandidateRankingDetails)
            if (colMap.test_rank !== undefined) existing.weeklyAssessment.rank = parseNum(getVal(row, colMap.test_rank), existing.weeklyAssessment.rank || 0);
            if (colMap.test_score !== undefined) existing.weeklyAssessment.score = parseNum(getVal(row, colMap.test_score), existing.weeklyAssessment.score || 0);
            if (colMap.test_code_score !== undefined) existing.weeklyAssessment.codeScore = parseNum(getVal(row, colMap.test_code_score), existing.weeklyAssessment.codeScore || 0);
            if (colMap.test_mcq_score !== undefined) existing.weeklyAssessment.mcqScore = parseNum(getVal(row, colMap.test_mcq_score), existing.weeklyAssessment.mcqScore || 0);
            if (colMap.test_name) existing.weeklyAssessment.testName = colMap.test_name;
            if (colMap.college !== undefined) existing.weeklyAssessment.college = String(getVal(row, colMap.college) || '');

            // Populate flat properties for backwards compatibility
            existing.pgpPoints = existing.pgp.points || 0;
            existing.pgpProgramsSolved = existing.pgp.programsSolved || 0;
            existing.pgpCodeTests = existing.pgp.codeTests || 0;
            existing.pgpDc = existing.pgp.dc || 0;
            existing.pgpDt = existing.pgp.dt || 0;
            existing.pgpSkillrackRank = existing.pgp.skillrackRank || 0;
            existing.lcSolvedTotal = existing.leetcode.solvedTotal || 0;
            existing.lcContestRating = existing.leetcode.contestRating || 1500;
            existing.lcGlobalRank = existing.leetcode.globalRank || 999999;
            existing.weeklyScore = existing.weeklyAssessment.score || 0;
            existing.weeklyRank = existing.weeklyAssessment.rank || 0;
            existing.weeklyCodeScore = existing.weeklyAssessment.codeScore || 0;
            existing.weeklyMcqScore = existing.weeklyAssessment.mcqScore || 0;

            // Calculate composite score safely
            const p = existing.pgp.points || 0;
            const w = existing.weeklyAssessment.score || 0;
            const l = existing.leetcode.solvedTotal || 0;
            const rating = existing.leetcode.contestRating || 1500;
            existing.compositeScore = p > 0 ? (p + w * 5) : (rating * 2 + l * 1.5 + w * 5);

            studentMap.set(rollNo, existing);
          }
        });

        const studentList = Array.from(studentMap.values());
        if (studentList.length === 0) {
          throw new Error("No valid student data found in uploaded Excel file.");
        }

        studentList.detectedType = detectedFileType;
        resolve(studentList);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

function mapHeaders(headerRow) {
  const map = {};
  headerRow.forEach((h, idx) => {
    const name = String(h || '').toUpperCase().trim();
    if (name.includes('ROLL NO') || name.includes('REGISTER NO') || name.includes('REGN NUMBER') || name.includes('REG NO') || name === 'ROLLNO') map.roll_no = idx;
    else if (name === 'NAME' || name.includes('STUDENT NAME')) map.name = idx;
    else if (name.includes('DEPARTMENT') || name === 'DEPT' || name === 'BRANCH' || name.includes('DEPT - SECTION')) map.department = idx;
    else if (name === 'BATCH' || name.includes('ACADEMIC YEAR')) map.batch = idx;
    else if (name === 'GENDER') map.gender = idx;
    else if (name.includes('COLLEGE')) map.college = idx;

    // Weekly Assessment Columns (CandidateRankingDetails.xlsx)
    else if (name === '#' || name === 'S.NO' || name === 'SL NO' || name === 'SL.NO' || name === 'TEST RANK') map.test_rank = idx;
    else if (name === 'SCORE' || name.includes('TEST SCORE') || name === 'TOTAL SCORE') map.test_score = idx;
    else if (name.includes('(CODE)') || (name.includes('CODE') && name.includes('ASSESSMENT')) || (name.includes('DAILY ASSESSMENT') && name.includes('CODE'))) {
      map.test_code_score = idx;
      map.test_name = h;
    }
    else if (name.includes('(MCQ)') || name.includes('APTITUDE TEST')) {
      map.test_mcq_score = idx;
    }

    // PGP Columns
    else if (name.includes('PROGRAMS SOLVED') || name === 'SOLVED') map.programs_solved = idx;
    else if (name.includes('CODE TESTS') || name === 'TESTS') map.code_tests = idx;
    else if (name.includes('CODE TRACKS') || name === 'TRACKS') map.code_tracks = idx;
    else if (name.includes('CODE TUTOR') || name === 'TUTOR') map.code_tutor = idx;
    else if (name === 'DC' || name.includes('DAILY CHALLENGE')) map.dc = idx;
    else if (name === 'DT' || name.includes('DAILY TEST')) map.dt = idx;
    else if (name.includes('APTITUDE') && !name.includes('MCQ')) map.aptitude = idx;
    else if (name === 'POINTS' || name.includes('TOTAL POINTS') || name.includes('PGP POINTS')) map.points = idx;
    else if (name.includes('SKILLRACK RANK') || name === 'RANK') map.skillrack_rank = idx;

    // LeetCode Columns
    else if (name.includes('LEETCODE ID') || name.includes('LEETCODEID')) map.leetcode_id = idx;
    else if (name.includes('CONTEST RATING') || name === 'RATING') map.contest_rating = idx;
    else if (name.includes('CONTEST ATTENDED') || name.includes('CONTESTS')) map.contests_attended = idx;
    else if (name.includes('GLOBAL RANK')) map.global_rank = idx;
    else if (name.includes('TOP PERCENTAGE') || name.includes('TOP %')) map.top_percentage = idx;
    else if (name === 'ALL' || name.includes('TOTAL SOLVED')) map.solved_total = idx;
    else if (name === 'EASY') map.easy = idx;
    else if (name === 'MEDIUM') map.medium = idx;
    else if (name === 'HARD') map.hard = idx;
  });
  return map;
}

function getVal(row, idx) {
  if (idx === undefined || idx === null || idx < 0 || idx >= row.length) return null;
  const v = row[idx];
  return v !== undefined && v !== null && String(v).trim() !== '' ? v : null;
}

function parseNum(val, fallback = 0) {
  if (val === null || val === undefined || val === '') return fallback;
  const str = String(val).trim();
  if (str.toUpperCase() === 'NA' || str.toUpperCase() === 'N/A' || str === '-') return fallback;
  const num = Number(str.replace(/[^0-9.-]/g, ''));
  return isNaN(num) ? fallback : num;
}

export function normalizeDept(deptStr) {
  const d = String(deptStr || '').toUpperCase().trim();
  if (d.includes('AIDS') || d.includes('ARTIFICIAL INT') || d.includes('DATA SCIENCE')) return 'AIDS';
  if (d.includes('AIML') || d.includes('MACHINE LEARNING')) return 'AIML';
  if (d.includes('CCE') || d.includes('COMMUNICATION')) return 'CCE';
  if (d.includes('CSBS') || d.includes('BUSINESS')) return 'CSBS';
  if (d.includes('CYS') || d.includes('CYBER')) return 'CYS';
  if (d.includes('CSE') || d.includes('CSC') || d.includes('COMPUTER SCIENCE')) return 'CSE';
  if (d.includes('ECE') || d.includes('ELECTRONICS')) return 'ECE';
  if (d.includes('EEE') || d.includes('ELECTRICAL')) return 'EEE';
  if (d.includes('IT') || d.includes('INFORMATION')) return 'IT';
  if (d.includes('MECH') || d.includes('MECHANICAL')) return 'MECH';
  return d || 'CSE';
}

export function generateLeetcodeTemplate() {
  const wb = XLSX.utils.book_new();
  const sampleData = [
    {
      "S.NO": 1,
      "ROLL NO": "24AD001",
      "NAME": "Aadhithya Balu S",
      "DEPARTMENT": "AIDS A",
      "Batch": "Batch - 2",
      "Programs Solved": 829,
      "Code Tests": 27,
      "Code Tracks": 469,
      "Code Tutor": 333,
      "DC": 0,
      "DT": 0,
      "Aptitude Score": 724,
      "Points": 1784,
      "SkillRack Rank": 37621
    }
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  XLSX.utils.book_append_sheet(wb, ws, "PGP Report");
  XLSX.writeFile(wb, "Batch_2024-2028_PGP_Template.xlsx");
}
