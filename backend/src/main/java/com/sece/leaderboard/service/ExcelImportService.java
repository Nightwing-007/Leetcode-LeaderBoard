package com.sece.leaderboard.service;

import com.sece.leaderboard.dto.UploadResponseDto;
import com.sece.leaderboard.entity.Assessment;
import com.sece.leaderboard.entity.CodingPlatform;
import com.sece.leaderboard.entity.PlatformAccount;
import com.sece.leaderboard.entity.PlatformPerformance;
import com.sece.leaderboard.entity.Student;
import com.sece.leaderboard.repository.*;
import org.apache.poi.ss.usermodel.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.regex.Pattern;

@Service
public class ExcelImportService {

    private static final Logger log = LoggerFactory.getLogger(ExcelImportService.class);

    private final StudentRepository studentRepository;
    private final CodingPlatformRepository codingPlatformRepository;
    private final PlatformAccountRepository platformAccountRepository;
    private final PlatformPerformanceRepository platformPerformanceRepository;
    private final AssessmentRepository assessmentRepository;

    public ExcelImportService(StudentRepository studentRepository,
                              CodingPlatformRepository codingPlatformRepository,
                              PlatformAccountRepository platformAccountRepository,
                              PlatformPerformanceRepository platformPerformanceRepository,
                              AssessmentRepository assessmentRepository) {
        this.studentRepository = studentRepository;
        this.codingPlatformRepository = codingPlatformRepository;
        this.platformAccountRepository = platformAccountRepository;
        this.platformPerformanceRepository = platformPerformanceRepository;
        this.assessmentRepository = assessmentRepository;
    }

