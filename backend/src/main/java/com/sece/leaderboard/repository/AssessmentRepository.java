package com.sece.leaderboard.repository;

import com.sece.leaderboard.entity.Assessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, Long> {
    List<Assessment> findByStudentId(Long studentId);
    List<Assessment> findByStudentIdOrderByAssessmentDateDescIdDesc(Long studentId);
    java.util.Optional<Assessment> findTopByStudentIdOrderByAssessmentDateDescIdDesc(Long studentId);
    List<Assessment> findByPlatformId(Integer platformId);
}
