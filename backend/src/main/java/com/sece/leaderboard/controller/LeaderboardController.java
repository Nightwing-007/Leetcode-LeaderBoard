package com.sece.leaderboard.controller;

import com.sece.leaderboard.dto.LeaderboardRowDto;
import com.sece.leaderboard.dto.PaginatedResponse;
import com.sece.leaderboard.service.LeaderboardService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/leaderboard")
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    public LeaderboardController(LeaderboardService leaderboardService) {
        this.leaderboardService = leaderboardService;
    }

    /**
     * Standardized Paginated College-wide Toppers calculated dynamically via view v_rank_college_toppers.
     */
    @GetMapping("/college-toppers")
    public ResponseEntity<PaginatedResponse<LeaderboardRowDto>> getCollegeToppers(
            @RequestParam(required = false, defaultValue = "All") String dept,
            @RequestParam(required = false) Integer academicYear,
            @RequestParam(required = false, defaultValue = "") String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("rank").ascending());
        return ResponseEntity.ok(PaginatedResponse.from(leaderboardService.getCollegeToppers(dept, academicYear, query, pageable)));
    }

    /**
     * Standardized Paginated Academic Year Toppers calculated dynamically via view v_rank_year_toppers.
     */
    @GetMapping("/year-toppers")
    public ResponseEntity<PaginatedResponse<LeaderboardRowDto>> getYearToppers(
            @RequestParam(required = false, defaultValue = "3") Integer academicYear,
            @RequestParam(required = false, defaultValue = "All") String dept,
            @RequestParam(required = false, defaultValue = "") String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("rank").ascending());
        return ResponseEntity.ok(PaginatedResponse.from(leaderboardService.getYearToppers(academicYear, dept, query, pageable)));
    }

    /**
     * Standardized Paginated Department Toppers calculated dynamically via view v_rank_department_toppers.
     */
    @GetMapping("/department-toppers")
    public ResponseEntity<PaginatedResponse<LeaderboardRowDto>> getDepartmentToppers(
            @RequestParam(required = false, defaultValue = "All") String dept,
            @RequestParam(required = false) Integer academicYear,
            @RequestParam(required = false, defaultValue = "") String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("rank").ascending());
        return ResponseEntity.ok(PaginatedResponse.from(leaderboardService.getDepartmentToppers(dept, academicYear, query, pageable)));
    }

    /**
     * Standardized Paginated Department + Academic Year Toppers calculated dynamically via v_rank_department_year_toppers.
     */
    @GetMapping("/department-year-toppers")
    public ResponseEntity<PaginatedResponse<LeaderboardRowDto>> getDepartmentYearToppers(
            @RequestParam(required = false, defaultValue = "All") String dept,
            @RequestParam(required = false) Integer academicYear,
            @RequestParam(required = false, defaultValue = "") String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("rank").ascending());
        return ResponseEntity.ok(PaginatedResponse.from(leaderboardService.getDepartmentYearToppers(dept, academicYear, query, pageable)));
    }

    /**
     * Standardized Paginated Class/Section Toppers calculated dynamically via view v_rank_class_toppers.
     * Returns section rank, overallScore, classSize, and computed percentile.
     */
    @GetMapping("/class-toppers")
    public ResponseEntity<PaginatedResponse<LeaderboardRowDto>> getClassToppers(
            @RequestParam(required = false, defaultValue = "All") String dept,
            @RequestParam(required = false) Integer academicYear,
            @RequestParam(required = false, defaultValue = "All") String section,
            @RequestParam(required = false, defaultValue = "") String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("rank").ascending());
        return ResponseEntity.ok(PaginatedResponse.from(leaderboardService.getClassToppers(dept, academicYear, section, query, pageable)));
    }

    /**
     * Standardized Paginated Overall Toppers Endpoint.
     */
    @GetMapping("/overall/paginated")
    public ResponseEntity<PaginatedResponse<LeaderboardRowDto>> getOverallLeaderboardPaginated(
            @RequestParam(required = false, defaultValue = "All") String dept,
            @RequestParam(required = false, defaultValue = "All") String batch,
            @RequestParam(required = false, defaultValue = "") String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        Integer academicYear = LeaderboardService.inferAcademicYearFromBatch(batch);
        Pageable pageable = PageRequest.of(page, size, Sort.by("rank").ascending());
        return ResponseEntity.ok(PaginatedResponse.from(leaderboardService.getCollegeToppers(dept, academicYear, query, pageable)));
    }

    @GetMapping("/leetcode")
    public ResponseEntity<List<LeaderboardRowDto>> getLeetcodeLeaderboard(
            @RequestParam(required = false, defaultValue = "All") String dept,
            @RequestParam(required = false, defaultValue = "All") String batch,
            @RequestParam(required = false, defaultValue = "All") String gender,
            @RequestParam(required = false, defaultValue = "") String query,
            @RequestParam(required = false, defaultValue = "global_rank") String sortBy
    ) {
        return ResponseEntity.ok(leaderboardService.getLeaderboard("leetcode", dept, batch, gender, query, sortBy));
    }

    @GetMapping("/pgp")
    public ResponseEntity<List<LeaderboardRowDto>> getPgpLeaderboard(
            @RequestParam(required = false, defaultValue = "All") String dept,
            @RequestParam(required = false, defaultValue = "All") String batch,
            @RequestParam(required = false, defaultValue = "All") String gender,
            @RequestParam(required = false, defaultValue = "") String query,
            @RequestParam(required = false, defaultValue = "points") String sortBy
    ) {
        return ResponseEntity.ok(leaderboardService.getLeaderboard("pgp", dept, batch, gender, query, sortBy));
    }

    @GetMapping("/weekly")
    public ResponseEntity<List<LeaderboardRowDto>> getWeeklyLeaderboard(
            @RequestParam(required = false, defaultValue = "All") String dept,
            @RequestParam(required = false, defaultValue = "All") String batch,
            @RequestParam(required = false, defaultValue = "All") String gender,
            @RequestParam(required = false, defaultValue = "") String query,
            @RequestParam(required = false, defaultValue = "score") String sortBy
    ) {
        return ResponseEntity.ok(leaderboardService.getLeaderboard("weekly", dept, batch, gender, query, sortBy));
    }

    @GetMapping("/overall")
    public ResponseEntity<List<LeaderboardRowDto>> getOverallLeaderboard(
            @RequestParam(required = false, defaultValue = "All") String dept,
            @RequestParam(required = false, defaultValue = "All") String batch,
            @RequestParam(required = false, defaultValue = "All") String gender,
            @RequestParam(required = false, defaultValue = "") String query,
            @RequestParam(required = false, defaultValue = "rank") String sortBy
    ) {
        return ResponseEntity.ok(leaderboardService.getLeaderboard("overall", dept, batch, gender, query, sortBy));
    }

    @GetMapping("/podium")
    public ResponseEntity<List<LeaderboardRowDto>> getPodium(
            @RequestParam(required = false, defaultValue = "overall") String type,
            @RequestParam(required = false, defaultValue = "All") String dept,
            @RequestParam(required = false, defaultValue = "All") String batch,
            @RequestParam(required = false, defaultValue = "All") String gender
    ) {
        return ResponseEntity.ok(leaderboardService.getPodium(type, dept, batch, gender));
    }
}
