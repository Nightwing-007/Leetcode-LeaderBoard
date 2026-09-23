package com.sece.leaderboard.repository;

import com.sece.leaderboard.entity.PgpScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PgpScoreRepository extends JpaRepository<PgpScore, Long> {

    @Query("SELECT p FROM PgpScore p JOIN FETCH p.student s ORDER BY p.totalPoints DESC")
    List<PgpScore> findAllOrderByPointsDesc();

    @Query("SELECT p FROM PgpScore p JOIN FETCH p.student s WHERE s.departmentCode = :dept ORDER BY p.totalPoints DESC")
    List<PgpScore> findByDepartmentOrderByPointsDesc(String dept);

    @Query("SELECT p FROM PgpScore p JOIN FETCH p.student s WHERE s.batchYear = :batch ORDER BY p.totalPoints DESC")
    List<PgpScore> findByBatchOrderByPointsDesc(String batch);

    @Query("SELECT COALESCE(AVG(p.totalPoints), 0.0) FROM PgpScore p")
    Double findAveragePoints();

    @Query("SELECT COALESCE(MAX(p.totalPoints), 0) FROM PgpScore p")
    Integer findMaxPoints();
}
