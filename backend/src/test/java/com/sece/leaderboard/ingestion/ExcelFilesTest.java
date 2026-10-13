package com.sece.leaderboard.ingestion;

import com.sece.leaderboard.dto.UploadResponseDto;
import com.sece.leaderboard.leaderboard.LeaderboardApplication;
import com.sece.leaderboard.service.ExcelImportService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;

import java.io.File;
import java.io.FileInputStream;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(classes = LeaderboardApplication.class)
public class ExcelFilesTest {

    @Autowired
    private ExcelImportService excelImportService;

    @Test
    void testIngestAllThreeExcelFiles() throws Exception {
        String[] filePaths = {
                "../Batch (2024-2028) PGP Report.xlsx",
                "../CandidateRankingDetails.xlsx",
                "../Leetcode Report as on 11_9_26.xlsx"
        };

        for (String filePath : filePaths) {
            File file = new File(filePath);
            assertTrue(file.exists(), "File should exist: " + file.getAbsolutePath());
            try (FileInputStream fis = new FileInputStream(file)) {
                MockMultipartFile multipartFile = new MockMultipartFile(
                        "file",
                        file.getName(),
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        fis
                );
                UploadResponseDto response = excelImportService.importExcelFile(multipartFile);
                assertNotNull(response);
                System.out.println("=== Ingestion Result for: " + file.getName() + " ===");
                System.out.println("Success: " + response.isSuccess());
                System.out.println("Message: " + response.getMessage());
                System.out.println("Total Rows Parsed: " + response.getTotalRowsProcessed());
                System.out.println("Inserted: " + response.getStudentsInserted() + ", Updated: " + response.getStudentsUpdated());
                System.out.println("Platform Records: " + response.getPlatformRecordsUpdated());
                System.out.println("Detected Type: " + response.getDetectedType());
                System.out.println("Warnings: " + response.getWarnings());
                System.out.println("Failed rows count: " + (response.getFailedRows() != null ? response.getFailedRows().size() : 0));
                if (response.getFailedRows() != null && !response.getFailedRows().isEmpty()) {
                    System.out.println("First 5 failed rows: " + response.getFailedRows().subList(0, Math.min(5, response.getFailedRows().size())));
                }
            }
        }
    }

    @Autowired
    private com.sece.leaderboard.service.LeaderboardService leaderboardService;

    @Autowired
    private com.sece.leaderboard.repository.StudentRepository studentRepository;

    @Autowired
    private com.sece.leaderboard.repository.CodingPlatformRepository codingPlatformRepository;

    @Autowired
    private com.sece.leaderboard.repository.PlatformPerformanceRepository platformPerformanceRepository;

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Test
    @org.springframework.transaction.annotation.Transactional
    void testLeaderboardQueries() {
        // Clean up any residual erroneous Degre.AI records created before the bug fix
        int deleted = jdbcTemplate.update("DELETE FROM platform_performance WHERE platform_id IN (SELECT id FROM coding_platforms WHERE UPPER(platform_name) = 'DEGRE.AI')");
        System.out.println("Cleaned up residual erroneous Degre.AI records: " + deleted);

        System.out.println("Total students in DB: " + studentRepository.count());
        System.out.println("Platforms in DB:");
        codingPlatformRepository.findAll().forEach(p -> 
            System.out.println("Platform: " + p.getPlatformName() + " | Weight: " + p.getWeightPercentage() + " | Active: " + p.getIsActive())
        );

        System.out.println("Kungumapriyaa Platform Performance:");
        studentRepository.findByRegisterNumberIgnoreCase("24AD107").ifPresent(s -> {
            System.out.println("Student: " + s.getName() + " | Dept: " + s.getDepartment() + " | Year: " + s.getAcademicYear() + " | Gender: " + s.getGender());
            for (com.sece.leaderboard.entity.PlatformPerformance p : platformPerformanceRepository.findByStudentId(s.getId())) {
                System.out.println("  Platform: " + p.getCodingPlatform().getPlatformName() + " | Solved: " + p.getProblemsSolved() + 
                    " | Rating: " + p.getRating() + " | ContestRating: " + p.getContestRating() + " | Score: " + p.getAssessmentScore() + 
                    " | GlobalRank: " + p.getGlobalRank() + " | AssRank: " + p.getAssessmentRank());
            }
        });

        System.out.println("=== TOP 5 COLLEGE TOPPERS (Overall) ===");
        var topCollege = leaderboardService.getLeaderboard("overall", "All", "All", "All", "", "rank");
        topCollege.stream().limit(5).forEach(row -> 
            System.out.println("Rank #" + row.getRank() + ": " + row.getName() + " (" + row.getRollNo() + ") - Dept: " + row.getDepartment() + " - Gender: " + row.getGender() + " - Overall: " + row.getOverallScore() + " - Cat: " + row.getCategory())
        );

        System.out.println("=== TOP 3 FEMALE TOPPERS (AIDS) ===");
        var topFemale = leaderboardService.getLeaderboard("overall", "AIDS", "All", "Female", "", "rank");
        topFemale.stream().limit(3).forEach(row -> 
            System.out.println("Rank #" + row.getRank() + ": " + row.getName() + " (" + row.getRollNo() + ") - Gender: " + row.getGender() + " - Overall: " + row.getOverallScore())
        );
    }
}
