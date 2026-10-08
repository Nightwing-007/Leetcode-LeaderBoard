package com.sece.leaderboard.controller;

import com.sece.leaderboard.dto.StudentSaveRequest;
import com.sece.leaderboard.dto.UploadResponseDto;
import com.sece.leaderboard.entity.CodingPlatform;
import com.sece.leaderboard.entity.PlatformAccount;
import com.sece.leaderboard.entity.PlatformPerformance;
import com.sece.leaderboard.entity.Student;
import com.sece.leaderboard.repository.CodingPlatformRepository;
import com.sece.leaderboard.repository.PlatformAccountRepository;
import com.sece.leaderboard.repository.PlatformPerformanceRepository;
import com.sece.leaderboard.repository.StudentRepository;
import com.sece.leaderboard.service.ExcelImportService;
import com.sece.leaderboard.service.LeetCodeSyncService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final ExcelImportService excelImportService;
    private final LeetCodeSyncService leetCodeSyncService;
    private final StudentRepository studentRepository;
    private final CodingPlatformRepository codingPlatformRepository;
    private final PlatformAccountRepository platformAccountRepository;
    private final PlatformPerformanceRepository platformPerformanceRepository;

    public AdminController(ExcelImportService excelImportService,
                           LeetCodeSyncService leetCodeSyncService,
                           StudentRepository studentRepository,
                           CodingPlatformRepository codingPlatformRepository,
                           PlatformAccountRepository platformAccountRepository,
                           PlatformPerformanceRepository platformPerformanceRepository) {
        this.excelImportService = excelImportService;
        this.leetCodeSyncService = leetCodeSyncService;
        this.studentRepository = studentRepository;
        this.codingPlatformRepository = codingPlatformRepository;
        this.platformAccountRepository = platformAccountRepository;
        this.platformPerformanceRepository = platformPerformanceRepository;
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
        String regNo = request.getRollNo().trim().toUpperCase();
        int academicYear = 3;
        if (request.getBatch() != null) {
            if (request.getBatch().contains("2023") || request.getBatch().contains("23-27")) academicYear = 4;
            else if (request.getBatch().contains("2024") || request.getBatch().contains("24-28")) academicYear = 3;
            else if (request.getBatch().contains("2025") || request.getBatch().contains("25-29")) academicYear = 2;
            else if (request.getBatch().contains("2026") || request.getBatch().contains("26-30")) academicYear = 1;
        }

        Student student = studentRepository.findByRegisterNumberIgnoreCase(regNo)
                .orElse(new Student(regNo, request.getName(), academicYear, request.getDepartment(), request.getSection(), request.getBatch()));

        student.setName(request.getName());
        student.setDepartment(request.getDepartment());
        student.setBatch(request.getBatch());
        student.setSection(request.getSection());
        student.setAcademicYear(academicYear);
        student = studentRepository.save(student);

        // Update LeetCode platform performance & account if provided
        if ((request.getLeetcodeId() != null && !request.getLeetcodeId().isBlank())
                || request.getContestRating() != null || request.getSolvedTotal() != null) {
            CodingPlatform lcPlatform = codingPlatformRepository.findByPlatformNameIgnoreCase("LeetCode")
                    .orElseGet(() -> codingPlatformRepository.save(new CodingPlatform("LeetCode", BigDecimal.valueOf(20.00), true)));

            if (request.getLeetcodeId() != null && !request.getLeetcodeId().isBlank()) {
                PlatformAccount account = platformAccountRepository
                        .findByStudentIdAndPlatformId(student.getId(), lcPlatform.getId())
                        .orElse(new PlatformAccount(student, lcPlatform, request.getLeetcodeId().trim()));
                account.setPlatformUsername(request.getLeetcodeId().trim());
                platformAccountRepository.save(account);
            }

            PlatformPerformance lcPerf = platformPerformanceRepository
                    .findByStudentIdAndPlatformId(student.getId(), lcPlatform.getId())
                    .orElse(new PlatformPerformance(student, lcPlatform));

            if (request.getSolvedTotal() != null) lcPerf.setProblemsSolved(request.getSolvedTotal());
            if (request.getContestRating() != null) {
                lcPerf.setContestRating(request.getContestRating());
                lcPerf.setRating(request.getContestRating());
            }
            if (request.getGlobalRank() != null) lcPerf.setGlobalRank(request.getGlobalRank());
            lcPerf.setUpdatedAt(ZonedDateTime.now());
            platformPerformanceRepository.save(lcPerf);
        }

        // Update SkillRack platform performance if provided
        if (request.getProgramsSolved() != null || request.getPoints() != null || request.getSkillrackRank() != null || request.getAptitudeScore() != null) {
            CodingPlatform srPlatform = codingPlatformRepository.findByPlatformNameIgnoreCase("SkillRack")
                    .orElseGet(() -> codingPlatformRepository.save(new CodingPlatform("SkillRack", BigDecimal.valueOf(20.00), true)));

            PlatformPerformance srPerf = platformPerformanceRepository
                    .findByStudentIdAndPlatformId(student.getId(), srPlatform.getId())
                    .orElse(new PlatformPerformance(student, srPlatform));

            if (request.getProgramsSolved() != null) srPerf.setProblemsSolved(request.getProgramsSolved());
            if (request.getPoints() != null) srPerf.setRating(BigDecimal.valueOf(request.getPoints()));
            if (request.getAptitudeScore() != null) srPerf.setAssessmentScore(BigDecimal.valueOf(request.getAptitudeScore()));
            if (request.getSkillrackRank() != null) srPerf.setGlobalRank(request.getSkillrackRank());
            srPerf.setUpdatedAt(ZonedDateTime.now());
            platformPerformanceRepository.save(srPerf);
        }

        // Update AtCoder platform performance if provided
        if (request.getAtcoderId() != null || request.getAtcoderRating() != null || request.getAtcoderSolved() != null) {
            CodingPlatform acPlatform = codingPlatformRepository.findByPlatformNameIgnoreCase("AtCoder")
                    .orElseGet(() -> codingPlatformRepository.save(new CodingPlatform("AtCoder", BigDecimal.valueOf(20.00), true)));

            if (request.getAtcoderId() != null && !request.getAtcoderId().isBlank()) {
                PlatformAccount account = platformAccountRepository
                        .findByStudentIdAndPlatformId(student.getId(), acPlatform.getId())
                        .orElse(new PlatformAccount(student, acPlatform, request.getAtcoderId().trim()));
                account.setPlatformUsername(request.getAtcoderId().trim());
                platformAccountRepository.save(account);
            }

            PlatformPerformance acPerf = platformPerformanceRepository
                    .findByStudentIdAndPlatformId(student.getId(), acPlatform.getId())
                    .orElse(new PlatformPerformance(student, acPlatform));

            if (request.getAtcoderSolved() != null) acPerf.setProblemsSolved(request.getAtcoderSolved());
            if (request.getAtcoderRating() != null) acPerf.setRating(request.getAtcoderRating());
            acPerf.setUpdatedAt(ZonedDateTime.now());
            platformPerformanceRepository.save(acPerf);
        }

        // Update Codeforces platform performance if provided
        if (request.getCodeforcesId() != null || request.getCodeforcesRating() != null || request.getCodeforcesSolved() != null) {
            CodingPlatform cfPlatform = codingPlatformRepository.findByPlatformNameIgnoreCase("Codeforces")
                    .orElseGet(() -> codingPlatformRepository.save(new CodingPlatform("Codeforces", BigDecimal.valueOf(20.00), true)));

            if (request.getCodeforcesId() != null && !request.getCodeforcesId().isBlank()) {
                PlatformAccount account = platformAccountRepository
                        .findByStudentIdAndPlatformId(student.getId(), cfPlatform.getId())
                        .orElse(new PlatformAccount(student, cfPlatform, request.getCodeforcesId().trim()));
                account.setPlatformUsername(request.getCodeforcesId().trim());
                platformAccountRepository.save(account);
            }

            PlatformPerformance cfPerf = platformPerformanceRepository
                    .findByStudentIdAndPlatformId(student.getId(), cfPlatform.getId())
                    .orElse(new PlatformPerformance(student, cfPlatform));

            if (request.getCodeforcesSolved() != null) cfPerf.setProblemsSolved(request.getCodeforcesSolved());
            if (request.getCodeforcesRating() != null) cfPerf.setRating(request.getCodeforcesRating());
            cfPerf.setUpdatedAt(ZonedDateTime.now());
            platformPerformanceRepository.save(cfPerf);
        }

        // Update Degre.AI platform performance if provided
        if (request.getDegreId() != null || request.getDegreScore() != null || request.getDegreSolved() != null) {
            CodingPlatform degrePlatform = codingPlatformRepository.findByPlatformNameIgnoreCase("Degre.AI")
                    .orElseGet(() -> codingPlatformRepository.save(new CodingPlatform("Degre.AI", BigDecimal.valueOf(20.00), true)));

            if (request.getDegreId() != null && !request.getDegreId().isBlank()) {
                PlatformAccount account = platformAccountRepository
                        .findByStudentIdAndPlatformId(student.getId(), degrePlatform.getId())
                        .orElse(new PlatformAccount(student, degrePlatform, request.getDegreId().trim()));
                account.setPlatformUsername(request.getDegreId().trim());
                platformAccountRepository.save(account);
            }

            PlatformPerformance degrePerf = platformPerformanceRepository
                    .findByStudentIdAndPlatformId(student.getId(), degrePlatform.getId())
                    .orElse(new PlatformPerformance(student, degrePlatform));

            if (request.getDegreSolved() != null) degrePerf.setProblemsSolved(request.getDegreSolved());
            if (request.getDegreScore() != null) degrePerf.setAssessmentScore(request.getDegreScore());
            degrePerf.setUpdatedAt(ZonedDateTime.now());
            platformPerformanceRepository.save(degrePerf);
        }

        return ResponseEntity.ok(Map.of("success", true, "message", "Student record and platform performance saved successfully"));
    }

    @DeleteMapping("/students/{rollNo}")
    public ResponseEntity<Map<String, Object>> deleteStudent(@PathVariable String rollNo) {
        Student student = studentRepository.findByRegisterNumberIgnoreCase(rollNo.trim())
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
