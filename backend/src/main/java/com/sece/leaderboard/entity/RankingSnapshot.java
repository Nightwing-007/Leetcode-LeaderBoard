package com.sece.leaderboard.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "ranking_snapshots", indexes = {
        @Index(name = "idx_snapshots_date_student", columnList = "snapshot_date, student_id")
})
public class RankingSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "snapshot_date", nullable = false)
    private LocalDate snapshotDate;

    @Column(name = "lc_global_rank")
    private Long lcGlobalRank;

    @Column(name = "lc_contest_rating", precision = 8, scale = 2)
    private BigDecimal lcContestRating;

    @Column(name = "lc_solved_total")
    private Integer lcSolvedTotal;

    @Column(name = "pgp_points")
    private Integer pgpPoints;

    @Column(name = "skillrack_rank")
    private Long skillrackRank;

    public RankingSnapshot() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public LocalDate getSnapshotDate() { return snapshotDate; }
    public void setSnapshotDate(LocalDate snapshotDate) { this.snapshotDate = snapshotDate; }

    public Long getLcGlobalRank() { return lcGlobalRank; }
    public void setLcGlobalRank(Long lcGlobalRank) { this.lcGlobalRank = lcGlobalRank; }

    public BigDecimal getLcContestRating() { return lcContestRating; }
    public void setLcContestRating(BigDecimal lcContestRating) { this.lcContestRating = lcContestRating; }

    public Integer getLcSolvedTotal() { return lcSolvedTotal; }
    public void setLcSolvedTotal(Integer lcSolvedTotal) { this.lcSolvedTotal = lcSolvedTotal; }

    public Integer getPgpPoints() { return pgpPoints; }
    public void setPgpPoints(Integer pgpPoints) { this.pgpPoints = pgpPoints; }

    public Long getSkillrackRank() { return skillrackRank; }
    public void setSkillrackRank(Long skillrackRank) { this.skillrackRank = skillrackRank; }
}
