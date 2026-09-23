package com.sece.leaderboard.dto;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public class StudentSaveRequest {
    private Long id;

    @NotBlank(message = "Roll No is required")
    private String rollNo;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Department is required")
    private String department;

    private String batch = "2024-2028";
    private String section;
    private String subBatch;
    private String gender = "Male";

    // LeetCode
    private String leetcodeId;
    private BigDecimal contestRating;
    private Integer contestAttended;
    private Long globalRank;
    private String topPercentage;
    private Integer solvedTotal;
    private Integer solvedEasy;
    private Integer solvedMedium;
    private Integer solvedHard;

    // PGP
    private Integer programsSolved;
    private Integer codeTests;
    private Integer codeTracks;
    private Integer codeTutor;
    private Integer dc;
    private Integer dt;
    private Integer aptitudeScore;
    private Integer points;
    private Long skillrackRank;

    public StudentSaveRequest() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public String getSubBatch() { return subBatch; }
    public void setSubBatch(String subBatch) { this.subBatch = subBatch; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getLeetcodeId() { return leetcodeId; }
    public void setLeetcodeId(String leetcodeId) { this.leetcodeId = leetcodeId; }

    public BigDecimal getContestRating() { return contestRating; }
    public void setContestRating(BigDecimal contestRating) { this.contestRating = contestRating; }

    public Integer getContestAttended() { return contestAttended; }
    public void setContestAttended(Integer contestAttended) { this.contestAttended = contestAttended; }

    public Long getGlobalRank() { return globalRank; }
    public void setGlobalRank(Long globalRank) { this.globalRank = globalRank; }

    public String getTopPercentage() { return topPercentage; }
    public void setTopPercentage(String topPercentage) { this.topPercentage = topPercentage; }

    public Integer getSolvedTotal() { return solvedTotal; }
    public void setSolvedTotal(Integer solvedTotal) { this.solvedTotal = solvedTotal; }

    public Integer getSolvedEasy() { return solvedEasy; }
    public void setSolvedEasy(Integer solvedEasy) { this.solvedEasy = solvedEasy; }

    public Integer getSolvedMedium() { return solvedMedium; }
    public void setSolvedMedium(Integer solvedMedium) { this.solvedMedium = solvedMedium; }

    public Integer getSolvedHard() { return solvedHard; }
    public void setSolvedHard(Integer solvedHard) { this.solvedHard = solvedHard; }

    public Integer getProgramsSolved() { return programsSolved; }
    public void setProgramsSolved(Integer programsSolved) { this.programsSolved = programsSolved; }

    public Integer getCodeTests() { return codeTests; }
    public void setCodeTests(Integer codeTests) { this.codeTests = codeTests; }

    public Integer getCodeTracks() { return codeTracks; }
    public void setCodeTracks(Integer codeTracks) { this.codeTracks = codeTracks; }

    public Integer getCodeTutor() { return codeTutor; }
    public void setCodeTutor(Integer codeTutor) { this.codeTutor = codeTutor; }

    public Integer getDc() { return dc; }
    public void setDc(Integer dc) { this.dc = dc; }

    public Integer getDt() { return dt; }
    public void setDt(Integer dt) { this.dt = dt; }

    public Integer getAptitudeScore() { return aptitudeScore; }
    public void setAptitudeScore(Integer aptitudeScore) { this.aptitudeScore = aptitudeScore; }

    public Integer getPoints() { return points; }
    public void setPoints(Integer points) { this.points = points; }

    public Long getSkillrackRank() { return skillrackRank; }
    public void setSkillrackRank(Long skillrackRank) { this.skillrackRank = skillrackRank; }
}
