package com.sece.leaderboard.repository;

import com.sece.leaderboard.entity.PlatformPerformance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlatformPerformanceRepository extends JpaRepository<PlatformPerformance, Long> {
    List<PlatformPerformance> findByStudentId(Long studentId);
    List<PlatformPerformance> findByStudentIdIn(java.util.Collection<Long> studentIds);
    Optional<PlatformPerformance> findByStudentIdAndPlatformId(Long studentId, Integer platformId);
}
