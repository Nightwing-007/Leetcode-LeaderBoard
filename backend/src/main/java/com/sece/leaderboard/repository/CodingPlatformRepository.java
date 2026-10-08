package com.sece.leaderboard.repository;

import com.sece.leaderboard.entity.CodingPlatform;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CodingPlatformRepository extends JpaRepository<CodingPlatform, Integer> {
    Optional<CodingPlatform> findByPlatformNameIgnoreCase(String platformName);
    java.util.List<CodingPlatform> findByIsActiveTrue();
}
