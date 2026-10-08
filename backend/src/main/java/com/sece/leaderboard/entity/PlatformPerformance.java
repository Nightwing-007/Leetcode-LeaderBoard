package com.sece.leaderboard.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Entity
@Table(name = "platform_performance", indexes = {
        @Index(name = "idx_perf_student_platform", columnList = "student_id, platform_id")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uq_student_platform_performance", columnNames = {"student_id", "platform_id"})
})
public class PlatformPerformance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "platform_id", nullable = false)
    private CodingPlatform platform;

    @Column(name = "problems_solved")
    private Integer problemsSolved = 0;

    @Column(precision = 10, scale = 2)
    private BigDecimal rating = BigDecimal.ZERO;

    @Column(name = "assessment_score", precision = 10, scale = 2)
    private BigDecimal assessmentScore = BigDecimal.ZERO;

    @Column(name = "global_rank")
    private Long globalRank;

    @Column(name = "assessment_rank")
    private Long assessmentRank;

    @Column(name = "contest_rating", precision = 10, scale = 2)
    private BigDecimal contestRating = BigDecimal.ZERO;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;

    public PlatformPerformance() {}

    public PlatformPerformance(Student student, CodingPlatform platform) {
        this.student = student;
        this.platform = platform;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
    }

    public CodingPlatform getPlatform() {
        return platform;
    }

    public void setPlatform(CodingPlatform platform) {
        this.platform = platform;
    }

    public CodingPlatform getCodingPlatform() {
        return platform;
    }

    public void setCodingPlatform(CodingPlatform platform) {
        this.platform = platform;
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
