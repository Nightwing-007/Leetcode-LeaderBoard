package com.sece.leaderboard.repository;

import com.sece.leaderboard.entity.RankingSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RankingSnapshotRepository extends JpaRepository<RankingSnapshot, Long> {
    List<RankingSnapshot> findByStudentIdOrderBySnapshotDateAsc(Long studentId);
    List<RankingSnapshot> findBySnapshotDate(LocalDate date);
}
