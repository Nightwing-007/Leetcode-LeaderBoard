package com.sece.leaderboard.controller;

import com.sece.leaderboard.dto.StudentDetailDto;
import com.sece.leaderboard.entity.LeetCodeProfile;
import com.sece.leaderboard.entity.PgpScore;
import com.sece.leaderboard.entity.Student;
import com.sece.leaderboard.repository.StudentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/students")
public class StudentController {

    private final StudentRepository studentRepository;

    public StudentController(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @GetMapping("/{rollNo}")
    public ResponseEntity<StudentDetailDto> getStudentByRollNo(@PathVariable String rollNo) {
        Student s = studentRepository.findWithDetailsByRollNo(rollNo)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with roll no: " + rollNo));

        LeetCodeProfile lc = s.getLeetCodeProfile();
        PgpScore pgp = s.getPgpScore();

        StudentDetailDto dto = new StudentDetailDto();
        dto.setId(s.getId());
        dto.setRollNo(s.getRollNo());
        dto.setName(s.getName());
        dto.setDepartment(s.getDepartmentCode());
        dto.setBatch(s.getBatchYear());
        dto.setSection(s.getSection());
        dto.setSubBatch(s.getSubBatch());
        dto.setGender(s.getGender());

        if (lc != null) {
            dto.setLeetcodeUsername(lc.getLeetcodeUsername());
            dto.setLcGlobalRank(lc.getGlobalRank());
            dto.setLcContestRating(lc.getContestRating());
            dto.setLcContestsAttended(lc.getContestsAttended());
            dto.setLcTopPercentage(lc.getTopPercentage());
            dto.setLcSolvedTotal(lc.getSolvedTotal());
            dto.setLcSolvedEasy(lc.getSolvedEasy());
            dto.setLcSolvedMedium(lc.getSolvedMedium());
            dto.setLcSolvedHard(lc.getSolvedHard());
            dto.setLcLastSyncedAt(lc.getLastSyncedAt());
        }

        if (pgp != null) {
            dto.setPgpProgramsSolved(pgp.getProgramsSolved());
            dto.setPgpCodeTests(pgp.getCodeTests());
            dto.setPgpCodeTracks(pgp.getCodeTracks());
            dto.setPgpCodeTutor(pgp.getCodeTutor());
            dto.setPgpDc(pgp.getDc());
            dto.setPgpDt(pgp.getDt());
            dto.setPgpAptitudeScore(pgp.getAptitudeScore());
            dto.setPgpPoints(pgp.getTotalPoints());
            dto.setPgpSkillrackRank(pgp.getSkillrackRank());
        }

        return ResponseEntity.ok(dto);
    }
}
