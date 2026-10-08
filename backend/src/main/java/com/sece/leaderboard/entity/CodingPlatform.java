package com.sece.leaderboard.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "coding_platforms")
public class CodingPlatform {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "platform_name", unique = true, nullable = false, length = 50)
    private String platformName;

    @Column(name = "weight_percentage", precision = 5, scale = 2)
    private BigDecimal weightPercentage = BigDecimal.valueOf(20.00);

    @Column(name = "is_active")
    private Boolean isActive = true;

    public CodingPlatform() {}

    public CodingPlatform(String platformName, BigDecimal weightPercentage, Boolean isActive) {
        this.platformName = platformName;
        this.weightPercentage = weightPercentage;
        this.isActive = isActive;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getPlatformName() {
        return platformName;
    }

    public void setPlatformName(String platformName) {
        this.platformName = platformName;
    }

    public BigDecimal getWeightPercentage() {
        return weightPercentage;
    }

    public void setWeightPercentage(BigDecimal weightPercentage) {
        this.weightPercentage = weightPercentage;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
