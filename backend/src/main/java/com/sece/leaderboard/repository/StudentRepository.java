package com.sece.leaderboard.repository;

import com.sece.leaderboard.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByRollNoIgnoreCase(String rollNo);

    boolean existsByRollNoIgnoreCase(String rollNo);

    @Query("SELECT s FROM Student s LEFT JOIN FETCH s.leetCodeProfile LEFT JOIN FETCH s.pgpScore WHERE LOWER(s.rollNo) = LOWER(:rollNo)")
    Optional<Student> findWithDetailsByRollNo(@Param("rollNo") String rollNo);

    @Query("SELECT s FROM Student s " +
           "LEFT JOIN FETCH s.leetCodeProfile " +
           "LEFT JOIN FETCH s.pgpScore " +
           "WHERE (:dept = 'All' OR s.departmentCode = :dept) " +
           "AND (:batch = 'All' OR s.batchYear = :batch) " +
           "AND (:gender = 'All' OR s.gender = :gender) " +
           "AND (:query IS NULL OR :query = '' OR " +
           "     LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "     LOWER(s.rollNo) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "     LOWER(s.leetCodeProfile.leetcodeUsername) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Student> findAllFiltered(
            @Param("dept") String dept,
            @Param("batch") String batch,
            @Param("gender") String gender,
            @Param("query") String query
    );

    @Query("SELECT DISTINCT s.departmentCode FROM Student s ORDER BY s.departmentCode")
    List<String> findDistinctDepartments();

    @Query("SELECT DISTINCT s.batchYear FROM Student s ORDER BY s.batchYear")
    List<String> findDistinctBatches();

    long countByDepartmentCode(String departmentCode);
}
