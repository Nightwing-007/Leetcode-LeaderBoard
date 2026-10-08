package com.sece.leaderboard.dto;

import java.math.BigDecimal;
import java.time.ZonedDateTime;

/**
 * Detailed metrics for a student on a specific platform (LeetCode, SkillRack, AtCoder, Codeforces, Degre.AI).
 */
public class PlatformPerformanceDetailDto {
    private Integer platformId;
    private String platformName;
    private String platformUsername;
    private Integer problemsSolved;
    private BigDecimal rating;
    private BigDecimal assessmentScore;
    private Long globalRank;
    private Long assessmentRank;
    private BigDecimal contestRating;
    private ZonedDateTime updatedAt;

    public PlatformPerformanceDetailDto() {}

    public PlatformPerformanceDetailDto(Integer platformId, String platformName, String platformUsername,
                                        Integer problemsSolved, BigDecimal rating, BigDecimal assessmentScore,
                                        Long globalRank, Long assessmentRank, BigDecimal contestRating, ZonedDateTime updatedAt) {
        this.platformId = platformId;
        this.platformName = platformName;
        this.platformUsername = platformUsername;
        this.problemsSolved = problemsSolved;
        this.rating = rating;
        this.assessmentScore = assessmentScore;
        this.globalRank = globalRank;
        this.assessmentRank = assessmentRank;
        this.contestRating = contestRating;
        this.updatedAt = updatedAt;
    }

    public Integer getPlatformId() {
        return platformId;
    }

    public void setPlatformId(Integer platformId) {
        this.platformId = platformId;
    }

    public String getPlatformName() {
        return platformName;
    }

    public void setPlatformName(String platformName) {
        this.platformName = platformName;
    }

    public String getPlatformUsername() {
        return platformUsername;
    }

    public void setPlatformUsername(String platformUsername) {
        this.platformUsername = platformUsername;
    }

    public Integer getProblemsSolved() {
        return problemsSolved;
    }

    public void setProblemsSolved(Integer problemsSolved) {
        this.problemsSolved = problemsSolved;
    }

    public BigDecimal getRating() {
        return rating;
    }

    public void setRating(BigDecimal rating) {
        this.rating = rating;
    }

    public BigDecimal getAssessmentScore() {
        return assessmentScore;
    }

    public void setAssessmentScore(BigDecimal assessmentScore) {
        this.assessmentScore = assessmentScore;
    }

    public Long getGlobalRank() {
        return globalRank;
    }

    public void setGlobalRank(Long globalRank) {
        this.globalRank = globalRank;
    }

    public Long getAssessmentRank() {
        return assessmentRank;
    }

    public void setAssessmentRank(Long assessmentRank) {
        this.assessmentRank = assessmentRank;
    }

    public BigDecimal getContestRating() {
        return contestRating;
    }

    public void setContestRating(BigDecimal contestRating) {
        this.contestRating = contestRating;
    }

    public ZonedDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(ZonedDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
