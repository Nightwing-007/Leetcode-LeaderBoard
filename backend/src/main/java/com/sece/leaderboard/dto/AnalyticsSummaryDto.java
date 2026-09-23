package com.sece.leaderboard.dto;

import java.math.BigDecimal;

public class AnalyticsSummaryDto {
    private Long totalCoders = 0L;
    private Long totalLeetCodeSolved = 0L;
    private BigDecimal highestContestRating = BigDecimal.valueOf(1500.00);
    private Long totalContestsAttended = 0L;
    private Integer activeDepartmentsCount = 0;
    private Integer maxPgpPoints = 0;
    private Double avgPgpPoints = 0.0;

    public AnalyticsSummaryDto() {}

    public Long getTotalCoders() { return totalCoders; }
    public void setTotalCoders(Long totalCoders) { this.totalCoders = totalCoders; }

    public Long getTotalLeetCodeSolved() { return totalLeetCodeSolved; }
    public void setTotalLeetCodeSolved(Long totalLeetCodeSolved) { this.totalLeetCodeSolved = totalLeetCodeSolved; }

    public BigDecimal getHighestContestRating() { return highestContestRating; }
    public void setHighestContestRating(BigDecimal highestContestRating) { this.highestContestRating = highestContestRating; }

    public Long getTotalContestsAttended() { return totalContestsAttended; }
    public void setTotalContestsAttended(Long totalContestsAttended) { this.totalContestsAttended = totalContestsAttended; }

    public Integer getActiveDepartmentsCount() { return activeDepartmentsCount; }
    public void setActiveDepartmentsCount(Integer activeDepartmentsCount) { this.activeDepartmentsCount = activeDepartmentsCount; }

    public Integer getMaxPgpPoints() { return maxPgpPoints; }
    public void setMaxPgpPoints(Integer maxPgpPoints) { this.maxPgpPoints = maxPgpPoints; }

    public Double getAvgPgpPoints() { return avgPgpPoints; }
    public void setAvgPgpPoints(Double avgPgpPoints) { this.avgPgpPoints = avgPgpPoints; }
}
