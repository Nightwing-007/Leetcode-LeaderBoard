package com.sece.leaderboard.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Comprehensive Student 360 Profile DTO.
 * Aggregates base profile, multi-level rankings (College, Year, Department, Class),
 * dynamic percentiles, and normalized performance across all registered coding platforms.
 */
public class StudentDetailDto {

    // 1. Base Information
    private Long id;
    private String name;
    private String registerNumber;
    private String rollNo; // backwards compatibility alias
    private String department;
    private Integer academicYear;
    private String section;
    private String batch;
    private String subBatch;
    private String gender;

    // 2. Ranking Information (Queried directly from PostgreSQL Views)
    private StudentRankingInfoDto rankings = new StudentRankingInfoDto();
    private Long collegeRank;
    private Long yearRank;
    private Long departmentRank;
    private Long classRank;
    private Long classSize;
    private BigDecimal percentile;
    private BigDecimal overallScore;
    private Integer rank;          // legacy alias for collegeRank
    private Long compositeScore;   // legacy alias for overallScore

    // 3. Platform Performance List & Map
    private List<PlatformPerformanceDetailDto> platformPerformance = new ArrayList<>();
    private Map<String, PlatformPerformanceDetailDto> platformMetrics = new HashMap<>();

    // 4. Backwards-Compatible Platform Fields (for existing frontend tables/modals)
    private String leetcodeUsername;
    private Long lcGlobalRank;
    private BigDecimal lcContestRating;
    private Integer lcContestsAttended;
    private String lcTopPercentage;
    private Integer lcSolvedTotal;
    private Integer lcSolvedEasy;
    private Integer lcSolvedMedium;
    private Integer lcSolvedHard;
    private LocalDateTime lcLastSyncedAt;

    private Integer pgpProgramsSolved;
    private Integer pgpCodeTests;
    private Integer pgpCodeTracks;
    private Integer pgpCodeTutor;
    private Integer pgpDc;
    private Integer pgpDt;
    private Integer pgpAptitudeScore;
    private Integer pgpPoints;
    private Long pgpSkillrackRank;

    // Weekly Assessment Fields
    private Integer weeklyScore;
    private Integer weeklyRank;
    private Integer weeklyCodeScore;
    private Integer weeklyMcqScore;
    private String weeklyTestName;

    public StudentDetailDto() {}

    // Base Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRegisterNumber() { return registerNumber; }
    public void setRegisterNumber(String registerNumber) {
        this.registerNumber = registerNumber;
        this.rollNo = registerNumber;
    }

