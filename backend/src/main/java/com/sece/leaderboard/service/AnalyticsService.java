package com.sece.leaderboard.service;

import com.sece.leaderboard.dto.AnalyticsSummaryDto;
import com.sece.leaderboard.dto.DepartmentStatsDto;
import com.sece.leaderboard.entity.CodingPlatform;
import com.sece.leaderboard.entity.PlatformPerformance;
import com.sece.leaderboard.entity.RankCollegeTopper;
import com.sece.leaderboard.entity.Student;
import com.sece.leaderboard.entity.StudentOverallScore;
import com.sece.leaderboard.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for calculating dashboard statistics and institutional performance analytics
 * based exclusively on the V2 normalized schema and SQL ranking views.
 */
@Service
@Transactional(readOnly = true)
public class AnalyticsService {

    private final StudentRepository studentRepository;
    private final CodingPlatformRepository codingPlatformRepository;
    private final PlatformPerformanceRepository platformPerformanceRepository;
    private final StudentOverallScoreRepository studentOverallScoreRepository;
    private final RankCollegeTopperRepository rankCollegeTopperRepository;

    public AnalyticsService(
            StudentRepository studentRepository,
            CodingPlatformRepository codingPlatformRepository,
            PlatformPerformanceRepository platformPerformanceRepository,
            StudentOverallScoreRepository studentOverallScoreRepository,
            RankCollegeTopperRepository rankCollegeTopperRepository
    ) {
        this.studentRepository = studentRepository;
        this.codingPlatformRepository = codingPlatformRepository;
        this.platformPerformanceRepository = platformPerformanceRepository;
        this.studentOverallScoreRepository = studentOverallScoreRepository;
        this.rankCollegeTopperRepository = rankCollegeTopperRepository;
    }

    /**
     * Calculates institutional dashboard summary statistics using the normalized V2 schema.
     */
    public AnalyticsSummaryDto getSummary() {
        long totalStudents = studentRepository.count();
        List<String> distinctDepts = studentRepository.findDistinctDepartments();

        AnalyticsSummaryDto dto = new AnalyticsSummaryDto();
        dto.setTotalStudents(totalStudents);
        dto.setTotalCoders(totalStudents);
        dto.setActiveDepartmentsCount(distinctDepts.size());

        // 1. Active Coding Platforms
        List<CodingPlatform> activePlatforms = codingPlatformRepository.findByIsActiveTrue();
        dto.setActivePlatformsCount(activePlatforms.size());
        dto.setActivePlatforms(activePlatforms.stream().map(CodingPlatform::getPlatformName).collect(Collectors.toList()));

        // 2. Highest Overall Composite Score in College
        Page<RankCollegeTopper> topRankerPage = rankCollegeTopperRepository.findAll(
                PageRequest.of(0, 1, Sort.by("rank").ascending())
        );
        if (topRankerPage.hasContent()) {
            dto.setHighestOverallScore(topRankerPage.getContent().get(0).getOverallScore());
        }

        // 3. Department-wise Average Composite Scores
        List<StudentOverallScore> overallScores = studentOverallScoreRepository.findAll();
        Map<String, List<StudentOverallScore>> scoresByDept = overallScores.stream()
                .filter(s -> s.getDepartment() != null)
                .collect(Collectors.groupingBy(StudentOverallScore::getDepartment));

        Map<String, BigDecimal> deptAvgMap = new LinkedHashMap<>();
        for (Map.Entry<String, List<StudentOverallScore>> entry : scoresByDept.entrySet()) {
            List<StudentOverallScore> list = entry.getValue();
            if (list.isEmpty()) continue;
            double avg = list.stream()
                    .mapToDouble(s -> s.getOverallScore() != null ? s.getOverallScore().doubleValue() : 0.0)
                    .average()
                    .orElse(0.0);
            deptAvgMap.put(entry.getKey(), BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP));
        }
        dto.setDepartmentAverageScores(deptAvgMap);

        // 4. Platform-Specific Aggregations
        List<PlatformPerformance> allPerf = platformPerformanceRepository.findAll();
        long totalLeetCodeSolved = 0L;
        BigDecimal maxRating = BigDecimal.valueOf(1500.00);
        int maxPgpPoints = 0;
        long totalPgpPoints = 0;
        int pgpCount = 0;

