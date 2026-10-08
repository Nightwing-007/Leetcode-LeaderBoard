package com.sece.leaderboard.repository;

import com.sece.leaderboard.entity.RankDepartmentTopper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface RankDepartmentTopperRepository extends JpaRepository<RankDepartmentTopper, Long>, JpaSpecificationExecutor<RankDepartmentTopper> {

    Page<RankDepartmentTopper> findByDepartmentIgnoreCase(String department, Pageable pageable);

    Page<RankDepartmentTopper> findByDepartmentIgnoreCaseAndAcademicYear(String department, Integer academicYear, Pageable pageable);
}
