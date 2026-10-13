package com.sece.leaderboard.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.Immutable;

import java.math.BigDecimal;

/**
 * Read-only JPA entity mapped to PostgreSQL view v_rank_class_toppers.
 * Computes section-level rank (class_rank), class_size, and percentile:
 * ROUND(((class_size - class_rank) / class_size::numeric) * 100, 2)
 */
@Entity
@Immutable
@Table(name = "v_rank_class_toppers")
public class RankClassTopper implements LeaderboardRankRecord {

    @Id
    @Column(name = "student_id")
    private Long studentId;

    @Column(name = "class_rank")
    private Long rank;

    @Column(name = "register_number")
    private String registerNumber;

    @Column(name = "name")
    private String name;

    @Column(name = "department")
    private String department;

    @Column(name = "academic_year")
    private Integer academicYear;

    @Column(name = "section")
    private String section;

    @Column(name = "overall_score")
    private BigDecimal overallScore;

    @Column(name = "category")
    private String category;

    @Column(name = "gender")
    private String gender;

    @Column(name = "class_size")
    private Long classSize;

    @Column(name = "percentile")
    private BigDecimal percentile;

    public RankClassTopper() {}

    @Override
    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    @Override
    public Long getRank() {
        return rank;
    }

    public void setRank(Long rank) {
        this.rank = rank;
    }

    public Long getClassRank() {
        return rank;
    }

    public void setClassRank(Long classRank) {
        this.rank = classRank;
    }

    @Override
    public String getRegisterNumber() {
        return registerNumber;
    }

    public void setRegisterNumber(String registerNumber) {
        this.registerNumber = registerNumber;
    }

    @Override
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Override
    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    @Override
    public Integer getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(Integer academicYear) {
        this.academicYear = academicYear;
    }

    @Override
    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    @Override
    public BigDecimal getOverallScore() {
        return overallScore;
    }

    public void setOverallScore(BigDecimal overallScore) {
        this.overallScore = overallScore;
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

    @Override
    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    @Override
    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }
}
