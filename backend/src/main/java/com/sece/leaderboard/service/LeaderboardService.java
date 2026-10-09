package com.sece.leaderboard.service;

import com.sece.leaderboard.dto.LeaderboardRowDto;
import com.sece.leaderboard.entity.*;
import com.sece.leaderboard.repository.*;
import com.sece.leaderboard.repository.specification.RankSpecifications;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

/**
 * High-performance Ranking Calculation Engine.
 * Eradicates all legacy hardcoded Java composite scores by delegating min-max normalization,
 * weighting, and window ranking directly to optimized PostgreSQL views.
 */
@Service
@Transactional(readOnly = true)
public class LeaderboardService {

    private final RankCollegeTopperRepository rankCollegeTopperRepository;
    private final RankYearTopperRepository rankYearTopperRepository;
    private final RankDepartmentTopperRepository rankDepartmentTopperRepository;
    private final RankDepartmentYearTopperRepository rankDepartmentYearTopperRepository;
    private final RankClassTopperRepository rankClassTopperRepository;
    private final StudentOverallScoreRepository studentOverallScoreRepository;
    private final StudentRepository studentRepository;
    private final CodingPlatformRepository codingPlatformRepository;
    private final PlatformPerformanceRepository platformPerformanceRepository;
    private final PlatformAccountRepository platformAccountRepository;
    private final AssessmentRepository assessmentRepository;

    public LeaderboardService(
            RankCollegeTopperRepository rankCollegeTopperRepository,
            RankYearTopperRepository rankYearTopperRepository,
            RankDepartmentTopperRepository rankDepartmentTopperRepository,
            RankDepartmentYearTopperRepository rankDepartmentYearTopperRepository,
            RankClassTopperRepository rankClassTopperRepository,
            StudentOverallScoreRepository studentOverallScoreRepository,
            StudentRepository studentRepository,
            CodingPlatformRepository codingPlatformRepository,
            PlatformPerformanceRepository platformPerformanceRepository,
            PlatformAccountRepository platformAccountRepository,
            AssessmentRepository assessmentRepository
    ) {
        this.rankCollegeTopperRepository = rankCollegeTopperRepository;
        this.rankYearTopperRepository = rankYearTopperRepository;
        this.rankDepartmentTopperRepository = rankDepartmentTopperRepository;
        this.rankDepartmentYearTopperRepository = rankDepartmentYearTopperRepository;
        this.rankClassTopperRepository = rankClassTopperRepository;
        this.studentOverallScoreRepository = studentOverallScoreRepository;
        this.studentRepository = studentRepository;
        this.codingPlatformRepository = codingPlatformRepository;
        this.platformPerformanceRepository = platformPerformanceRepository;
        this.platformAccountRepository = platformAccountRepository;
        this.assessmentRepository = assessmentRepository;
    }

    // =========================================================================
    // 1. Paginated View-Engine Methods (v_rank_* and v_student_overall_scores)
    // =========================================================================

    public Page<LeaderboardRowDto> getCollegeToppers(Pageable pageable) {
        return rankCollegeTopperRepository.findAll(pageable).map(this::mapRankRecordToRowDto);
    }

    public Page<LeaderboardRowDto> getCollegeToppers(String dept, Integer academicYear, String query, Pageable pageable) {
        return rankCollegeTopperRepository.findAll(
                RankSpecifications.filter(dept, academicYear, null, query),
                pageable
        ).map(this::mapRankRecordToRowDto);
    }

    public Page<LeaderboardRowDto> getYearToppers(Integer academicYear, Pageable pageable) {
        return rankYearTopperRepository.findByAcademicYear(academicYear, pageable)
                .map(this::mapRankRecordToRowDto);
    }

    public Page<LeaderboardRowDto> getYearToppers(Integer academicYear, String dept, String query, Pageable pageable) {
        return rankYearTopperRepository.findAll(
                RankSpecifications.filter(dept, academicYear, null, query),
                pageable
        ).map(this::mapRankRecordToRowDto);
    }

    public Page<LeaderboardRowDto> getDepartmentToppers(String department, Pageable pageable) {
        return rankDepartmentTopperRepository.findByDepartmentIgnoreCase(department, pageable)
                .map(this::mapRankRecordToRowDto);
    }

    public Page<LeaderboardRowDto> getDepartmentToppers(String department, Integer academicYear, String query, Pageable pageable) {
        return rankDepartmentTopperRepository.findAll(
                RankSpecifications.filter(department, academicYear, null, query),
                pageable
        ).map(this::mapRankRecordToRowDto);
    }

    public Page<LeaderboardRowDto> getDepartmentYearToppers(String department, Integer academicYear, Pageable pageable) {
        return getDepartmentYearToppers(department, academicYear, null, pageable);
    }

