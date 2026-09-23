package com.sece.leaderboard.service;

import com.sece.leaderboard.dto.AnalyticsSummaryDto;
import com.sece.leaderboard.dto.DepartmentStatsDto;
import com.sece.leaderboard.entity.Student;
import com.sece.leaderboard.repository.LeetCodeProfileRepository;
import com.sece.leaderboard.repository.PgpScoreRepository;
import com.sece.leaderboard.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final StudentRepository studentRepository;
    private final LeetCodeProfileRepository leetCodeProfileRepository;
    private final PgpScoreRepository pgpScoreRepository;

    public AnalyticsService(StudentRepository studentRepository,
                            LeetCodeProfileRepository leetCodeProfileRepository,
                            PgpScoreRepository pgpScoreRepository) {
        this.studentRepository = studentRepository;
        this.leetCodeProfileRepository = leetCodeProfileRepository;
        this.pgpScoreRepository = pgpScoreRepository;
    }

    public AnalyticsSummaryDto getSummary() {
        long totalStudents = studentRepository.count();
        Long totalSolved = leetCodeProfileRepository.findTotalSolvedCount();
        BigDecimal maxRating = leetCodeProfileRepository.findMaxContestRating();
        Long totalContests = leetCodeProfileRepository.findTotalContestsAttended();
        int depts = studentRepository.findDistinctDepartments().size();
        Integer maxPoints = pgpScoreRepository.findMaxPoints();
        Double avgPoints = pgpScoreRepository.findAveragePoints();

        AnalyticsSummaryDto dto = new AnalyticsSummaryDto();
        dto.setTotalCoders(totalStudents);
        dto.setTotalLeetCodeSolved(totalSolved != null ? totalSolved : 0L);
        dto.setHighestContestRating(maxRating != null ? maxRating : BigDecimal.valueOf(1500.00));
        dto.setTotalContestsAttended(totalContests != null ? totalContests : 0L);
        dto.setActiveDepartmentsCount(depts);
        dto.setMaxPgpPoints(maxPoints != null ? maxPoints : 0);
        dto.setAvgPgpPoints(avgPoints != null ? Math.round(avgPoints * 100.0) / 100.0 : 0.0);
        return dto;
    }

    public List<DepartmentStatsDto> getDepartmentComparisons() {
        List<Student> allStudents = studentRepository.findAll();
        Map<String, List<Student>> byDept = allStudents.stream()
                .collect(Collectors.groupingBy(Student::getDepartmentCode));

        List<DepartmentStatsDto> result = new ArrayList<>();

        for (Map.Entry<String, List<Student>> entry : byDept.entrySet()) {
            String dept = entry.getKey();
            List<Student> students = entry.getValue();

            long totalStudents = students.size();
            long totalSolved = 0;
            long totalPoints = 0;
            int maxPoints = 0;

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
                if (s.getLeetCodeProfile() != null && s.getLeetCodeProfile().getSolvedTotal() != null) {
                    totalSolved += s.getLeetCodeProfile().getSolvedTotal();
                }
                if (s.getPgpScore() != null && s.getPgpScore().getTotalPoints() != null) {
                    int p = s.getPgpScore().getTotalPoints();
                    totalPoints += p;
                    if (p > maxPoints) maxPoints = p;

                    if (p <= 100) buckets.put("0 to 100", buckets.get("0 to 100") + 1);
                    else if (p <= 200) buckets.put("101 to 200", buckets.get("101 to 200") + 1);
                    else if (p <= 300) buckets.put("201 to 300", buckets.get("201 to 300") + 1);
                    else if (p <= 400) buckets.put("301 to 400", buckets.get("301 to 400") + 1);
                    else if (p <= 500) buckets.put("401 to 500", buckets.get("401 to 500") + 1);
                    else if (p <= 1000) buckets.put("501 to 1000", buckets.get("501 to 1000") + 1);
                    else if (p <= 1500) buckets.put("1001 to 1500", buckets.get("1001 to 1500") + 1);
                    else if (p <= 2000) buckets.put("1501 to 2000", buckets.get("1501 to 2000") + 1);
                    else buckets.put("2001 to 2500", buckets.get("2001 to 2500") + 1);
                }
            }

            double avg = totalStudents > 0 ? (double) totalPoints / totalStudents : 0.0;

            DepartmentStatsDto stats = new DepartmentStatsDto();
            stats.setDepartment(dept);
            stats.setTotalStudents(totalStudents);
            stats.setTotalSolved(totalSolved);
            stats.setAvgPoints(Math.round(avg * 10.0) / 10.0);
            stats.setTopPoints(maxPoints);
            stats.setScoreBuckets(buckets);
            result.add(stats);
        }

        result.sort(Comparator.comparing(DepartmentStatsDto::getDepartment));
        return result;
    }
}
