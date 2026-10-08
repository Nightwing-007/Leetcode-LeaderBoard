package com.sece.leaderboard.entity;

import java.math.BigDecimal;

/**
 * Common contract for read-only ranking entities mapped to PostgreSQL window function views.
 */
public interface LeaderboardRankRecord {
    Long getStudentId();
    Long getRank();
    String getRegisterNumber();
    String getName();
    String getDepartment();
    Integer getAcademicYear();
    String getSection();
    BigDecimal getOverallScore();
}
