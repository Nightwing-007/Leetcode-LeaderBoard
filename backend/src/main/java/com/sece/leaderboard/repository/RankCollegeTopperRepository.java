package com.sece.leaderboard.repository;

import com.sece.leaderboard.entity.RankCollegeTopper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface RankCollegeTopperRepository extends JpaRepository<RankCollegeTopper, Long>, JpaSpecificationExecutor<RankCollegeTopper> {

    Page<RankCollegeTopper> findByDepartmentIgnoreCase(String department, Pageable pageable);

    Page<RankCollegeTopper> findByAcademicYear(Integer academicYear, Pageable pageable);

    Page<RankCollegeTopper> findByDepartmentIgnoreCaseAndAcademicYear(String department, Integer academicYear, Pageable pageable);
}
