package com.sece.leaderboard.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.Immutable;

import java.math.BigDecimal;

/**
 * Read-only JPA entity mapped to PostgreSQL view v_student_overall_scores.
 * Calculates normalized composite overall_score per student across all active coding platforms.
 */
@Entity
@Immutable
@Table(name = "v_student_overall_scores")
public class StudentOverallScore {

    @Id
    @Column(name = "student_id")
    private Long studentId;

    @Column(name = "register_number")
    private String registerNumber;

    @Column(name = "name")
    private String name;

    @Column(name = "academic_year")
    private Integer academicYear;

    @Column(name = "department")
    private String department;

    @Column(name = "section")
    private String section;

    @Column(name = "overall_score")
    private BigDecimal overallScore;

    @Column(name = "category")
    private String category;

    public StudentOverallScore() {}

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getRegisterNumber() {
        return registerNumber;
    }

    public void setRegisterNumber(String registerNumber) {
        this.registerNumber = registerNumber;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(Integer academicYear) {
        this.academicYear = academicYear;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public BigDecimal getOverallScore() {
        return overallScore;
    }

    public void setOverallScore(BigDecimal overallScore) {
        this.overallScore = overallScore;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}