    public Page<LeaderboardRowDto> getDepartmentYearToppers(String department, Integer academicYear, String query, Pageable pageable) {
        return rankDepartmentYearTopperRepository.findAll(
                RankSpecifications.filter(department, academicYear, null, query),
                pageable
        ).map(this::mapRankRecordToRowDto);
    }

    public Page<LeaderboardRowDto> getClassToppers(String department, Integer academicYear, String section, Pageable pageable) {
        return rankClassTopperRepository.findByDepartmentIgnoreCaseAndAcademicYearAndSectionIgnoreCase(
                department, academicYear, section, pageable
        ).map(this::mapRankRecordToRowDto);
    }

    public Page<LeaderboardRowDto> getClassToppers(String department, Integer academicYear, String section, String query, Pageable pageable) {
        return rankClassTopperRepository.findAll(
                RankSpecifications.filter(department, academicYear, section, query),
                pageable
        ).map(this::mapRankRecordToRowDto);
    }

    public Page<LeaderboardRowDto> getOverallScores(Pageable pageable) {
        return studentOverallScoreRepository.findAll(pageable)
                .map(this::mapOverallScoreToRowDto);
    }

    // =========================================================================
    // 2. Podium (Top 3 Performers)
    // =========================================================================

    public List<LeaderboardRowDto> getPodium(String viewType, String dept, String batch) {
        Integer year = inferAcademicYearFromBatch(batch);
        Pageable top3 = PageRequest.of(0, 3, Sort.by("rank").ascending());

        if ("overall".equalsIgnoreCase(viewType) || "college".equalsIgnoreCase(viewType) || viewType == null) {
            if (dept != null && !"All".equalsIgnoreCase(dept) && year != null) {
                return rankDepartmentYearTopperRepository.findAll(
                        RankSpecifications.filter(dept, year, null, null), top3
                ).map(this::mapRankRecordToRowDto).getContent();
            } else if (dept != null && !"All".equalsIgnoreCase(dept)) {
                return rankDepartmentTopperRepository.findAll(
                        RankSpecifications.filter(dept, null, null, null), top3
                ).map(this::mapRankRecordToRowDto).getContent();
            } else if (year != null) {
                return rankYearTopperRepository.findAll(
                        RankSpecifications.filter(null, year, null, null), top3
                ).map(this::mapRankRecordToRowDto).getContent();
            } else {
                return rankCollegeTopperRepository.findAll(top3)
                        .map(this::mapRankRecordToRowDto).getContent();
            }
        }

        // Fallback for platform-specific podiums
        List<LeaderboardRowDto> full = getLeaderboard(viewType, dept, batch, "All", "", "rank");
        return full.stream().limit(3).collect(Collectors.toList());
    }

    // =========================================================================
    // 3. Multi-Tab Leaderboard Retrieval (Zero Hardcoded Java Math)
    // =========================================================================

    public List<LeaderboardRowDto> getLeaderboard(
            String viewType,
            String dept,
            String batch,
            String gender,
            String query,
            String sortBy
    ) {
        Integer academicYear = inferAcademicYearFromBatch(batch);

        // A. Overall Tab: Delegated directly to PostgreSQL dynamic ranking views
        if ("overall".equalsIgnoreCase(viewType)) {
            Pageable pageable = PageRequest.of(0, 500, Sort.by("rank").ascending());
            if (dept != null && !"All".equalsIgnoreCase(dept) && academicYear != null) {
                return rankDepartmentYearTopperRepository.findAll(
                        RankSpecifications.filter(dept, academicYear, null, query), pageable
                ).map(this::mapRankRecordToRowDto).getContent();
            } else if (dept != null && !"All".equalsIgnoreCase(dept)) {
                return rankDepartmentTopperRepository.findAll(
                        RankSpecifications.filter(dept, null, null, query), pageable
                ).map(this::mapRankRecordToRowDto).getContent();
            } else if (academicYear != null) {
                return rankYearTopperRepository.findAll(
                        RankSpecifications.filter(null, academicYear, null, query), pageable
                ).map(this::mapRankRecordToRowDto).getContent();
            } else {
                return rankCollegeTopperRepository.findAll(
                        RankSpecifications.filter(null, null, null, query), pageable
                ).map(this::mapRankRecordToRowDto).getContent();
            }
        }

        // B. Platform-Specific Tabs (LeetCode, PGP, Weekly)
        List<Student> students = studentRepository.findAll().stream()
                .filter(s -> (dept == null || "All".equalsIgnoreCase(dept) || dept.equalsIgnoreCase(s.getDepartment())))
                .filter(s -> (batch == null || "All".equalsIgnoreCase(batch) || batch.equalsIgnoreCase(s.getBatch())))
                .filter(s -> {
                    if (query == null || query.isBlank()) return true;
                    String q = query.trim().toLowerCase();
                    return (s.getName() != null && s.getName().toLowerCase().contains(q))
                            || (s.getRegisterNumber() != null && s.getRegisterNumber().toLowerCase().contains(q));
                })
                .collect(Collectors.toList());

        List<LeaderboardRowDto> rows = students.stream()
                .map(this::mapStudentToRowDto)
                .collect(Collectors.toList());

        // Sort based on requested platform metric
        Comparator<LeaderboardRowDto> comparator = getPlatformComparator(viewType, sortBy);
        rows.sort(comparator);

        // Assign ordinal rank for the filtered view
        for (int i = 0; i < rows.size(); i++) {
            rows.get(i).setRank(i + 1L);
        }

        return rows;
    }

