package com.sece.leaderboard.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Dashboard Statistics and Institutional Analytics Summary DTO.
 * Calculated strictly from V2 normalized tables and ranking views.
 */
public class AnalyticsSummaryDto {

    // V2 High-Level Institutional Metrics
    private Long totalStudents = 0L;
    private Integer activePlatformsCount = 0;
    private List<String> activePlatforms = new ArrayList<>();
    private BigDecimal highestOverallScore = BigDecimal.ZERO;
    private Map<String, BigDecimal> departmentAverageScores = new LinkedHashMap<>();

    // Backwards-Compatible Frontend Fields
    private Long totalCoders = 0L;
    private Long totalLeetCodeSolved = 0L;
    private BigDecimal highestContestRating = BigDecimal.valueOf(1500.00);
    private Long totalContestsAttended = 0L;
    private Integer activeDepartmentsCount = 0;
    private Integer maxPgpPoints = 0;
    private Double avgPgpPoints = 0.0;

    public AnalyticsSummaryDto() {}

    public Long getTotalStudents() {
        return totalStudents != null && totalStudents > 0 ? totalStudents : totalCoders;
    }

    public void setTotalStudents(Long totalStudents) {
        this.totalStudents = totalStudents;
        this.totalCoders = totalStudents;
    }

    public Integer getActivePlatformsCount() {
        return activePlatformsCount;
    }

    public void setActivePlatformsCount(Integer activePlatformsCount) {
        this.activePlatformsCount = activePlatformsCount;
    }

    public List<String> getActivePlatforms() {
        return activePlatforms;
    }

    public void setActivePlatforms(List<String> activePlatforms) {
        this.activePlatforms = activePlatforms != null ? activePlatforms : new ArrayList<>();
    }

    public BigDecimal getHighestOverallScore() {
        return highestOverallScore;
    }

    public void setHighestOverallScore(BigDecimal highestOverallScore) {
        this.highestOverallScore = highestOverallScore;
    }

    public Map<String, BigDecimal> getDepartmentAverageScores() {
        return departmentAverageScores;
    }

    public void setDepartmentAverageScores(Map<String, BigDecimal> departmentAverageScores) {
        this.departmentAverageScores = departmentAverageScores != null ? departmentAverageScores : new LinkedHashMap<>();
    }

    public Long getTotalCoders() {
        return totalCoders;
    }

    public void setTotalCoders(Long totalCoders) {
        this.totalCoders = totalCoders;
        if (this.totalStudents == null || this.totalStudents == 0) this.totalStudents = totalCoders;
    }

    public Long getTotalLeetCodeSolved() {
        return totalLeetCodeSolved;
    }

    public void setTotalLeetCodeSolved(Long totalLeetCodeSolved) {
        this.totalLeetCodeSolved = totalLeetCodeSolved;
    }

    public BigDecimal getHighestContestRating() {
        return highestContestRating;
    }

    public void setHighestContestRating(BigDecimal highestContestRating) {
        this.highestContestRating = highestContestRating;
    }

    public Long getTotalContestsAttended() {
        return totalContestsAttended;
    }

    public void setTotalContestsAttended(Long totalContestsAttended) {
        this.totalContestsAttended = totalContestsAttended;
    }

    public Integer getActiveDepartmentsCount() {
        return activeDepartmentsCount;
    }

    public void setActiveDepartmentsCount(Integer activeDepartmentsCount) {
        this.activeDepartmentsCount = activeDepartmentsCount;
    }

    public Integer getMaxPgpPoints() {
        return maxPgpPoints;
    }

    public void setMaxPgpPoints(Integer maxPgpPoints) {
        this.maxPgpPoints = maxPgpPoints;
    }

    public Double getAvgPgpPoints() {
        return avgPgpPoints;
    }

    public void setAvgPgpPoints(Double avgPgpPoints) {
        this.avgPgpPoints = avgPgpPoints;
    }
}
