package com.sece.leaderboard.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "leetcode_profiles", indexes = {
        @Index(name = "idx_lc_global_rank", columnList = "global_rank"),
        @Index(name = "idx_lc_contest_rating", columnList = "contest_rating"),
        @Index(name = "idx_lc_solved_total", columnList = "solved_total")
})
public class LeetCodeProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false, unique = true)
    private Student student;

    @Column(name = "leetcode_username", length = 100)
    private String leetcodeUsername;

    @Column(name = "global_rank")
    private Long globalRank = 999999L;

    @Column(name = "contest_rating", precision = 8, scale = 2)
    private BigDecimal contestRating = BigDecimal.valueOf(1500.00);

    @Column(name = "contests_attended")
    private Integer contestsAttended = 0;

    @Column(name = "top_percentage", length = 20)
    private String topPercentage = "N/A";

    @Column(name = "solved_total")
    private Integer solvedTotal = 0;

    @Column(name = "solved_easy")
    private Integer solvedEasy = 0;

    @Column(name = "solved_medium")
    private Integer solvedMedium = 0;

    @Column(name = "solved_hard")
    private Integer solvedHard = 0;

    @Column(name = "last_synced_at")
    private LocalDateTime lastSyncedAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public LeetCodeProfile() {}

    public LeetCodeProfile(Student student) {
        this.student = student;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public String getLeetcodeUsername() { return leetcodeUsername; }
    public void setLeetcodeUsername(String leetcodeUsername) { this.leetcodeUsername = leetcodeUsername; }

    public Long getGlobalRank() { return globalRank; }
    public void setGlobalRank(Long globalRank) { this.globalRank = globalRank; }

    public BigDecimal getContestRating() { return contestRating; }
    public void setContestRating(BigDecimal contestRating) { this.contestRating = contestRating; }

    public Integer getContestsAttended() { return contestsAttended; }
    public void setContestsAttended(Integer contestsAttended) { this.contestsAttended = contestsAttended; }

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

    public LocalDateTime getLastSyncedAt() { return lastSyncedAt; }
    public void setLastSyncedAt(LocalDateTime lastSyncedAt) { this.lastSyncedAt = lastSyncedAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
