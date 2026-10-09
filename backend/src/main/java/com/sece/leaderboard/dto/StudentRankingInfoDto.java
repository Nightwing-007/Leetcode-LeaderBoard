package com.sece.leaderboard.dto;

import java.math.BigDecimal;

/**
 * Encapsulates dynamic ranking information queried from PostgreSQL window function views.
 */
public class StudentRankingInfoDto {
    private Long collegeRank;
    private Long yearRank;
    private Long departmentRank;
    private Long classRank;
    private Long classSize;
    private BigDecimal percentile;
    private BigDecimal overallScore;
    private String category;

    public StudentRankingInfoDto() {}

    public StudentRankingInfoDto(Long collegeRank, Long yearRank, Long departmentRank, Long classRank, Long classSize, BigDecimal percentile, BigDecimal overallScore) {
        this(collegeRank, yearRank, departmentRank, classRank, classSize, percentile, overallScore, null);
    }

    public StudentRankingInfoDto(Long collegeRank, Long yearRank, Long departmentRank, Long classRank, Long classSize, BigDecimal percentile, BigDecimal overallScore, String category) {
        this.collegeRank = collegeRank;
        this.yearRank = yearRank;
        this.departmentRank = departmentRank;
        this.classRank = classRank;
        this.classSize = classSize;
        this.percentile = percentile;
        this.overallScore = overallScore;
        this.category = category;
    }

    public Long getCollegeRank() {
        return collegeRank;
    }

    public void setCollegeRank(Long collegeRank) {
        this.collegeRank = collegeRank;
    }

    public Long getYearRank() {
        return yearRank;
    }

    public void setYearRank(Long yearRank) {
        this.yearRank = yearRank;
    }

    public Long getDepartmentRank() {
        return departmentRank;
    }

    public void setDepartmentRank(Long departmentRank) {
        this.departmentRank = departmentRank;
    }

    public Long getClassRank() {
        return classRank;
    }

    public void setClassRank(Long classRank) {
        this.classRank = classRank;
    }

    public Long getClassSize() {
        return classSize;
    }

    public void setClassSize(Long classSize) {
        this.classSize = classSize;
    }

    public BigDecimal getPercentile() {
        return percentile;
    }

    public void setPercentile(BigDecimal percentile) {
        this.percentile = percentile;
    }

    public BigDecimal getOverallScore() {
        return overallScore;
    }

    public void setOverallScore(BigDecimal overallScore) {
        this.overallScore = overallScore;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}
