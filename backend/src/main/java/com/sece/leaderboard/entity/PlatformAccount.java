package com.sece.leaderboard.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.ZonedDateTime;

@Entity
@Table(name = "platform_accounts", uniqueConstraints = {
        @UniqueConstraint(name = "uq_student_platform_account", columnNames = {"student_id", "platform_id"})
})
public class PlatformAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "platform_id", nullable = false)
    private CodingPlatform platform;

    @Column(name = "platform_username", nullable = false, length = 150)
    private String platformUsername;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;

    public PlatformAccount() {}

    public PlatformAccount(Student student, CodingPlatform platform, String platformUsername) {
        this.student = student;
        this.platform = platform;
        this.platformUsername = platformUsername;
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

    public String getPlatformUsername() {
        return platformUsername;
    }

    public void setPlatformUsername(String platformUsername) {
        this.platformUsername = platformUsername;
    }

    public ZonedDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(ZonedDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
