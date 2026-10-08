package com.sece.leaderboard.dto;

import java.math.BigDecimal;

public class LeaderboardRowDto {
    private Long id;
    private Long rank;
    private String rollNo;
    private String name;
    private String department;
    private String batch;
    private String section;
    private Integer academicYear;
    private String gender;

    // View-Engine Pre-calculated Scoring & Class Metrics
    private BigDecimal overallScore;
    private Long classSize;
    private BigDecimal percentile;

    // LeetCode Fields
    private String leetcodeId;
    private Long lcGlobalRank;
    private BigDecimal lcContestRating;
    private Integer lcContestsAttended;
    private String lcTopPercentage;
    private Integer lcSolvedTotal;
    private Integer lcSolvedEasy;
    private Integer lcSolvedMedium;
    private Integer lcSolvedHard;

    // PGP Fields
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

    // Composite Score (Backwards compatible alias for overallScore)
    private Long compositeScore;

    public LeaderboardRowDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getRank() { return rank; }
    public void setRank(Long rank) { this.rank = rank; }
    public void setRank(Integer rank) { this.rank = rank != null ? rank.longValue() : null; }

    public String getRollNo() { return rollNo; }
    public void setRollNo(String rollNo) { this.rollNo = rollNo; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getBatch() { return batch; }
    public void setBatch(String batch) { this.batch = batch; }

    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }

    public Integer getAcademicYear() { return academicYear; }
    public void setAcademicYear(Integer academicYear) { this.academicYear = academicYear; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public BigDecimal getOverallScore() { return overallScore; }
    public void setOverallScore(BigDecimal overallScore) {
        this.overallScore = overallScore;
        if (overallScore != null && this.compositeScore == null) {
            this.compositeScore = overallScore.longValue();
        }
    }

    public Long getClassSize() { return classSize; }
    public void setClassSize(Long classSize) { this.classSize = classSize; }

    public BigDecimal getPercentile() { return percentile; }
    public void setPercentile(BigDecimal percentile) { this.percentile = percentile; }

    public String getLeetcodeId() { return leetcodeId; }
    public void setLeetcodeId(String leetcodeId) { this.leetcodeId = leetcodeId; }

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

    public Long getCompositeScore() {
        if (compositeScore != null) return compositeScore;
        if (overallScore != null) return overallScore.longValue();
        return 0L;
    }

    public void setCompositeScore(Long compositeScore) {
        this.compositeScore = compositeScore;
    }
}
