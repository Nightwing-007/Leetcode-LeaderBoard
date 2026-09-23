package com.sece.leaderboard.service;

import com.sece.leaderboard.dto.UploadResponseDto;
import com.sece.leaderboard.entity.LeetCodeProfile;
import com.sece.leaderboard.entity.PgpScore;
import com.sece.leaderboard.entity.Student;
import com.sece.leaderboard.repository.LeetCodeProfileRepository;
import com.sece.leaderboard.repository.PgpScoreRepository;
import com.sece.leaderboard.repository.StudentRepository;
import org.apache.poi.ss.usermodel.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
public class ExcelImportService {

    private static final Logger log = LoggerFactory.getLogger(ExcelImportService.class);

    private final StudentRepository studentRepository;
    private final LeetCodeProfileRepository leetCodeProfileRepository;
    private final PgpScoreRepository pgpScoreRepository;

    public ExcelImportService(StudentRepository studentRepository,
                              LeetCodeProfileRepository leetCodeProfileRepository,
                              PgpScoreRepository pgpScoreRepository) {
        this.studentRepository = studentRepository;
        this.leetCodeProfileRepository = leetCodeProfileRepository;
        this.pgpScoreRepository = pgpScoreRepository;
    }

    @Transactional
    public UploadResponseDto importExcelFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file is empty");
        }

        int processed = 0;
        int created = 0;
        int updated = 0;
        List<String> warnings = new ArrayList<>();

        String detectedType = "pgp";
        try (InputStream is = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(is)) {

            for (int s = 0; s < workbook.getNumberOfSheets(); s++) {
                Sheet sheet = workbook.getSheetAt(s);
                String sheetName = sheet.getSheetName().trim();
                log.info("Processing sheet: {}", sheetName);

                int headerRowNum = findHeaderRow(sheet);
                if (headerRowNum == -1) {
                    log.warn("No recognized header found in sheet: {}", sheetName);
                    continue;
                }

                Row headerRow = sheet.getRow(headerRowNum);
                Map<String, Integer> colMap = mapHeaders(headerRow);
                String rawCodeHeader = getCodeHeaderName(headerRow);

                boolean isWeeklySheet = colMap.containsKey("weekly_score") || colMap.containsKey("weekly_code_score")
                        || colMap.containsKey("weekly_mcq_score") || sheetName.toLowerCase().contains("ranking")
                        || sheetName.toLowerCase().contains("assessment") || sheetName.toLowerCase().contains("candidate");
                boolean isLeetCodeSheet = colMap.containsKey("leetcode_id") || colMap.containsKey("contest_rating") || colMap.containsKey("all_solved");
                boolean isPgpSheet = !isWeeklySheet && !isLeetCodeSheet && (colMap.containsKey("programs_solved") || colMap.containsKey("points") || colMap.containsKey("code_tracks") || colMap.containsKey("dc"));

                if (isWeeklySheet) detectedType = "weekly";
                else if (isLeetCodeSheet) detectedType = "leetcode";
                else if (isPgpSheet) detectedType = "pgp";

                String inferredBatch = inferBatchFromSheetName(sheetName);
                String extractedTestName = extractTestName(rawCodeHeader, sheetName);

                for (int r = headerRowNum + 1; r <= sheet.getLastRowNum(); r++) {
                    Row row = sheet.getRow(r);
                    if (row == null) continue;

                    String rollNo = getCleanStringValue(row, colMap.get("roll_no"));
                    // In sheets like 25-29 LeetCode, Col 1 is application no (IC25...) and Col 2 is the actual roll number (25AD...)
                    Integer rollCol = colMap.get("roll_no");
                    if (rollCol != null) {
                        String nextColVal = getCleanStringValue(row, rollCol + 1);
                        if (nextColVal != null && nextColVal.matches("^\\d{2}[A-Za-z]{2,4}\\d{2,4}.*")) {
                            rollNo = nextColVal;
                        }
                    }

                    String name = getCleanStringValue(row, colMap.get("name"));

                    if ((rollNo == null || rollNo.isBlank()) && (name == null || name.isBlank())) {
                        continue;
                    }

                    if (rollNo == null || rollNo.isBlank()) {
                        rollNo = "SECE_" + (processed + 1);
                    }
                    rollNo = rollNo.trim().toUpperCase();

                    String rawDept = getCleanStringValue(row, colMap.get("department"));
                    String department = normalizeDepartment(rawDept);
                    String section = rawDept != null ? rawDept.trim() : department;
                    String subBatch = getCleanStringValue(row, colMap.get("batch"));
                    String batch = (subBatch != null && subBatch.contains("202")) ? subBatch : inferredBatch;
                    String gender = getCleanStringValue(row, colMap.get("gender"));
                    if (gender == null || gender.isBlank()) gender = "Male";

                    Optional<Student> studentOpt = studentRepository.findByRollNoIgnoreCase(rollNo);
                    Student student;
                    if (studentOpt.isPresent()) {
                        student = studentOpt.get();
                        if (name != null && !name.isBlank()) student.setName(name);
                        student.setDepartmentCode(department);
                        student.setSection(section);
                        if (subBatch != null && !subBatch.isBlank()) student.setSubBatch(subBatch);
                        if (batch != null && !batch.isBlank()) student.setBatchYear(batch);
                        updated++;
                    } else {
                        student = new Student(rollNo, name != null && !name.isBlank() ? name : "Student " + rollNo,
                                department, batch, section, subBatch, gender);
                        student = studentRepository.save(student);
                        created++;
                    }

                    // Process Weekly Assessment
                    if (isWeeklySheet) {
                        Integer score = getIntValue(row, colMap.get("weekly_score"), null);
                        Integer rank = getIntValue(row, colMap.get("weekly_rank"), null);
                        Integer codeScore = getIntValue(row, colMap.get("weekly_code_score"), null);
                        Integer mcqScore = getIntValue(row, colMap.get("weekly_mcq_score"), null);

                        if (score != null) student.setWeeklyScore(score);
                        if (rank != null) student.setWeeklyRank(rank);
                        if (codeScore != null) student.setWeeklyCodeScore(codeScore);
                        if (mcqScore != null) student.setWeeklyMcqScore(mcqScore);
                        if (extractedTestName != null && !extractedTestName.isBlank()) {
                            student.setWeeklyTestName(extractedTestName);
                        }
                    }

                    // Process PGP Scores
                    if (isPgpSheet) {
                        PgpScore pgp = student.getPgpScore();
                        if (pgp == null) {
                            pgp = new PgpScore(student);
                        }

                        pgp.setProgramsSolved(getIntValue(row, colMap.get("programs_solved"), pgp.getProgramsSolved()));
                        pgp.setCodeTests(getIntValue(row, colMap.get("code_tests"), pgp.getCodeTests()));
                        pgp.setCodeTracks(getIntValue(row, colMap.get("code_tracks"), pgp.getCodeTracks()));
                        pgp.setCodeTutor(getIntValue(row, colMap.get("code_tutor"), pgp.getCodeTutor()));
                        pgp.setDc(getIntValue(row, colMap.get("dc"), pgp.getDc()));
                        pgp.setDt(getIntValue(row, colMap.get("dt"), pgp.getDt()));
                        pgp.setAptitudeScore(getIntValue(row, colMap.get("aptitude_score"), pgp.getAptitudeScore()));
                        pgp.setTotalPoints(getIntValue(row, colMap.get("points"), pgp.getTotalPoints()));
                        pgp.setSkillrackRank(getLongValue(row, colMap.get("skillrack_rank"), pgp.getSkillrackRank()));
                        pgp.setReportDate(LocalDate.now());

                        student.setPgpScore(pgp);
                    }

                    // Process LeetCode Profiles
                    if (isLeetCodeSheet) {
                        LeetCodeProfile lc = student.getLeetCodeProfile();
                        if (lc == null) {
                            lc = new LeetCodeProfile(student);
                        }

                        String lcId = getCleanStringValue(row, colMap.get("leetcode_id"));
                        if (lcId != null && !lcId.isBlank()) lc.setLeetcodeUsername(lcId);

                        lc.setContestRating(getBigDecimalValue(row, colMap.get("contest_rating"), lc.getContestRating()));
                        lc.setContestsAttended(getIntValue(row, colMap.get("contests_attended"), lc.getContestsAttended()));
                        lc.setGlobalRank(getLongValue(row, colMap.get("global_rank"), lc.getGlobalRank()));

                        String topPct = getCleanStringValue(row, colMap.get("top_percentage"));
                        if (topPct != null) lc.setTopPercentage(topPct);

                        lc.setSolvedTotal(getIntValue(row, colMap.get("all_solved"), lc.getSolvedTotal()));
                        lc.setSolvedEasy(getIntValue(row, colMap.get("easy"), lc.getSolvedEasy()));
                        lc.setSolvedMedium(getIntValue(row, colMap.get("medium"), lc.getSolvedMedium()));
                        lc.setSolvedHard(getIntValue(row, colMap.get("hard"), lc.getSolvedHard()));

                        student.setLeetCodeProfile(lc);
                    }

                    studentRepository.save(student);
                    processed++;
                }
            }

            return new UploadResponseDto(true, "Excel file parsed and synchronized successfully",
                    processed, created, updated, detectedType, warnings);

        } catch (Exception e) {
            log.error("Failed to parse Excel file", e);
            throw new RuntimeException("Error processing Excel file: " + e.getMessage(), e);
        }
    }

    private int findHeaderRow(Sheet sheet) {
        for (int r = 0; r <= Math.min(sheet.getLastRowNum(), 10); r++) {
            Row row = sheet.getRow(r);
            if (row == null) continue;
            for (Cell cell : row) {
                String val = getCellString(cell).toUpperCase();
                if (val.contains("ROLL NO") || val.contains("REGISTER NO") || val.contains("REGN NUMBER") || val.contains("REG NO") || val.contains("NAME")) {
                    return r;
                }
            }
        }
        return -1;
    }

    private String getCodeHeaderName(Row headerRow) {
        if (headerRow == null) return null;
        for (Cell cell : headerRow) {
            String name = getCellString(cell).trim();
            if (name.toUpperCase().contains("(CODE)")) {
                return name;
            }
        }
        return null;
    }

    private String extractTestName(String rawCodeHeader, String sheetName) {
        if (rawCodeHeader != null && !rawCodeHeader.isBlank()) {
            String clean = rawCodeHeader.replace("(CODE)", "").replace("- Score", "").replace("Score", "").trim();
            if (!clean.isBlank()) return clean;
        }
        if (sheetName != null && !sheetName.isBlank() && !sheetName.equalsIgnoreCase("Sheet1")) {
            return sheetName;
        }
        return "Weekly SkillRack Assessment";
    }

    private Map<String, Integer> mapHeaders(Row headerRow) {
        Map<String, Integer> map = new HashMap<>();
        boolean hasWeeklyMarkers = false;

        // Pre-scan for weekly assessment markers
        for (Cell cell : headerRow) {
            String name = getCellString(cell).trim().toUpperCase();
            if (name.contains("(CODE)") || name.contains("(MCQ)") || name.equals("SCORE")) {
                hasWeeklyMarkers = true;
                break;
            }
        }

        for (Cell cell : headerRow) {
            int c = cell.getColumnIndex();
            String name = getCellString(cell).trim().toUpperCase();

            if (name.contains("ROLL NO") || name.contains("REGISTER NO") || name.contains("REGN NUMBER") || name.contains("REG NO") || name.equals("ROLLNO")) {
                map.put("roll_no", c);
            } else if (name.equals("NAME") || name.contains("STUDENT NAME")) {
                map.put("name", c);
            } else if (name.contains("DEPARTMENT") || name.contains("DEPT") || name.contains("BRANCH")) {
                map.put("department", c);
            } else if (name.equals("BATCH") || name.contains("ACADEMIC YEAR")) {
                map.put("batch", c);
            } else if (name.equals("GENDER")) {
                map.put("gender", c);
            }

            // Weekly Assessment specific columns
            else if (hasWeeklyMarkers && (name.equals("#") || name.equals("RANK") || name.equals("S.NO") || name.equals("SL NO"))) {
                map.put("weekly_rank", c);
            } else if (hasWeeklyMarkers && (name.equals("SCORE") || name.contains("TEST SCORE") || name.equals("TOTAL SCORE"))) {
                map.put("weekly_score", c);
            } else if (name.contains("(CODE)")) {
                map.put("weekly_code_score", c);
            } else if (name.contains("(MCQ)") || (hasWeeklyMarkers && name.contains("APTITUDE"))) {
                map.put("weekly_mcq_score", c);
            }

            // Cumulative PGP Columns (when not a weekly test)
            else if (!hasWeeklyMarkers && (name.equals("#") || name.equals("S.NO") || name.equals("SL NO") || name.contains("SKILLRACK RANK"))) {
                map.put("skillrack_rank", c);
            } else if (name.contains("PROGRAMS SOLVED") || (!hasWeeklyMarkers && name.equals("SOLVED"))) {
                map.put("programs_solved", c);
            } else if (name.contains("CODE TESTS") || name.equals("TESTS")) {
                map.put("code_tests", c);
            } else if (name.contains("CODE TRACKS") || name.equals("TRACKS")) {
                map.put("code_tracks", c);
            } else if (name.contains("CODE TUTOR") || name.equals("TUTOR")) {
                map.put("code_tutor", c);
            } else if (name.equals("DC") || name.contains("DAILY CHALLENGE")) {
                map.put("dc", c);
            } else if (name.equals("DT") || name.contains("DAILY TEST")) {
                map.put("dt", c);
            } else if (name.contains("APTITUDE")) {
                map.put("aptitude_score", c);
            } else if (name.contains("PGP POINTS") || name.contains("TOTAL POINTS") || (!hasWeeklyMarkers && name.equals("POINTS"))) {
                map.put("points", c);
            }

            // LeetCode Columns
            else if (name.contains("LEETCODE ID") || name.contains("LEETCODEID")) {
                map.put("leetcode_id", c);
            } else if (name.contains("CONTEST RATING") || name.equals("RATING")) {
                map.put("contest_rating", c);
            } else if (name.contains("CONTEST ATTENDED") || name.contains("CONTESTS")) {
                map.put("contests_attended", c);
            } else if (name.contains("GLOBAL RANK")) {
                map.put("global_rank", c);
            } else if (name.contains("TOP PERCENTAGE") || name.contains("TOP %")) {
                map.put("top_percentage", c);
            } else if (name.equals("ALL") || name.contains("TOTAL SOLVED")) {
                map.put("all_solved", c);
            } else if (name.equals("EASY")) {
                map.put("easy", c);
            } else if (name.equals("MEDIUM")) {
                map.put("medium", c);
            } else if (name.equals("HARD")) {
                map.put("hard", c);
            }
        }
        return map;
    }

    private String normalizeDepartment(String dept) {
        if (dept == null || dept.isBlank()) return "CSE";
        String d = dept.toUpperCase().trim();
        if (d.contains("AIDS") || d.contains("ARTIFICIAL INT") || d.contains("DATA SCIENCE")) return "AIDS";
        if (d.contains("AIML") || d.contains("MACHINE LEARNING")) return "AIML";
        if (d.contains("CCE") || d.contains("COMMUNICATION ENG")) return "CCE";
        if (d.contains("CSBS") || d.contains("BUSINESS")) return "CSBS";
        if (d.contains("CYS") || d.contains("CYBER")) return "CYS";
        if (d.contains("CSE") || d.contains("CSC") || d.contains("COMPUTER SCIENCE")) return "CSE";
        if (d.contains("ECE") || d.contains("ELECTRONICS")) return "ECE";
        if (d.contains("EEE") || d.contains("ELECTRICAL")) return "EEE";
        if (d.contains("IT") || d.contains("INFORMATION")) return "IT";
        if (d.contains("MECH") || d.contains("MECHANICAL")) return "MECH";
        return d;
    }

    private String inferBatchFromSheetName(String sheetName) {
        if (sheetName.contains("23-27") || sheetName.contains("2023")) return "2023-2027";
        if (sheetName.contains("24-28") || sheetName.contains("2024")) return "2024-2028";
        if (sheetName.contains("25-29") || sheetName.contains("2025")) return "2025-2029";
        return "2024-2028";
    }

    private String getCleanStringValue(Row row, Integer colIndex) {
        if (colIndex == null) return null;
        Cell cell = row.getCell(colIndex);
        String val = getCellString(cell);
        return val.isBlank() ? null : val;
    }

    private Integer getIntValue(Row row, Integer colIndex, Integer fallback) {
        if (colIndex == null) return fallback != null ? fallback : 0;
        Cell cell = row.getCell(colIndex);
        if (cell == null) return fallback != null ? fallback : 0;
        try {
            if (cell.getCellType() == CellType.NUMERIC) {
                return (int) Math.round(cell.getNumericCellValue());
            } else if (cell.getCellType() == CellType.STRING) {
                String s = cell.getStringCellValue().replaceAll("[^0-9.-]", "").trim();
                return s.isEmpty() ? (fallback != null ? fallback : 0) : (int) Math.round(Double.parseDouble(s));
            }
        } catch (Exception ignored) {}
        return fallback != null ? fallback : 0;
    }

    private Long getLongValue(Row row, Integer colIndex, Long fallback) {
        if (colIndex == null) return fallback != null ? fallback : 0L;
        Cell cell = row.getCell(colIndex);
        if (cell == null) return fallback != null ? fallback : 0L;
        try {
            if (cell.getCellType() == CellType.NUMERIC) {
                return (long) Math.round(cell.getNumericCellValue());
            } else if (cell.getCellType() == CellType.STRING) {
                String s = cell.getStringCellValue().replaceAll("[^0-9.-]", "").trim();
                return s.isEmpty() ? (fallback != null ? fallback : 0L) : (long) Math.round(Double.parseDouble(s));
            }
        } catch (Exception ignored) {}
        return fallback != null ? fallback : 0L;
    }

    private BigDecimal getBigDecimalValue(Row row, Integer colIndex, BigDecimal fallback) {
        if (colIndex == null) return fallback != null ? fallback : BigDecimal.valueOf(1500.00);
        Cell cell = row.getCell(colIndex);
        if (cell == null) return fallback != null ? fallback : BigDecimal.valueOf(1500.00);
        try {
            if (cell.getCellType() == CellType.NUMERIC) {
                return BigDecimal.valueOf(cell.getNumericCellValue());
            } else if (cell.getCellType() == CellType.STRING) {
                String s = cell.getStringCellValue().replaceAll("[^0-9.-]", "").trim();
                return s.isEmpty() ? fallback : new BigDecimal(s);
            }
        } catch (Exception ignored) {}
        return fallback != null ? fallback : BigDecimal.valueOf(1500.00);
    }

    private String getCellString(Cell cell) {
        if (cell == null) return "";
        try {
            return switch (cell.getCellType()) {
                case STRING -> cell.getStringCellValue().trim();
                case NUMERIC -> {
                    if (DateUtil.isCellDateFormatted(cell)) {
                        yield cell.getLocalDateTimeCellValue().toLocalDate().toString();
                    }
                    double d = cell.getNumericCellValue();
                    yield d == (long) d ? String.format("%d", (long) d) : String.valueOf(d);
                }
                case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
                case FORMULA -> {
                    try {
                        yield cell.getStringCellValue().trim();
                    } catch (Exception e) {
                        double d = cell.getNumericCellValue();
                        yield d == (long) d ? String.format("%d", (long) d) : String.valueOf(d);
                    }
                }
                default -> "";
            };
        } catch (Exception e) {
            return "";
        }
    }
}
