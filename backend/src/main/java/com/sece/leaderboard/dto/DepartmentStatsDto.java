package com.sece.leaderboard.dto;

import java.util.LinkedHashMap;
import java.util.Map;

public class DepartmentStatsDto {
    private String department;
    private Long totalStudents = 0L;
    private Long totalSolved = 0L;
    private Double avgPoints = 0.0;
    private Integer topPoints = 0;
    private Map<String, Integer> scoreBuckets = new LinkedHashMap<>();

    public DepartmentStatsDto() {}

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Long getTotalStudents() { return totalStudents; }
    public void setTotalStudents(Long totalStudents) { this.totalStudents = totalStudents; }

    public Long getTotalSolved() { return totalSolved; }
    public void setTotalSolved(Long totalSolved) { this.totalSolved = totalSolved; }

    public Double getAvgPoints() { return avgPoints; }
    public void setAvgPoints(Double avgPoints) { this.avgPoints = avgPoints; }

    public Integer getTopPoints() { return topPoints; }
    public void setTopPoints(Integer topPoints) { this.topPoints = topPoints; }

    public Map<String, Integer> getScoreBuckets() { return scoreBuckets; }
    public void setScoreBuckets(Map<String, Integer> scoreBuckets) { this.scoreBuckets = scoreBuckets; }
}
