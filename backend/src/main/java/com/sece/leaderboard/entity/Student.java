package com.sece.leaderboard.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.ZonedDateTime;

@Entity
@Table(name = "students", indexes = {
        @Index(name = "idx_students_reg_no", columnList = "register_number"),
        @Index(name = "idx_students_dept", columnList = "department"),
        @Index(name = "idx_students_year", columnList = "academic_year"),
        @Index(name = "idx_students_section", columnList = "section"),
        @Index(name = "idx_students_composite", columnList = "department, academic_year, section")
})
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "register_number", unique = true, nullable = false, length = 50)
    private String registerNumber;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "academic_year", nullable = false)
    private Integer academicYear;

    @Column(nullable = false, length = 50)
    private String department;

    @Column(length = 10)
    private String section;

    @Column(nullable = false, length = 20)
    private String batch;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;

    public Student() {}

    public Student(String registerNumber, String name, Integer academicYear, String department, String section, String batch) {
        this.registerNumber = registerNumber;
        this.name = name;
        this.academicYear = academicYear;
        this.department = department;
        this.section = section;
        this.batch = batch;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getBatch() {
        return batch;
    }

    public void setBatch(String batch) {
        this.batch = batch;
    }

    public ZonedDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(ZonedDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public ZonedDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(ZonedDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
