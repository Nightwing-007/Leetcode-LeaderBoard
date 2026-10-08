package com.sece.leaderboard.repository;

import com.sece.leaderboard.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByRegisterNumberIgnoreCase(String registerNumber);

    boolean existsByRegisterNumberIgnoreCase(String registerNumber);

    @Query("SELECT DISTINCT s.department FROM Student s ORDER BY s.department")
    List<String> findDistinctDepartments();

    @Query("SELECT DISTINCT s.batch FROM Student s ORDER BY s.batch")
    List<String> findDistinctBatches();

    long countByDepartment(String department);
}
