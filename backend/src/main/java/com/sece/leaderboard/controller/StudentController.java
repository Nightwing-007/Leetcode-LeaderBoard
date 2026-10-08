package com.sece.leaderboard.controller;

import com.sece.leaderboard.dto.PlatformPerformanceDetailDto;
import com.sece.leaderboard.dto.StudentDetailDto;
import com.sece.leaderboard.dto.StudentRankingInfoDto;
import com.sece.leaderboard.entity.Assessment;
import com.sece.leaderboard.entity.PlatformAccount;
import com.sece.leaderboard.entity.PlatformPerformance;
import com.sece.leaderboard.entity.Student;
import com.sece.leaderboard.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * REST controller for Student 360 Profiles.
 * Aggregates institutional ranks (College, Year, Department, Class), dynamic percentiles,
 * and isolated performance across every registered coding platform.
 */
@RestController
@RequestMapping("/api/v1/students")
public class StudentController {

    private final StudentRepository studentRepository;
    private final RankCollegeTopperRepository rankCollegeTopperRepository;
    private final RankYearTopperRepository rankYearTopperRepository;
    private final RankDepartmentTopperRepository rankDepartmentTopperRepository;
    private final RankClassTopperRepository rankClassTopperRepository;
    private final PlatformPerformanceRepository platformPerformanceRepository;
    private final PlatformAccountRepository platformAccountRepository;
    private final AssessmentRepository assessmentRepository;

    public StudentController(
            StudentRepository studentRepository,
            RankCollegeTopperRepository rankCollegeTopperRepository,
            RankYearTopperRepository rankYearTopperRepository,
            RankDepartmentTopperRepository rankDepartmentTopperRepository,
            RankClassTopperRepository rankClassTopperRepository,
            PlatformPerformanceRepository platformPerformanceRepository,
            PlatformAccountRepository platformAccountRepository,
            AssessmentRepository assessmentRepository
    ) {
        this.studentRepository = studentRepository;
        this.rankCollegeTopperRepository = rankCollegeTopperRepository;
        this.rankYearTopperRepository = rankYearTopperRepository;
        this.rankDepartmentTopperRepository = rankDepartmentTopperRepository;
        this.rankClassTopperRepository = rankClassTopperRepository;
        this.platformPerformanceRepository = platformPerformanceRepository;
        this.platformAccountRepository = platformAccountRepository;
        this.assessmentRepository = assessmentRepository;
    }

    /**
     * Comprehensive Student 360 Profile endpoint.
     * Accessible by register number or roll number.
     */
    @GetMapping("/{registerNumber}")
    public ResponseEntity<StudentDetailDto> getStudentByRegisterNumber(@PathVariable String registerNumber) {
        Student s = studentRepository.findByRegisterNumberIgnoreCase(registerNumber.trim())
                .orElseThrow(() -> new IllegalArgumentException("Student not found with register number: " + registerNumber));

        StudentDetailDto dto = new StudentDetailDto();

        // 1. Base Information
        dto.setId(s.getId());
        dto.setName(s.getName());
        dto.setRegisterNumber(s.getRegisterNumber());
        dto.setRollNo(s.getRegisterNumber());
        dto.setDepartment(s.getDepartment());
        dto.setAcademicYear(s.getAcademicYear());
        dto.setSection(s.getSection());
        dto.setBatch(s.getBatch());

        // 2. Multi-level Rankings from PostgreSQL Read-Only Views
        StudentRankingInfoDto rankings = new StudentRankingInfoDto();

        rankCollegeTopperRepository.findById(s.getId()).ifPresent(topper -> {
            rankings.setCollegeRank(topper.getRank());
            rankings.setOverallScore(topper.getOverallScore());
            dto.setCollegeRank(topper.getRank());
            dto.setOverallScore(topper.getOverallScore());
        });

        rankYearTopperRepository.findById(s.getId()).ifPresent(yearTopper -> {
            rankings.setYearRank(yearTopper.getRank());
            dto.setYearRank(yearTopper.getRank());
        });

        rankDepartmentTopperRepository.findById(s.getId()).ifPresent(deptTopper -> {
            rankings.setDepartmentRank(deptTopper.getRank());
            dto.setDepartmentRank(deptTopper.getRank());
        });

        rankClassTopperRepository.findById(s.getId()).ifPresent(classTopper -> {
            rankings.setClassRank(classTopper.getClassRank());
            rankings.setClassSize(classTopper.getClassSize());
            rankings.setPercentile(classTopper.getPercentile());

            dto.setClassRank(classTopper.getClassRank());
            dto.setClassSize(classTopper.getClassSize());
            dto.setPercentile(classTopper.getPercentile());
        });

        dto.setRankings(rankings);

        // 3. Platform Performance across All Coding Platforms
        List<PlatformPerformance> perfList = platformPerformanceRepository.findByStudentId(s.getId());
        List<PlatformAccount> accountList = platformAccountRepository.findByStudentId(s.getId());

        Map<Integer, String> accountUsernameMap = new HashMap<>();
        for (PlatformAccount acc : accountList) {
            if (acc.getCodingPlatform() != null) {
                accountUsernameMap.put(acc.getCodingPlatform().getId(), acc.getPlatformUsername());
            }
        }

        for (PlatformPerformance perf : perfList) {
            if (perf.getCodingPlatform() == null) continue;
            Integer platformId = perf.getCodingPlatform().getId();
            String platformName = perf.getCodingPlatform().getPlatformName();
            String username = accountUsernameMap.get(platformId);

            PlatformPerformanceDetailDto detailDto = new PlatformPerformanceDetailDto(
                    platformId,
                    platformName,
                    username,
                    perf.getProblemsSolved(),
                    perf.getRating(),
                    perf.getAssessmentScore(),
                    perf.getGlobalRank(),
                    perf.getAssessmentRank(),
                    perf.getContestRating(),
                    perf.getUpdatedAt()
            );

            dto.getPlatformPerformance().add(detailDto);
            dto.getPlatformMetrics().put(platformName.toLowerCase(), detailDto);

            // Populate legacy flat fields
            if ("LeetCode".equalsIgnoreCase(platformName)) {
                dto.setLeetcodeUsername(username);
                dto.setLcSolvedTotal(perf.getProblemsSolved());
                dto.setLcContestRating(perf.getContestRating() != null ? perf.getContestRating() : perf.getRating());
                dto.setLcGlobalRank(perf.getGlobalRank());
            } else if ("SkillRack".equalsIgnoreCase(platformName)) {
                dto.setPgpProgramsSolved(perf.getProblemsSolved());
                if (perf.getRating() != null) dto.setPgpPoints(perf.getRating().intValue());
                if (perf.getAssessmentScore() != null) dto.setPgpAptitudeScore(perf.getAssessmentScore().intValue());
                dto.setPgpSkillrackRank(perf.getGlobalRank());
            }
        }

        // 4. Latest Weekly Assessment Details
        Optional<Assessment> latestAssessmentOpt = assessmentRepository.findTopByStudentIdOrderByAssessmentDateDescIdDesc(s.getId());
        latestAssessmentOpt.ifPresent(assessment -> {
            if (assessment.getScore() != null) dto.setWeeklyScore(assessment.getScore().intValue());
            if (assessment.getRating() != null) dto.setWeeklyCodeScore(assessment.getRating().intValue());
            if (assessment.getRank() != null) dto.setWeeklyRank(assessment.getRank().intValue());
            dto.setWeeklyTestName(assessment.getAssessmentName());
        });

        return ResponseEntity.ok(dto);
    }
}
