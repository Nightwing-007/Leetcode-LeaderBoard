package com.sece.leaderboard.repository;

import com.sece.leaderboard.entity.RankClassTopper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface RankClassTopperRepository extends JpaRepository<RankClassTopper, Long>, JpaSpecificationExecutor<RankClassTopper> {

    Page<RankClassTopper> findByDepartmentIgnoreCaseAndAcademicYearAndSectionIgnoreCase(String department, Integer academicYear, String section, Pageable pageable);

    Page<RankClassTopper> findByDepartmentIgnoreCaseAndAcademicYear(String department, Integer academicYear, Pageable pageable);

    Page<RankClassTopper> findByDepartmentIgnoreCase(String department, Pageable pageable);
}