    @Transactional
    public UploadResponseDto importExcelFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded Excel file is empty");
        }

        int totalRowsParsed = 0;
        int studentsInserted = 0;
        int studentsUpdated = 0;
        int platformRecordsUpdated = 0;
        List<String> failedRows = new ArrayList<>();
        List<String> warnings = new ArrayList<>();
        String detectedFileType = "Unknown";

        try (InputStream is = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(is)) {

            for (int s = 0; s < workbook.getNumberOfSheets(); s++) {
                Sheet sheet = workbook.getSheetAt(s);
                String sheetName = sheet.getSheetName().trim();
                log.info("Processing Excel sheet [{}]: {}", s, sheetName);

                int headerRowNum = findHeaderRow(sheet);
                if (headerRowNum == -1) {
                    warnings.add("Sheet '" + sheetName + "': No recognizable student header row detected, skipped.");
                    continue;
                }

                Row headerRow = sheet.getRow(headerRowNum);
                Map<String, Integer> colMap = mapHeadersDynamically(headerRow);
                if (!colMap.containsKey("REG_NO") && !colMap.containsKey("NAME")) {
                    warnings.add("Sheet '" + sheetName + "': Neither Register/Roll No nor Name column detected, skipped.");
                    continue;
                }

                String sheetPlatform = detectPlatformForSheet(sheetName, colMap);
                if (!"Unknown".equalsIgnoreCase(sheetPlatform)) {
                    detectedFileType = sheetPlatform.toLowerCase();
                }

                String rawCodeHeader = getCodeHeaderName(headerRow);
                String testName = extractTestName(rawCodeHeader, sheetName);
                String inferredBatch = inferBatchFromSheet(sheetName);
                int inferredAcademicYear = determineAcademicYear(null, inferredBatch, sheetName);
                List<Integer> degreAssessmentCols = findDegreAssessmentColumns(headerRow, colMap, sheetName, sheetPlatform);

                for (int r = headerRowNum + 1; r <= sheet.getLastRowNum(); r++) {
                    Row row = sheet.getRow(r);
                    if (row == null) continue;

                    // 1. Dynamic Register Number Extraction & Validation
                    String regNo = extractValidRegisterNumber(row, colMap.get("REG_NO"));
                    String name = getCleanStringValue(row, colMap.get("NAME"));

                    // Skip empty rows
                    if ((regNo == null || regNo.isBlank()) && (name == null || name.isBlank())) {
                        continue;
                    }

                    if (regNo == null || regNo.isBlank()) {
                        failedRows.add("Row " + (r + 1) + " in '" + sheetName + "': Skipped due to missing Register / Roll Number (Name: " + (name != null ? name : "N/A") + ")");
                        continue;
                    }

                    totalRowsParsed++;

                    try {
                        // 2. Student Upsert Strategy
                        String rawDept = getCleanStringValue(row, colMap.get("DEPARTMENT"));
                        String department = normalizeDepartment(rawDept);
                        String rawSection = getCleanStringValue(row, colMap.get("SECTION"));
                        String section = extractSection(rawDept, rawSection);

                        String rawGender = getCleanStringValue(row, colMap.get("GENDER"));
                        String gender = normalizeGender(rawGender);

                        String subBatch = getCleanStringValue(row, colMap.get("BATCH"));
                        String batch = (subBatch != null && subBatch.matches(".*202\\d.*")) ? subBatch : inferredBatch;
                        int academicYear = determineAcademicYear(getIntValue(row, colMap.get("ACADEMIC_YEAR"), null), batch, sheetName);

                        Optional<Student> existingOpt = studentRepository.findByRegisterNumberIgnoreCase(regNo);
                        Student student;
                        if (existingOpt.isPresent()) {
                            student = existingOpt.get();
                            if (name != null && !name.isBlank()) student.setName(name.trim());
                            student.setDepartment(department);
                            student.setSection(section);
                            student.setBatch(batch);
                            student.setAcademicYear(academicYear);
                            if (rawGender != null && !rawGender.isBlank()) {
                                student.setGender(gender);
                            }
                            student = studentRepository.save(student);
                            studentsUpdated++;
                        } else {
                            student = new Student(regNo, name != null && !name.isBlank() ? name.trim() : "Student " + regNo,
                                    academicYear, department, section, batch, gender);
                            student = studentRepository.save(student);
                            studentsInserted++;
                        }

                        // 3. Platform Performance Isolation
                        boolean performanceUpdated = updatePlatformPerformance(
                                student, row, colMap, sheetPlatform, testName, degreAssessmentCols
                        );

                        if (performanceUpdated) {
                            platformRecordsUpdated++;
                        }

                    } catch (Exception rowEx) {
                        log.warn("Error processing row {} for regNo {}: {}", r + 1, regNo, rowEx.getMessage());
                        failedRows.add("Row " + (r + 1) + " (" + regNo + "): " + rowEx.getMessage());
                    }
                }
            }

            String summaryMessage = String.format(
                    "Excel ingestion completed. %d rows parsed: %d students inserted, %d updated, %d platform performance records synchronized.",
                    totalRowsParsed, studentsInserted, studentsUpdated, platformRecordsUpdated
            );

            return new UploadResponseDto(
                    true,
                    summaryMessage,
                    totalRowsParsed,
                    studentsInserted,
                    studentsUpdated,
                    platformRecordsUpdated,
                    detectedFileType,
                    failedRows,
                    warnings
            );

        } catch (Exception e) {
            log.error("Failed to parse and ingest Excel file", e);
            throw new RuntimeException("Error processing Excel file: " + e.getMessage(), e);
        }
    }

    /**
     * Isolated Platform Performance update logic.
     * Guarantees that updating a student's LeetCode data leaves SkillRack or Degre.AI untouched.
     */
    private boolean updatePlatformPerformance(Student student, Row row, Map<String, Integer> colMap,
                                              String sheetPlatform, String testName, List<Integer> degreAssessmentCols) {
        boolean updated = false;

        // --- A. LEETCODE PLATFORM ---
        if ("LeetCode".equalsIgnoreCase(sheetPlatform) || colMap.containsKey("LEETCODE_ID") || colMap.containsKey("CONTEST_RATING")) {
            CodingPlatform platform = getOrCreatePlatform("LeetCode");

            String leetcodeUsername = getCleanStringValue(row, colMap.get("LEETCODE_ID"));
            if (leetcodeUsername != null && !leetcodeUsername.isBlank()) {
                PlatformAccount account = platformAccountRepository
                        .findByStudentIdAndPlatformId(student.getId(), platform.getId())
                        .orElse(new PlatformAccount(student, platform, leetcodeUsername.trim()));
                account.setPlatformUsername(leetcodeUsername.trim());
                platformAccountRepository.save(account);
            }

            PlatformPerformance perf = platformPerformanceRepository
                    .findByStudentIdAndPlatformId(student.getId(), platform.getId())
                    .orElse(new PlatformPerformance(student, platform));

            Integer solved = getIntValue(row, colMap.get("SOLVED_TOTAL"), null);
            BigDecimal rating = getBigDecimalValue(row, colMap.get("CONTEST_RATING"), null);
            Long globalRank = getLongValue(row, colMap.get("GLOBAL_RANK"), null);

            if (solved != null) perf.setProblemsSolved(solved);
            if (rating != null) {
                perf.setContestRating(rating);
                perf.setRating(rating);
            }
            if (globalRank != null) perf.setGlobalRank(globalRank);

            perf.setUpdatedAt(ZonedDateTime.now());
            platformPerformanceRepository.save(perf);
            updated = true;
        }

        // --- B. SKILLRACK PLATFORM (CUMULATIVE PGP) ---
        if ("SkillRack".equalsIgnoreCase(sheetPlatform) || colMap.containsKey("PROGRAMS_SOLVED") || colMap.containsKey("TOTAL_POINTS")) {
            CodingPlatform platform = getOrCreatePlatform("SkillRack");

            PlatformPerformance perf = platformPerformanceRepository
                    .findByStudentIdAndPlatformId(student.getId(), platform.getId())
                    .orElse(new PlatformPerformance(student, platform));

            Integer solved = getIntValue(row, colMap.get("PROGRAMS_SOLVED"), null);
            Integer points = getIntValue(row, colMap.get("TOTAL_POINTS"), null);
            Integer aptitude = getIntValue(row, colMap.get("APTITUDE_SCORE"), null);
            Long skillrackRank = getLongValue(row, colMap.get("SKILLRACK_RANK"), null);

            if (solved != null) perf.setProblemsSolved(solved);
            if (points != null) perf.setRating(BigDecimal.valueOf(points));
            if (aptitude != null) perf.setAssessmentScore(BigDecimal.valueOf(aptitude));
            if (skillrackRank != null) perf.setGlobalRank(skillrackRank);

            perf.setUpdatedAt(ZonedDateTime.now());
            platformPerformanceRepository.save(perf);
            updated = true;
        }

        // --- C. WEEKLY ASSESSMENT (SKILLRACK ASSESSMENT) ---
        if ("Weekly".equalsIgnoreCase(sheetPlatform) || colMap.containsKey("WEEKLY_CODE") || colMap.containsKey("WEEKLY_SCORE") || colMap.containsKey("WEEKLY_MCQ")) {
            CodingPlatform platform = getOrCreatePlatform("SkillRack");

            BigDecimal score = getBigDecimalValue(row, colMap.get("WEEKLY_SCORE"), null);
            BigDecimal codeScore = getBigDecimalValue(row, colMap.get("WEEKLY_CODE"), null);
            BigDecimal mcqScore = getBigDecimalValue(row, colMap.get("WEEKLY_MCQ"), null);
            Long rank = getLongValue(row, colMap.get("WEEKLY_RANK"), null);

            // Create assessment record
            Assessment assessment = new Assessment(
                    student,
                    platform,
                    testName != null ? testName : "Weekly Assessment",
                    LocalDate.now(),
                    score != null ? score : BigDecimal.ZERO,
                    codeScore != null ? codeScore : BigDecimal.ZERO,
                    mcqScore != null ? mcqScore : BigDecimal.ZERO,
                    rank != null ? rank : 0L
            );
            assessmentRepository.save(assessment);

            // Update assessment performance metrics on SkillRack performance record
            PlatformPerformance perf = platformPerformanceRepository
                    .findByStudentIdAndPlatformId(student.getId(), platform.getId())
                    .orElse(new PlatformPerformance(student, platform));

            if (score != null) perf.setAssessmentScore(score);
            if (rank != null) perf.setAssessmentRank(rank);

            perf.setUpdatedAt(ZonedDateTime.now());
            platformPerformanceRepository.save(perf);
            updated = true;
        }

        // --- D. DEGRE.AI PLATFORM (AVERAGE OF VARIABLE WEEKLY ASSESSMENTS 2 TO 6) ---
        boolean isDegrePlatform = "Degre.AI".equalsIgnoreCase(sheetPlatform)
                || colMap.containsKey("DEGRE_AVG")
                || colMap.containsKey("DEGRE_SCORE")
                || colMap.containsKey("DEGRE_ID");
        if (isDegrePlatform) {
            CodingPlatform platform = getOrCreatePlatform("Degre.AI");

            if (colMap.containsKey("DEGRE_ID")) {
                String degreUsername = getCleanStringValue(row, colMap.get("DEGRE_ID"));
                if (degreUsername != null && !degreUsername.isBlank()) {
                    PlatformAccount account = platformAccountRepository
                            .findByStudentIdAndPlatformId(student.getId(), platform.getId())
                            .orElse(new PlatformAccount(student, platform, degreUsername.trim()));
                    account.setPlatformUsername(degreUsername.trim());
                    platformAccountRepository.save(account);
                }
            }

            PlatformPerformance perf = platformPerformanceRepository
                    .findByStudentIdAndPlatformId(student.getId(), platform.getId())
                    .orElse(new PlatformPerformance(student, platform));

            // Variable weekly assessments: calculate arithmetic average of all marks (each out of 100)
            BigDecimal avgScore = null;
            if (degreAssessmentCols != null && !degreAssessmentCols.isEmpty()) {
                BigDecimal sum = BigDecimal.ZERO;
                int count = 0;
                for (Integer colIdx : degreAssessmentCols) {
                    BigDecimal scoreVal = getBigDecimalValue(row, colIdx, null);
                    if (scoreVal != null) {
                        sum = sum.add(scoreVal);
                        count++;
                    }
                }
                if (count > 0) {
                    avgScore = sum.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP);
                }
            }

            // Fallback to single DEGRE_AVG or DEGRE_SCORE column if no multi-columns found
            if (avgScore == null) {
                if (colMap.containsKey("DEGRE_AVG")) {
                    avgScore = getBigDecimalValue(row, colMap.get("DEGRE_AVG"), null);
                } else if (colMap.containsKey("DEGRE_SCORE")) {
                    avgScore = getBigDecimalValue(row, colMap.get("DEGRE_SCORE"), null);
                }
            }

            if (avgScore != null) {
                perf.setAssessmentScore(avgScore);
            }

            Integer solved = getIntValue(row, colMap.get("DEGRE_SOLVED"), null);
            if (solved != null) {
                perf.setProblemsSolved(solved);
            }

            perf.setUpdatedAt(ZonedDateTime.now());
            platformPerformanceRepository.save(perf);
            updated = true;
        }

        // --- E. ATCODER PLATFORM ---
        if ("AtCoder".equalsIgnoreCase(sheetPlatform) || colMap.containsKey("ATCODER_RATING") || colMap.containsKey("ATCODER_ID")) {
            CodingPlatform platform = getOrCreatePlatform("AtCoder");

            String acUsername = getCleanStringValue(row, colMap.get("ATCODER_ID"));
            if (acUsername != null && !acUsername.isBlank()) {
                PlatformAccount account = platformAccountRepository
                        .findByStudentIdAndPlatformId(student.getId(), platform.getId())
                        .orElse(new PlatformAccount(student, platform, acUsername.trim()));
                account.setPlatformUsername(acUsername.trim());
                platformAccountRepository.save(account);
            }

            PlatformPerformance perf = platformPerformanceRepository
                    .findByStudentIdAndPlatformId(student.getId(), platform.getId())
                    .orElse(new PlatformPerformance(student, platform));

            BigDecimal rating = getBigDecimalValue(row, colMap.get("ATCODER_RATING"), null);
            Integer solved = getIntValue(row, colMap.get("ATCODER_SOLVED"), null);
            if (rating != null) perf.setRating(rating);
            if (solved != null) perf.setProblemsSolved(solved);

            perf.setUpdatedAt(ZonedDateTime.now());
            platformPerformanceRepository.save(perf);
            updated = true;
        }

        // --- F. CODEFORCES PLATFORM ---
        if ("Codeforces".equalsIgnoreCase(sheetPlatform) || colMap.containsKey("CODEFORCES_RATING") || colMap.containsKey("CODEFORCES_ID")) {
            CodingPlatform platform = getOrCreatePlatform("Codeforces");

            String cfUsername = getCleanStringValue(row, colMap.get("CODEFORCES_ID"));
            if (cfUsername != null && !cfUsername.isBlank()) {
                PlatformAccount account = platformAccountRepository
                        .findByStudentIdAndPlatformId(student.getId(), platform.getId())
                        .orElse(new PlatformAccount(student, platform, cfUsername.trim()));
                account.setPlatformUsername(cfUsername.trim());
                platformAccountRepository.save(account);
            }

            PlatformPerformance perf = platformPerformanceRepository
                    .findByStudentIdAndPlatformId(student.getId(), platform.getId())
                    .orElse(new PlatformPerformance(student, platform));

            BigDecimal rating = getBigDecimalValue(row, colMap.get("CODEFORCES_RATING"), null);
            Integer solved = getIntValue(row, colMap.get("CODEFORCES_SOLVED"), null);
            if (rating != null) perf.setRating(rating);
            if (solved != null) perf.setProblemsSolved(solved);

            perf.setUpdatedAt(ZonedDateTime.now());
            platformPerformanceRepository.save(perf);
            updated = true;
        }

        return updated;
    }

    private CodingPlatform getOrCreatePlatform(String platformName) {
        BigDecimal defaultWeight = switch (platformName.trim().toUpperCase()) {
            case "LEETCODE" -> BigDecimal.valueOf(30.00);
            case "SKILLRACK" -> BigDecimal.valueOf(10.00);
            case "ATCODER" -> BigDecimal.valueOf(20.00);
            case "CODEFORCES" -> BigDecimal.valueOf(20.00);
            case "DEGRE.AI", "DEGREE_AI", "DEGREE.AI" -> BigDecimal.valueOf(20.00);
            default -> BigDecimal.valueOf(20.00);
        };
        return codingPlatformRepository.findByPlatformNameIgnoreCase(platformName.trim())
                .orElseGet(() -> codingPlatformRepository.save(
                        new CodingPlatform(platformName.trim(), defaultWeight, true)
                ));
    }

    /**
     * Finds the header row index by inspecting rows 0 through 10.
     */
    private int findHeaderRow(Sheet sheet) {
        for (int r = 0; r <= Math.min(sheet.getLastRowNum(), 10); r++) {
            Row row = sheet.getRow(r);
            if (row == null) continue;
            for (Cell cell : row) {
                String val = getCellString(cell).toUpperCase();
                if (val.contains("ROLL NO") || val.contains("REGISTER NO") || val.contains("REGN NUMBER")
                        || val.contains("REG NO") || val.contains("NAME") || val.contains("ROLLNO")) {
                    return r;
                }
            }
        }
        return -1;
    }

    /**
     * Flexible Dynamic Header Mapping using regex patterns and alias lists.
     */
    private Map<String, Integer> mapHeadersDynamically(Row headerRow) {
        Map<String, Integer> map = new HashMap<>();

        // Pre-scan for weekly assessment markers
        boolean hasWeeklyMarkers = false;
        for (Cell cell : headerRow) {
            String name = getCellString(cell).trim().toUpperCase();
            if (name.contains("(CODE)") || name.contains("(MCQ)") || name.equals("SCORE") || name.contains("DAILY ASSESSMENT")) {
                hasWeeklyMarkers = true;
                break;
            }
        }

        for (Cell cell : headerRow) {
            int c = cell.getColumnIndex();
            String raw = getCellString(cell).trim();
            String upper = raw.toUpperCase();

            // 1. Student Identity (Register / Roll Number)
            if (upper.matches(".*(REGISTER\\s*NO|REGISTER\\s*NUMBER|REGN?\\s*NO|REGN?\\s*NUMBER|ROLL\\s*NO|ROLLNO|ROLL\\s*NUMBER|REG\\.?\\s*NO).*")) {
                if (!map.containsKey("REG_NO")) map.put("REG_NO", c);
            }
            // 2. Student Name
            else if (upper.matches(".*(STUDENT\\s*NAME|CANDIDATE\\s*NAME|^NAME$|FULL\\s*NAME).*")) {
                if (!map.containsKey("NAME")) map.put("NAME", c);
            }
            // 3. Department
            else if (upper.matches(".*(DEPARTMENT|BRANCH|^DEPT(\\s*-\\s*SECTION)?$).*")) {
                if (!map.containsKey("DEPARTMENT")) map.put("DEPARTMENT", c);
            }
            // 4. Batch
            else if (upper.matches(".*(ACADEMIC\\s*YEAR|^BATCH(\\s*YEAR)?$).*")) {
                if (!map.containsKey("BATCH")) map.put("BATCH", c);
            }
            // 5. Section
            else if (upper.matches(".*(^SECTION$|^SEC$).*")) {
                if (!map.containsKey("SECTION")) map.put("SECTION", c);
            }
            // 6. Year
            else if (upper.matches(".*(^YEAR$|^ACADEMIC\\s*YEAR$).*")) {
                if (!map.containsKey("ACADEMIC_YEAR")) map.put("ACADEMIC_YEAR", c);
            }
            // 7. Gender
            else if (upper.matches(".*(^GENDER$|^SEX$).*")) {
                if (!map.containsKey("GENDER")) map.put("GENDER", c);
            }

            // --- Platform Specific Columns ---
            // LeetCode
            else if (upper.matches(".*(LEETCODE\\s*ID|LEETCODEID|LEETCODE\\s*USERNAME|^LEETCODE$).*")) {
                map.put("LEETCODE_ID", c);
            } else if (upper.matches(".*(CONTEST\\s*RATING|^RATING$).*")) {
                map.put("CONTEST_RATING", c);
            } else if (upper.matches(".*(CONTEST(S)?\\s*ATTENDED|^CONTESTS$).*")) {
                map.put("CONTESTS_ATTENDED", c);
            } else if (upper.matches(".*(GLOBAL\\s*RANK|WORLD\\s*RANK).*")) {
                map.put("GLOBAL_RANK", c);
            } else if (upper.matches(".*(ALL\\s*SOLVED|TOTAL\\s*SOLVED|SOLVED\\s*TOTAL|^ALL$|PROBLEMS\\s*SOLVED|^SOLVED$).*") && !hasWeeklyMarkers) {
                map.put("SOLVED_TOTAL", c);
            } else if (upper.equals("EASY")) {
                map.put("SOLVED_EASY", c);
            } else if (upper.equals("MEDIUM")) {
                map.put("SOLVED_MEDIUM", c);
            } else if (upper.equals("HARD")) {
                map.put("SOLVED_HARD", c);
            }

            // SkillRack (PGP)
            else if (!hasWeeklyMarkers && upper.matches(".*(PROGRAMS\\s*SOLVED|^PROGRAMS$).*")) {
                map.put("PROGRAMS_SOLVED", c);
            } else if (!hasWeeklyMarkers && upper.matches(".*(CODE\\s*TESTS|^TESTS$).*")) {
                map.put("CODE_TESTS", c);
            } else if (!hasWeeklyMarkers && upper.matches(".*(CODE\\s*TRACKS|^TRACKS$).*")) {
                map.put("CODE_TRACKS", c);
            } else if (!hasWeeklyMarkers && upper.matches(".*(CODE\\s*TUTOR|^TUTOR$).*")) {
                map.put("CODE_TUTOR", c);
            } else if (upper.equals("DC") || upper.contains("DAILY CHALLENGE")) {
                map.put("DC", c);
            } else if (upper.equals("DT") || upper.contains("DAILY TEST")) {
                map.put("DT", c);
            } else if (!hasWeeklyMarkers && (upper.equals("APTITUDE") || upper.contains("APTITUDE SCORE"))) {
                map.put("APTITUDE_SCORE", c);
            } else if (!hasWeeklyMarkers && (upper.equals("POINTS") || upper.contains("TOTAL POINTS") || upper.contains("PGP POINTS"))) {
                map.put("TOTAL_POINTS", c);
            } else if (!hasWeeklyMarkers && (upper.contains("SKILLRACK RANK") || upper.equals("PGP RANK"))) {
                map.put("SKILLRACK_RANK", c);
            }

            // Weekly Assessment
            else if (hasWeeklyMarkers && (upper.equals("#") || upper.equals("RANK") || upper.contains("TEST RANK") || upper.contains("WEEKLY RANK"))) {
                map.put("WEEKLY_RANK", c);
            } else if (hasWeeklyMarkers && (upper.equals("SCORE") || upper.contains("TEST SCORE") || upper.contains("TOTAL SCORE"))) {
                map.put("WEEKLY_SCORE", c);
            } else if (upper.contains("(CODE)") || upper.contains("DAILY ASSESSMENT")) {
                map.put("WEEKLY_CODE", c);
            } else if (upper.contains("(MCQ)") || upper.contains("APTITUDE TEST")) {
                map.put("WEEKLY_MCQ", c);
            }

            // Degre.AI
            else if (upper.matches(".*(DEGRE\\s*ID|DEGREID|DEGREE\\s*ID).*")) {
                map.put("DEGRE_ID", c);
            } else if (upper.matches(".*(DEGRE\\s*SOLVED|DEGRE.*PROBLEMS).*")) {
                map.put("DEGRE_SOLVED", c);
            } else if (upper.matches(".*(DEGRE.*(SCORE|AVG|AVERAGE)).*")) {
                map.put("DEGRE_AVG", c);
            }

            // AtCoder
            else if (upper.matches(".*(ATCODER\\s*ID|ATCODER\\s*USERNAME).*")) {
                map.put("ATCODER_ID", c);
            } else if (upper.matches(".*(ATCODER\\s*RATING).*")) {
                map.put("ATCODER_RATING", c);
            } else if (upper.matches(".*(ATCODER\\s*SOLVED).*")) {
                map.put("ATCODER_SOLVED", c);
            }

            // Codeforces
            else if (upper.matches(".*(CODEFORCES\\s*ID|CODEFORCES\\s*USERNAME|CF\\s*HANDLE).*")) {
                map.put("CODEFORCES_ID", c);
            } else if (upper.matches(".*(CODEFORCES\\s*RATING|CF\\s*RATING).*")) {
                map.put("CODEFORCES_RATING", c);
            } else if (upper.matches(".*(CODEFORCES\\s*SOLVED|CF\\s*SOLVED).*")) {
                map.put("CODEFORCES_SOLVED", c);
            }
        }

        return map;
    }

    private List<Integer> findDegreAssessmentColumns(Row headerRow, Map<String, Integer> colMap, String sheetName, String sheetPlatform) {
        List<Integer> cols = new ArrayList<>();
        if (headerRow == null) return cols;

        // Degre.AI assessment columns must only be processed if the sheet is actually a Degre.AI sheet
        boolean isDegreSheet = "Degre.AI".equalsIgnoreCase(sheetPlatform)
                || (sheetName != null && (sheetName.toLowerCase().contains("degre") || sheetName.toLowerCase().contains("degree")));
        if (!isDegreSheet) {
            return cols;
        }

        Set<Integer> knownCols = new HashSet<>(colMap.values());

        // 1. Check for explicit assessment column headers
        for (Cell cell : headerRow) {
            int c = cell.getColumnIndex();
            String val = getCellString(cell).trim().toUpperCase();
            if (val.isEmpty()) continue;

            if (val.matches(".*(ASSESSMENT|ASSMT|TEST|EXAM|LAB|TASK|CHALLENGE|MARKS)\\s*\\d*.*")
                    || val.matches("^[AT]\\s*\\d+$")) {
                if (!knownCols.contains(c) || val.contains("ASSESSMENT") || val.contains("ASSMT")) {
                    cols.add(c);
                }
            }
        }

        // 2. Fallback: If no explicit patterns matched, but sheet name indicates Degre.AI
        if (cols.isEmpty() && (sheetName.toLowerCase().contains("degre") || sheetName.toLowerCase().contains("degree"))) {
            for (Cell cell : headerRow) {
                int c = cell.getColumnIndex();
                if (knownCols.contains(c)) continue;

                String val = getCellString(cell).trim().toUpperCase();
                if (!val.isEmpty() && !val.equals("TOTAL") && !val.equals("AVERAGE") && !val.equals("S.NO")
                        && !val.equals("#") && !val.equals("SL NO") && !val.equals("GENDER")) {
                    cols.add(c);
                }
            }
        }

        return cols;
    }

    private String detectPlatformForSheet(String sheetName, Map<String, Integer> colMap) {
        String sn = sheetName.toLowerCase();
        if (sn.contains("leetcode") || colMap.containsKey("LEETCODE_ID") || colMap.containsKey("CONTEST_RATING") || colMap.containsKey("GLOBAL_RANK")) {
            return "LeetCode";
        }
        if (sn.contains("degre") || sn.contains("degree") || colMap.containsKey("DEGRE_AVG") || colMap.containsKey("DEGRE_ID")) {
            return "Degre.AI";
        }
        if (colMap.containsKey("WEEKLY_CODE") || colMap.containsKey("WEEKLY_MCQ") || sn.contains("ranking") || sn.contains("candidate") || sn.contains("assessment")) {
            return "Weekly";
        }
        if (sn.contains("pgp") || sn.contains("skillrack") || colMap.containsKey("PROGRAMS_SOLVED") || colMap.containsKey("TOTAL_POINTS") || colMap.containsKey("DC") || colMap.containsKey("DT")) {
            return "SkillRack";
        }
        if (sn.contains("atcoder") || colMap.containsKey("ATCODER_RATING")) return "AtCoder";
        if (sn.contains("codeforces") || colMap.containsKey("CODEFORCES_RATING")) return "Codeforces";
        return "Unknown";
    }

    /**
     * Resolves the student register number, including handling two-column layouts
     * where Column 1 is an application number (e.g. IC25BER...) and Column 2 is the actual roll number (25AD...).
     */
    private String extractValidRegisterNumber(Row row, Integer rollCol) {
        if (rollCol == null) return null;
        String val = getCleanStringValue(row, rollCol);
        if (val == null || val.isBlank()) return null;

        // Check if next column contains the real student roll number
        String nextVal = getCleanStringValue(row, rollCol + 1);
        if (nextVal != null && nextVal.trim().matches("^\\d{2}[A-Za-z]{2,4}\\d{2,4}.*")) {
            return nextVal.trim().toUpperCase();
        }

        String trimmed = val.trim().toUpperCase();
        if (trimmed.equals("ROLL NO") || trimmed.equals("REGISTER NO") || trimmed.equals("REG NO")
                || trimmed.equals("REGN NUMBER") || trimmed.equals("TOTAL") || trimmed.equals("AVERAGE")
                || trimmed.equals("S.NO") || trimmed.equals("#") || trimmed.length() < 3) {
            return null;
        }

        return trimmed;
    }

    private int determineAcademicYear(Integer explicitYear, String batch, String sheetName) {
        if (explicitYear != null && explicitYear >= 1 && explicitYear <= 4) {
            return explicitYear;
        }
        String combined = ((batch != null ? batch : "") + " " + (sheetName != null ? sheetName : "")).toLowerCase();
        if (combined.contains("2023-2027") || combined.contains("23-27") || combined.contains("iv year") || combined.contains("final year")) {
            return 4;
        }
        if (combined.contains("2024-2028") || combined.contains("24-28") || combined.contains("iii year") || combined.contains("pre-final")) {
            return 3;
        }
        if (combined.contains("2025-2029") || combined.contains("25-29") || combined.contains("ii year") || combined.contains("second year")) {
            return 2;
        }
        if (combined.contains("2026-2030") || combined.contains("26-30") || combined.contains("i year") || combined.contains("first year")) {
            return 1;
        }
        return 3; // sensible default
    }

    private String inferBatchFromSheet(String sheetName) {
        if (sheetName == null) return "2024-2028";
        String s = sheetName.toLowerCase();
        if (s.contains("23-27") || s.contains("2023")) return "2023-2027";
        if (s.contains("24-28") || s.contains("2024")) return "2024-2028";
        if (s.contains("25-29") || s.contains("2025")) return "2025-2029";
        if (s.contains("26-30") || s.contains("2026")) return "2026-2030";
        return "2024-2028";
    }

    private String normalizeDepartment(String dept) {
        if (dept == null || dept.isBlank()) return "CSE";
        String d = dept.toUpperCase().trim();
        if (d.equals("AI") || d.startsWith("AI ") || d.contains("AIDS") || d.contains("ARTIFICIAL INT") || d.contains("DATA SCIENCE")) return "AIDS";
        if (d.contains("AIML") || d.contains("MACHINE LEARNING")) return "AIML";
        if (d.contains("CCE") || d.contains("COMMUNICATION ENG")) return "CCE";
        if (d.contains("CSBS") || d.contains("BUSINESS")) return "CSBS";
        if (d.contains("CYS") || d.contains("CYBER")) return "CYS";
        if (d.contains("CSE") || d.contains("CSC") || d.contains("COMPUTER SCIENCE")) return "CSE";
        if (d.contains("ECE") || d.contains("ELECTRONICS")) return "ECE";
        if (d.contains("EEE") || d.contains("ELECTRICAL")) return "EEE";
        if (d.contains("IT") || d.contains("INFORMATION")) return "IT";
        if (d.contains("MECH") || d.contains("MECHANICAL")) return "MECH";
        return d.length() > 50 ? d.substring(0, 50) : d;
    }

    private String normalizeGender(String raw) {
        if (raw == null || raw.isBlank()) return "Male";
        String g = raw.trim().toUpperCase();
        if (g.startsWith("F") || g.contains("FEMALE") || g.contains("GIRL") || g.contains("WOMEN") || g.contains("WOMAN")) {
            return "Female";
        }
        return "Male";
    }

    private String extractSection(String rawDept, String rawSection) {
        if (rawSection != null && !rawSection.isBlank()) {
            String s = rawSection.trim();
            return s.length() > 10 ? s.substring(0, 10) : s;
        }
        if (rawDept != null && !rawDept.isBlank()) {
            String[] parts = rawDept.trim().split("\\s+");
            if (parts.length > 1) {
                String last = parts[parts.length - 1].trim();
                if (last.length() <= 2 && Character.isLetter(last.charAt(0))) {
                    return last;
                }
            }
        }
        return "A";
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

    private String getCleanStringValue(Row row, Integer colIndex) {
        if (colIndex == null) return null;
        Cell cell = row.getCell(colIndex);
        String val = getCellString(cell);
        return val.isBlank() ? null : val.trim();
    }

    private Integer getIntValue(Row row, Integer colIndex, Integer fallback) {
        if (colIndex == null) return fallback;
        Cell cell = row.getCell(colIndex);
        if (cell == null) return fallback;
        try {
            if (cell.getCellType() == CellType.NUMERIC) {
                return (int) Math.round(cell.getNumericCellValue());
            } else if (cell.getCellType() == CellType.STRING) {
                String s = cell.getStringCellValue().replaceAll("[^0-9.-]", "").trim();
                return s.isEmpty() ? fallback : (int) Math.round(Double.parseDouble(s));
            }
        } catch (Exception ignored) {}
        return fallback;
    }

    private Long getLongValue(Row row, Integer colIndex, Long fallback) {
        if (colIndex == null) return fallback;
        Cell cell = row.getCell(colIndex);
        if (cell == null) return fallback;
        try {
            if (cell.getCellType() == CellType.NUMERIC) {
                return (long) Math.round(cell.getNumericCellValue());
            } else if (cell.getCellType() == CellType.STRING) {
                String s = cell.getStringCellValue().replaceAll("[^0-9.-]", "").trim();
                return s.isEmpty() ? fallback : (long) Math.round(Double.parseDouble(s));
            }
        } catch (Exception ignored) {}
        return fallback;
    }

    private BigDecimal getBigDecimalValue(Row row, Integer colIndex, BigDecimal fallback) {
        if (colIndex == null) return fallback;
        Cell cell = row.getCell(colIndex);
        if (cell == null) return fallback;
        try {
            if (cell.getCellType() == CellType.NUMERIC) {
                return BigDecimal.valueOf(cell.getNumericCellValue());
            } else if (cell.getCellType() == CellType.STRING) {
                String s = cell.getStringCellValue().replaceAll("[^0-9.-]", "").trim();
                return s.isEmpty() ? fallback : new BigDecimal(s);
            }
        } catch (Exception ignored) {}
        return fallback;
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
