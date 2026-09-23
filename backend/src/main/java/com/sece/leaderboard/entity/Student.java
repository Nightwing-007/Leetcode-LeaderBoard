package com.sece.leaderboard.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "students", indexes = {
        @Index(name = "idx_students_roll_no", columnList = "roll_no"),
        @Index(name = "idx_students_dept", columnList = "department_code"),
        @Index(name = "idx_students_batch", columnList = "batch_year")
})
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "roll_no", unique = true, nullable = false, length = 50)
    private String rollNo;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "department_code", nullable = false, length = 20)
    private String departmentCode;

    @Column(name = "batch_year", nullable = false, length = 20)
    private String batchYear;

    @Column(length = 20)
    private String section;

    @Column(name = "sub_batch", length = 30)
    private String subBatch;

    @Column(length = 10)
    private String gender = "Male";

    @Column(name = "weekly_score")
    private Integer weeklyScore;

    @Column(name = "weekly_rank")
    private Integer weeklyRank;

    @Column(name = "weekly_code_score")
    private Integer weeklyCodeScore;

    @Column(name = "weekly_mcq_score")
    private Integer weeklyMcqScore;

    @Column(name = "weekly_test_name", length = 150)
    private String weeklyTestName;

    @OneToOne(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private LeetCodeProfile leetCodeProfile;

    @OneToOne(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private PgpScore pgpScore;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Student() {}

    public Student(String rollNo, String name, String departmentCode, String batchYear, String section, String subBatch, String gender) {
        this.rollNo = rollNo;
        this.name = name;
        this.departmentCode = departmentCode;
        this.batchYear = batchYear;
        this.section = section;
        this.subBatch = subBatch;
        this.gender = gender != null ? gender : "Male";
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRollNo() { return rollNo; }
    public void setRollNo(String rollNo) { this.rollNo = rollNo; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDepartmentCode() { return departmentCode; }
    public void setDepartmentCode(String departmentCode) { this.departmentCode = departmentCode; }

    public String getBatchYear() { return batchYear; }
    public void setBatchYear(String batchYear) { this.batchYear = batchYear; }

    public String getSection() { return section; }
    public void setSection(String section) { this.section = section; }

    public String getSubBatch() { return subBatch; }
    public void setSubBatch(String subBatch) { this.subBatch = subBatch; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

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

    public LeetCodeProfile getLeetCodeProfile() { return leetCodeProfile; }
    public void setLeetCodeProfile(LeetCodeProfile leetCodeProfile) { this.leetCodeProfile = leetCodeProfile; }

    public PgpScore getPgpScore() { return pgpScore; }
    public void setPgpScore(PgpScore pgpScore) { this.pgpScore = pgpScore; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
