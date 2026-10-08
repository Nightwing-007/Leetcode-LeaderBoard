package com.sece.leaderboard.repository;

import com.sece.leaderboard.entity.StudentOverallScore;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentOverallScoreRepository extends JpaRepository<StudentOverallScore, Long>, JpaSpecificationExecutor<StudentOverallScore> {

    Page<StudentOverallScore> findByDepartmentIgnoreCase(String department, Pageable pageable);

    Page<StudentOverallScore> findByAcademicYear(Integer academicYear, Pageable pageable);

    Page<StudentOverallScore> findByDepartmentIgnoreCaseAndAcademicYear(String department, Integer academicYear, Pageable pageable);
}
