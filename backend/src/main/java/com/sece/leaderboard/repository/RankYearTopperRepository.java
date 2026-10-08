package com.sece.leaderboard.repository;

import com.sece.leaderboard.entity.RankYearTopper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface RankYearTopperRepository extends JpaRepository<RankYearTopper, Long>, JpaSpecificationExecutor<RankYearTopper> {

    Page<RankYearTopper> findByAcademicYear(Integer academicYear, Pageable pageable);

    Page<RankYearTopper> findByAcademicYearAndDepartmentIgnoreCase(Integer academicYear, String department, Pageable pageable);
}