    private Comparator<LeaderboardRowDto> getPlatformComparator(String viewType, String sortBy) {
        if ("leetcode".equalsIgnoreCase(viewType)) {
            if ("solved".equalsIgnoreCase(sortBy) || "lc_solved".equalsIgnoreCase(sortBy)) {
                return Comparator.comparing(LeaderboardRowDto::getLcSolvedTotal, Comparator.nullsLast(Comparator.reverseOrder()));
            }
            if ("rating".equalsIgnoreCase(sortBy) || "lc_rating".equalsIgnoreCase(sortBy)) {
                return Comparator.comparing(LeaderboardRowDto::getLcContestRating, Comparator.nullsLast(Comparator.reverseOrder()));
            }
            if ("contests".equalsIgnoreCase(sortBy) || "lc_contests".equalsIgnoreCase(sortBy)) {
                return Comparator.comparing(LeaderboardRowDto::getLcContestsAttended, Comparator.nullsLast(Comparator.reverseOrder()));
            }
            // Default: global rank ASC
            return Comparator.comparing(LeaderboardRowDto::getLcGlobalRank, Comparator.nullsLast(Comparator.naturalOrder()));
        }

        if ("pgp".equalsIgnoreCase(viewType)) {
            if ("solved".equalsIgnoreCase(sortBy) || "pgp_solved".equalsIgnoreCase(sortBy)) {
                return Comparator.comparing(LeaderboardRowDto::getPgpProgramsSolved, Comparator.nullsLast(Comparator.reverseOrder()));
            }
            if ("pgp_rank".equalsIgnoreCase(sortBy)) {
                return Comparator.comparing(LeaderboardRowDto::getPgpSkillrackRank, Comparator.nullsLast(Comparator.naturalOrder()));
            }
            // Default: points DESC
            return Comparator.comparing(LeaderboardRowDto::getPgpPoints, Comparator.nullsLast(Comparator.reverseOrder()));
        }

        if ("weekly".equalsIgnoreCase(viewType)) {
            if ("weekly_code".equalsIgnoreCase(sortBy)) {
                return Comparator.comparing(LeaderboardRowDto::getWeeklyCodeScore, Comparator.nullsLast(Comparator.reverseOrder()));
            }
            if ("weekly_rank".equalsIgnoreCase(sortBy)) {
                return Comparator.comparing(LeaderboardRowDto::getWeeklyRank, Comparator.nullsLast(Comparator.naturalOrder()));
            }
            return Comparator.comparing(LeaderboardRowDto::getWeeklyScore, Comparator.nullsLast(Comparator.reverseOrder()));
        }

        return Comparator.comparing(LeaderboardRowDto::getOverallScore, Comparator.nullsLast(Comparator.reverseOrder()));
    }

    // =========================================================================
    // 4. Clean Entity -> DTO Mappers
    // =========================================================================

    private LeaderboardRowDto mapRankRecordToRowDto(LeaderboardRankRecord record) {
        LeaderboardRowDto dto = new LeaderboardRowDto();
        dto.setId(record.getStudentId());
        dto.setRank(record.getRank());
        dto.setRollNo(record.getRegisterNumber());
        dto.setName(record.getName());
        dto.setDepartment(record.getDepartment());
        dto.setAcademicYear(record.getAcademicYear());
        dto.setBatch(inferBatchFromAcademicYear(record.getAcademicYear()));
        dto.setSection(record.getSection());

        // Strictly pre-calculated overall score from PostgreSQL view
        dto.setOverallScore(record.getOverallScore());
        dto.setCompositeScore(record.getOverallScore() != null ? record.getOverallScore().longValue() : 0L);
        dto.setCategory(record.getCategory());

        if (record instanceof RankClassTopper classTopper) {
            dto.setClassSize(classTopper.getClassSize());
            dto.setPercentile(classTopper.getPercentile());
        }

        attachStudentPlatformMetrics(dto, record.getStudentId());
        return dto;
    }