        for (PlatformPerformance p : allPerf) {
            if (p.getCodingPlatform() == null) continue;
            String name = p.getCodingPlatform().getPlatformName();

            if ("LeetCode".equalsIgnoreCase(name)) {
                if (p.getProblemsSolved() != null) {
                    totalLeetCodeSolved += p.getProblemsSolved();
                }
                BigDecimal rating = p.getContestRating() != null ? p.getContestRating() : p.getRating();
                if (rating != null && rating.compareTo(maxRating) > 0) {
                    maxRating = rating;
                }
            } else if ("SkillRack".equalsIgnoreCase(name)) {
                if (p.getRating() != null) {
                    int points = p.getRating().intValue();
                    if (points > maxPgpPoints) maxPgpPoints = points;
                    totalPgpPoints += points;
                    pgpCount++;
                }
            }
        }

        dto.setTotalLeetCodeSolved(totalLeetCodeSolved);
        dto.setHighestContestRating(maxRating);
        dto.setTotalContestsAttended(0L);
        dto.setMaxPgpPoints(maxPgpPoints);
        dto.setAvgPgpPoints(pgpCount > 0 ? (double) totalPgpPoints / pgpCount : 0.0);

        return dto;
    }

    /**
     * Department performance comparisons with score distributions.
     */
    public List<DepartmentStatsDto> getDepartmentComparisons() {
        List<Student> allStudents = studentRepository.findAll();
        Map<String, List<Student>> byDept = allStudents.stream()
                .collect(Collectors.groupingBy(s -> s.getDepartment() != null ? s.getDepartment() : "Unknown"));

        List<PlatformPerformance> allPerf = platformPerformanceRepository.findAll();
        Map<Long, List<PlatformPerformance>> perfByStudentId = allPerf.stream()
                .collect(Collectors.groupingBy(p -> p.getStudent() != null ? p.getStudent().getId() : -1L));

        List<DepartmentStatsDto> result = new ArrayList<>();

        for (Map.Entry<String, List<Student>> entry : byDept.entrySet()) {
            String dept = entry.getKey();
            List<Student> students = entry.getValue();

            long totalStudents = students.size();
            long totalSolved = 0L;
            long deptTotalPoints = 0L;
            int topPoints = 0;
            int pgpCount = 0;

            Map<String, Integer> buckets = new LinkedHashMap<>();
            buckets.put("0 to 100", 0);
            buckets.put("101 to 200", 0);
            buckets.put("201 to 300", 0);
            buckets.put("301 to 400", 0);
            buckets.put("401 to 500", 0);
            buckets.put("501 to 1000", 0);
            buckets.put("1001 to 1500", 0);
            buckets.put("1501 to 2000", 0);
            buckets.put("2001 to 2500", 0);

            for (Student s : students) {
                List<PlatformPerformance> perfs = perfByStudentId.getOrDefault(s.getId(), Collections.emptyList());
                for (PlatformPerformance p : perfs) {
                    if (p.getCodingPlatform() == null) continue;
                    String platform = p.getCodingPlatform().getPlatformName();

                    if ("LeetCode".equalsIgnoreCase(platform) && p.getProblemsSolved() != null) {
                        totalSolved += p.getProblemsSolved();
                    } else if ("SkillRack".equalsIgnoreCase(platform) && p.getRating() != null) {
                        int points = p.getRating().intValue();
                        if (points > topPoints) topPoints = points;
                        deptTotalPoints += points;
                        pgpCount++;

                        if (points <= 100) buckets.merge("0 to 100", 1, Integer::sum);
                        else if (points <= 200) buckets.merge("101 to 200", 1, Integer::sum);
                        else if (points <= 300) buckets.merge("201 to 300", 1, Integer::sum);
                        else if (points <= 400) buckets.merge("301 to 400", 1, Integer::sum);
                        else if (points <= 500) buckets.merge("401 to 500", 1, Integer::sum);
                        else if (points <= 1000) buckets.merge("501 to 1000", 1, Integer::sum);
                        else if (points <= 1500) buckets.merge("1001 to 1500", 1, Integer::sum);
                        else if (points <= 2000) buckets.merge("1501 to 2000", 1, Integer::sum);
                        else buckets.merge("2001 to 2500", 1, Integer::sum);
                    }
                }
            }

            DepartmentStatsDto stats = new DepartmentStatsDto();
            stats.setDepartment(dept);
            stats.setTotalStudents(totalStudents);
            stats.setTotalSolved(totalSolved);
            stats.setAvgPoints(pgpCount > 0 ? (double) deptTotalPoints / pgpCount : 0.0);
            stats.setTopPoints(topPoints);
            stats.setScoreBuckets(buckets);
            result.add(stats);
        }

        result.sort(Comparator.comparing(DepartmentStatsDto::getDepartment));
        return result;
    }
}
