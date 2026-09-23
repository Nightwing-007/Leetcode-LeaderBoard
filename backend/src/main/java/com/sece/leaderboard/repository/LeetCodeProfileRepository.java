package com.sece.leaderboard.repository;

import com.sece.leaderboard.entity.LeetCodeProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface LeetCodeProfileRepository extends JpaRepository<LeetCodeProfile, Long> {

    Optional<LeetCodeProfile> findByLeetcodeUsernameIgnoreCase(String username);

    @Query("SELECT lp FROM LeetCodeProfile lp JOIN FETCH lp.student s ORDER BY lp.globalRank ASC")
    List<LeetCodeProfile> findAllOrderByGlobalRankAsc();

    @Query("SELECT lp FROM LeetCodeProfile lp JOIN FETCH lp.student s WHERE s.departmentCode = :dept ORDER BY lp.globalRank ASC")
    List<LeetCodeProfile> findByDepartmentOrderByGlobalRankAsc(String dept);

    @Query("SELECT lp FROM LeetCodeProfile lp JOIN FETCH lp.student s WHERE s.batchYear = :batch ORDER BY lp.globalRank ASC")
    List<LeetCodeProfile> findByBatchOrderByGlobalRankAsc(String batch);

    @Query("SELECT COALESCE(MAX(lp.contestRating), 0.0) FROM LeetCodeProfile lp")
    BigDecimal findMaxContestRating();

    @Query("SELECT COALESCE(SUM(lp.solvedTotal), 0) FROM LeetCodeProfile lp")
    Long findTotalSolvedCount();

    @Query("SELECT COALESCE(SUM(lp.contestsAttended), 0) FROM LeetCodeProfile lp")
    Long findTotalContestsAttended();
}
