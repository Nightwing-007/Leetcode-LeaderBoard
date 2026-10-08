package com.sece.leaderboard.repository;

import com.sece.leaderboard.entity.RankDepartmentYearTopper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface RankDepartmentYearTopperRepository extends JpaRepository<RankDepartmentYearTopper, Long>, JpaSpecificationExecutor<RankDepartmentYearTopper> {

    Page<RankDepartmentYearTopper> findByDepartmentIgnoreCaseAndAcademicYear(String department, Integer academicYear, Pageable pageable);

    Page<RankDepartmentYearTopper> findByDepartmentIgnoreCase(String department, Pageable pageable);

    Page<RankDepartmentYearTopper> findByAcademicYear(Integer academicYear, Pageable pageable);
}