    private LeaderboardRowDto mapOverallScoreToRowDto(StudentOverallScore score) {
        LeaderboardRowDto dto = new LeaderboardRowDto();
        dto.setId(score.getStudentId());
        dto.setRollNo(score.getRegisterNumber());
        dto.setName(score.getName());
        dto.setDepartment(score.getDepartment());
        dto.setAcademicYear(score.getAcademicYear());
        dto.setBatch(inferBatchFromAcademicYear(score.getAcademicYear()));
        dto.setSection(score.getSection());
        dto.setOverallScore(score.getOverallScore());
        dto.setCompositeScore(score.getOverallScore() != null ? score.getOverallScore().longValue() : 0L);
        dto.setCategory(score.getCategory());

        attachStudentPlatformMetrics(dto, score.getStudentId());
        return dto;
    }

    private LeaderboardRowDto mapStudentToRowDto(Student s) {
        LeaderboardRowDto dto = new LeaderboardRowDto();
        dto.setId(s.getId());
        dto.setRollNo(s.getRegisterNumber());
        dto.setName(s.getName());
        dto.setDepartment(s.getDepartment());
        dto.setBatch(s.getBatch());
        dto.setSection(s.getSection());
        dto.setAcademicYear(s.getAcademicYear());

        // Fetch overall score from view if available
        studentOverallScoreRepository.findById(s.getId()).ifPresent(score -> {
            dto.setOverallScore(score.getOverallScore());
            dto.setCompositeScore(score.getOverallScore() != null ? score.getOverallScore().longValue() : 0L);
            dto.setCategory(score.getCategory());
        });

        attachStudentPlatformMetrics(dto, s.getId());
        return dto;
    }

    private void attachStudentPlatformMetrics(LeaderboardRowDto dto, Long studentId) {
        if (studentId == null) return;

        List<PlatformPerformance> perfList = platformPerformanceRepository.findByStudentId(studentId);
        for (PlatformPerformance perf : perfList) {
            if (perf.getCodingPlatform() == null) continue;
            String platform = perf.getCodingPlatform().getPlatformName();

            if ("LeetCode".equalsIgnoreCase(platform)) {
                dto.setLcSolvedTotal(perf.getProblemsSolved());
                dto.setLcContestRating(perf.getContestRating() != null ? perf.getContestRating() : perf.getRating());
                dto.setLcGlobalRank(perf.getGlobalRank());

                platformAccountRepository.findByStudentIdAndPlatformId(studentId, perf.getCodingPlatform().getId())
                        .ifPresent(acc -> dto.setLeetcodeId(acc.getPlatformUsername()));
            } else if ("SkillRack".equalsIgnoreCase(platform)) {
                dto.setPgpProgramsSolved(perf.getProblemsSolved());
                if (perf.getRating() != null) dto.setPgpPoints(perf.getRating().intValue());
                if (perf.getAssessmentScore() != null) dto.setPgpAptitudeScore(perf.getAssessmentScore().intValue());
                dto.setPgpSkillrackRank(perf.getGlobalRank());
            } else if ("Weekly".equalsIgnoreCase(platform) || "Weekly Assessment".equalsIgnoreCase(platform)) {
                if (perf.getRating() != null) dto.setWeeklyCodeScore(perf.getRating().intValue());
                if (perf.getAssessmentScore() != null) dto.setWeeklyScore(perf.getAssessmentScore().intValue());
                if (perf.getAssessmentRank() != null) dto.setWeeklyRank(perf.getAssessmentRank().intValue());
            }
        }

        // Decoupled Weekly Assessment lookup from assessments table
        assessmentRepository.findTopByStudentIdOrderByAssessmentDateDescIdDesc(studentId)
                .ifPresent(ass -> {
                    if (ass.getScore() != null) dto.setWeeklyScore(ass.getScore().intValue());
                    if (ass.getRating() != null) dto.setWeeklyCodeScore(ass.getRating().intValue());
                    if (ass.getRank() != null) dto.setWeeklyRank(ass.getRank().intValue());
                    dto.setWeeklyTestName(ass.getAssessmentName());
                });
    }

    // =========================================================================
    // 5. Utility Helpers
    // =========================================================================

    public static String inferBatchFromAcademicYear(Integer academicYear) {
        if (academicYear == null) return "2024-2028";
        return switch (academicYear) {
            case 1 -> "2026-2030";
            case 2 -> "2025-2029";
            case 3 -> "2024-2028";
            case 4 -> "2023-2027";
            default -> "2024-2028";
        };
    }

    public static Integer inferAcademicYearFromBatch(String batch) {
        if (batch == null || batch.isBlank() || "All".equalsIgnoreCase(batch)) return null;
        if (batch.contains("2023") || batch.contains("23-27")) return 4;
        if (batch.contains("2024") || batch.contains("24-28")) return 3;
        if (batch.contains("2025") || batch.contains("25-29")) return 2;
        if (batch.contains("2026") || batch.contains("26-30")) return 1;
        return null;
    }
}
