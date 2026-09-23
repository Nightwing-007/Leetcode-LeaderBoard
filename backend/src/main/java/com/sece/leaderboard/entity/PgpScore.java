package com.sece.leaderboard.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "pgp_scores", indexes = {
        @Index(name = "idx_pgp_total_points", columnList = "total_points"),
        @Index(name = "idx_pgp_skillrack_rank", columnList = "skillrack_rank")
})
public class PgpScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false, unique = true)
    private Student student;

    @Column(name = "programs_solved")
    private Integer programsSolved = 0;

    @Column(name = "code_tests")
    private Integer codeTests = 0;

    @Column(name = "code_tracks")
    private Integer codeTracks = 0;

    @Column(name = "code_tutor")
    private Integer codeTutor = 0;

    @Column(name = "dc")
    private Integer dc = 0;

    @Column(name = "dt")
    private Integer dt = 0;

    @Column(name = "aptitude_score")
    private Integer aptitudeScore = 0;

    @Column(name = "total_points")
    private Integer totalPoints = 0;

    @Column(name = "skillrack_rank")
    private Long skillrackRank = 0L;

    @Column(name = "report_date")
    private LocalDate reportDate;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public PgpScore() {}

    public PgpScore(Student student) {
        this.student = student;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

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

    public Integer getTotalPoints() { return totalPoints; }
    public void setTotalPoints(Integer totalPoints) { this.totalPoints = totalPoints; }

    public Long getSkillrackRank() { return skillrackRank; }
    public void setSkillrackRank(Long skillrackRank) { this.skillrackRank = skillrackRank; }

    public LocalDate getReportDate() { return reportDate; }
    public void setReportDate(LocalDate reportDate) { this.reportDate = reportDate; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
