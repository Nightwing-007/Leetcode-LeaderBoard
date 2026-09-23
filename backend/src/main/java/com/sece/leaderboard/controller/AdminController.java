package com.sece.leaderboard.controller;

import com.sece.leaderboard.dto.StudentSaveRequest;
import com.sece.leaderboard.dto.UploadResponseDto;
import com.sece.leaderboard.entity.LeetCodeProfile;
import com.sece.leaderboard.entity.PgpScore;
import com.sece.leaderboard.entity.Student;
import com.sece.leaderboard.repository.StudentRepository;
import com.sece.leaderboard.service.ExcelImportService;
import com.sece.leaderboard.service.LeetCodeSyncService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final ExcelImportService excelImportService;
    private final LeetCodeSyncService leetCodeSyncService;
    private final StudentRepository studentRepository;

    public AdminController(ExcelImportService excelImportService,
                           LeetCodeSyncService leetCodeSyncService,
                           StudentRepository studentRepository) {
        this.excelImportService = excelImportService;
        this.leetCodeSyncService = leetCodeSyncService;
        this.studentRepository = studentRepository;
    }

    @PostMapping("/upload-excel")
    public ResponseEntity<UploadResponseDto> uploadExcelReport(@RequestParam("file") MultipartFile file) {
        UploadResponseDto response = excelImportService.importExcelFile(file);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/sync-leetcode")
    public ResponseEntity<Map<String, String>> triggerLeetCodeSync() {
        leetCodeSyncService.syncAllLeetcodeProfiles();
        return ResponseEntity.ok(Map.of("message", "Background LeetCode profiles sync initiated"));
    }

    @PostMapping("/students")
    public ResponseEntity<Map<String, Object>> saveOrUpdateStudent(@Valid @RequestBody StudentSaveRequest request) {
        Student student = studentRepository.findByRollNoIgnoreCase(request.getRollNo().trim())
                .orElse(new Student(request.getRollNo().trim().toUpperCase(), request.getName(),
                        request.getDepartment(), request.getBatch(), request.getSection(), request.getSubBatch(), request.getGender()));

        student.setName(request.getName());
        student.setDepartmentCode(request.getDepartment());
        student.setBatchYear(request.getBatch());
        student.setSection(request.getSection());
        student.setSubBatch(request.getSubBatch());
        student.setGender(request.getGender());

        // LeetCode Profile
        LeetCodeProfile lc = student.getLeetCodeProfile();
        if (lc == null) lc = new LeetCodeProfile(student);
        lc.setLeetcodeUsername(request.getLeetcodeId());
        if (request.getContestRating() != null) lc.setContestRating(request.getContestRating());
        if (request.getContestAttended() != null) lc.setContestsAttended(request.getContestAttended());
        if (request.getGlobalRank() != null) lc.setGlobalRank(request.getGlobalRank());
        if (request.getTopPercentage() != null) lc.setTopPercentage(request.getTopPercentage());
        if (request.getSolvedTotal() != null) lc.setSolvedTotal(request.getSolvedTotal());
        if (request.getSolvedEasy() != null) lc.setSolvedEasy(request.getSolvedEasy());
        if (request.getSolvedMedium() != null) lc.setSolvedMedium(request.getSolvedMedium());
        if (request.getSolvedHard() != null) lc.setSolvedHard(request.getSolvedHard());
        student.setLeetCodeProfile(lc);

        // PGP Score
        PgpScore pgp = student.getPgpScore();
        if (pgp == null) pgp = new PgpScore(student);
        if (request.getProgramsSolved() != null) pgp.setProgramsSolved(request.getProgramsSolved());
        if (request.getCodeTests() != null) pgp.setCodeTests(request.getCodeTests());
        if (request.getCodeTracks() != null) pgp.setCodeTracks(request.getCodeTracks());
        if (request.getCodeTutor() != null) pgp.setCodeTutor(request.getCodeTutor());
        if (request.getDc() != null) pgp.setDc(request.getDc());
        if (request.getDt() != null) pgp.setDt(request.getDt());
        if (request.getAptitudeScore() != null) pgp.setAptitudeScore(request.getAptitudeScore());
        if (request.getPoints() != null) pgp.setTotalPoints(request.getPoints());
        if (request.getSkillrackRank() != null) pgp.setSkillrackRank(request.getSkillrackRank());
        student.setPgpScore(pgp);

        studentRepository.save(student);

        return ResponseEntity.ok(Map.of("success", true, "message", "Student record saved successfully"));
    }

    @DeleteMapping("/students/{rollNo}")
    public ResponseEntity<Map<String, Object>> deleteStudent(@PathVariable String rollNo) {
        Student student = studentRepository.findByRollNoIgnoreCase(rollNo.trim())
                .orElseThrow(() -> new IllegalArgumentException("Student not found with roll no: " + rollNo));
        studentRepository.delete(student);
        return ResponseEntity.ok(Map.of("success", true, "message", "Student record deleted successfully"));
    }

    @DeleteMapping("/clear-all")
    public ResponseEntity<Map<String, Object>> clearAllData() {
        studentRepository.deleteAll();
        return ResponseEntity.ok(Map.of("success", true, "message", "All student records and scores cleared successfully"));
    }
}