    public String getRollNo() { return rollNo != null ? rollNo : registerNumber; }
    public void setRollNo(String rollNo) {
        this.rollNo = rollNo;
        if (this.registerNumber == null) this.registerNumber = rollNo;
    }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Integer getAcademicYear() { return academicYear; }
    public void setAcademicYear(Integer academicYear) { this.academicYear = academicYear; }

    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }

    public String getBatch() { return batch; }
    public void setBatch(String batch) { this.batch = batch; }

    public String getSubBatch() { return subBatch; }
    public void setSubBatch(String subBatch) { this.subBatch = subBatch; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    // Ranking Getters and Setters
    public StudentRankingInfoDto getRankings() { return rankings; }
    public void setRankings(StudentRankingInfoDto rankings) {
        this.rankings = rankings;
        if (rankings != null) {
            this.collegeRank = rankings.getCollegeRank();
            this.yearRank = rankings.getYearRank();
            this.departmentRank = rankings.getDepartmentRank();
            this.classRank = rankings.getClassRank();
            this.classSize = rankings.getClassSize();
            this.percentile = rankings.getPercentile();
            this.overallScore = rankings.getOverallScore();
            if (this.collegeRank != null) this.rank = this.collegeRank.intValue();
            if (this.overallScore != null) this.compositeScore = this.overallScore.longValue();
        }
    }

    public Long getCollegeRank() { return collegeRank; }
    public void setCollegeRank(Long collegeRank) {
        this.collegeRank = collegeRank;
        this.rank = collegeRank != null ? collegeRank.intValue() : null;
        if (this.rankings != null) this.rankings.setCollegeRank(collegeRank);
    }

    public Long getYearRank() { return yearRank; }
    public void setYearRank(Long yearRank) {
        this.yearRank = yearRank;
        if (this.rankings != null) this.rankings.setYearRank(yearRank);
    }

    public Long getDepartmentRank() { return departmentRank; }
    public void setDepartmentRank(Long departmentRank) {
        this.departmentRank = departmentRank;
        if (this.rankings != null) this.rankings.setDepartmentRank(departmentRank);
    }

    public Long getClassRank() { return classRank; }
    public void setClassRank(Long classRank) {
        this.classRank = classRank;
        if (this.rankings != null) this.rankings.setClassRank(classRank);
    }

    public Long getClassSize() { return classSize; }
    public void setClassSize(Long classSize) {
        this.classSize = classSize;
        if (this.rankings != null) this.rankings.setClassSize(classSize);
    }

    public BigDecimal getPercentile() { return percentile; }
    public void setPercentile(BigDecimal percentile) {
        this.percentile = percentile;
        if (this.rankings != null) this.rankings.setPercentile(percentile);
    }

    public BigDecimal getOverallScore() { return overallScore; }
    public void setOverallScore(BigDecimal overallScore) {
        this.overallScore = overallScore;
        this.compositeScore = overallScore != null ? overallScore.longValue() : 0L;
        if (this.rankings != null) this.rankings.setOverallScore(overallScore);
    }

    public Integer getRank() {
        if (rank != null) return rank;
        return collegeRank != null ? collegeRank.intValue() : null;
    }
    public void setRank(Integer rank) {
        this.rank = rank;
        if (this.collegeRank == null && rank != null) this.collegeRank = rank.longValue();
    }

    public Long getCompositeScore() {
        if (compositeScore != null) return compositeScore;
        return overallScore != null ? overallScore.longValue() : 0L;
    }
    public void setCompositeScore(Long compositeScore) { this.compositeScore = compositeScore; }

    // Platform Performance List & Map Getters and Setters
    public List<PlatformPerformanceDetailDto> getPlatformPerformance() { return platformPerformance; }
    public void setPlatformPerformance(List<PlatformPerformanceDetailDto> platformPerformance) {
        this.platformPerformance = platformPerformance != null ? platformPerformance : new ArrayList<>();
    }

    public Map<String, PlatformPerformanceDetailDto> getPlatformMetrics() { return platformMetrics; }
    public void setPlatformMetrics(Map<String, PlatformPerformanceDetailDto> platformMetrics) {
        this.platformMetrics = platformMetrics != null ? platformMetrics : new HashMap<>();
    }

    // Backwards compatibility Platform Getters & Setters
    public String getLeetcodeUsername() { return leetcodeUsername; }
    public void setLeetcodeUsername(String leetcodeUsername) { this.leetcodeUsername = leetcodeUsername; }

    public Long getLcGlobalRank() { return lcGlobalRank; }
    public void setLcGlobalRank(Long lcGlobalRank) { this.lcGlobalRank = lcGlobalRank; }

    public BigDecimal getLcContestRating() { return lcContestRating; }
    public void setLcContestRating(BigDecimal lcContestRating) { this.lcContestRating = lcContestRating; }

    public Integer getLcContestsAttended() { return lcContestsAttended; }
    public void setLcContestsAttended(Integer lcContestsAttended) { this.lcContestsAttended = lcContestsAttended; }

    public String getLcTopPercentage() { return lcTopPercentage; }
    public void setLcTopPercentage(String lcTopPercentage) { this.lcTopPercentage = lcTopPercentage; }

    public Integer getLcSolvedTotal() { return lcSolvedTotal; }
    public void setLcSolvedTotal(Integer lcSolvedTotal) { this.lcSolvedTotal = lcSolvedTotal; }

    public Integer getLcSolvedEasy() { return lcSolvedEasy; }
    public void setLcSolvedEasy(Integer lcSolvedEasy) { this.lcSolvedEasy = lcSolvedEasy; }

    public Integer getLcSolvedMedium() { return lcSolvedMedium; }
    public void setLcSolvedMedium(Integer lcSolvedMedium) { this.lcSolvedMedium = lcSolvedMedium; }

    public Integer getLcSolvedHard() { return lcSolvedHard; }
    public void setLcSolvedHard(Integer lcSolvedHard) { this.lcSolvedHard = lcSolvedHard; }

    public LocalDateTime getLcLastSyncedAt() { return lcLastSyncedAt; }
    public void setLcLastSyncedAt(LocalDateTime lcLastSyncedAt) { this.lcLastSyncedAt = lcLastSyncedAt; }

    public Integer getPgpProgramsSolved() { return pgpProgramsSolved; }
    public void setPgpProgramsSolved(Integer pgpProgramsSolved) { this.pgpProgramsSolved = pgpProgramsSolved; }

    public Integer getPgpCodeTests() { return pgpCodeTests; }
    public void setPgpCodeTests(Integer pgpCodeTests) { this.pgpCodeTests = pgpCodeTests; }

    public Integer getPgpCodeTracks() { return pgpCodeTracks; }
    public void setPgpCodeTracks(Integer pgpCodeTracks) { this.pgpCodeTracks = pgpCodeTracks; }

    public Integer getPgpCodeTutor() { return pgpCodeTutor; }
    public void setPgpCodeTutor(Integer pgpCodeTutor) { this.pgpCodeTutor = pgpCodeTutor; }

    public Integer getPgpDc() { return pgpDc; }
    public void setPgpDc(Integer pgpDc) { this.pgpDc = pgpDc; }

    public Integer getPgpDt() { return pgpDt; }
    public void setPgpDt(Integer pgpDt) { this.pgpDt = pgpDt; }

    public Integer getPgpAptitudeScore() { return pgpAptitudeScore; }
    public void setPgpAptitudeScore(Integer pgpAptitudeScore) { this.pgpAptitudeScore = pgpAptitudeScore; }

    public Integer getPgpPoints() { return pgpPoints; }
    public void setPgpPoints(Integer pgpPoints) { this.pgpPoints = pgpPoints; }

    public Long getPgpSkillrackRank() { return pgpSkillrackRank; }
    public void setPgpSkillrackRank(Long pgpSkillrackRank) { this.pgpSkillrackRank = pgpSkillrackRank; }

    public Integer getWeeklyScore() { return weeklyScore; }
    public void setWeeklyScore(Integer weeklyScore) { this.weeklyScore = weeklyScore; }

    public Integer getWeeklyRank() { return weeklyRank; }
    public void setWeeklyRank(Integer weeklyRank) { this.weeklyRank = weeklyRank; }

    public Integer getWeeklyCodeScore() { return weeklyCodeScore; }
    public void setWeeklyCodeScore(Integer weeklyCodeScore) { this.weeklyCodeScore = weeklyCodeScore; }

    public Integer getWeeklyMcqScore() { return weeklyMcqScore; }
    public void setWeeklyMcqScore(Integer weeklyMcqScore) { this.weeklyMcqScore = weeklyMcqScore; }

    public String getWeeklyTestName() { return weeklyTestName; }
    public void setWeeklyTestName(String weeklyTestName) { this.weeklyTestName = weeklyTestName; }
}
