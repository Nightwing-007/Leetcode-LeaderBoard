package com.sece.leaderboard.repository;

import com.sece.leaderboard.entity.PlatformAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlatformAccountRepository extends JpaRepository<PlatformAccount, Long> {
    List<PlatformAccount> findByStudentId(Long studentId);
    List<PlatformAccount> findByStudentIdIn(java.util.Collection<Long> studentIds);
    Optional<PlatformAccount> findByStudentIdAndPlatformId(Long studentId, Integer platformId);
    Optional<PlatformAccount> findByPlatformIdAndPlatformUsernameIgnoreCase(Integer platformId, String platformUsername);
}
