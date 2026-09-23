package com.sece.leaderboard.controller;

import com.sece.leaderboard.dto.LeaderboardRowDto;
import com.sece.leaderboard.service.LeaderboardService;
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
            @RequestParam(required = false, defaultValue = "points") String sortBy
    ) {
        return ResponseEntity.ok(leaderboardService.getLeaderboard("pgp", dept, batch, gender, query, sortBy));
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
            @RequestParam(required = false, defaultValue = "leetcode") String type,
            @RequestParam(required = false, defaultValue = "All") String dept,
            @RequestParam(required = false, defaultValue = "All") String batch
    ) {
        return ResponseEntity.ok(leaderboardService.getPodium(type, dept, batch));
    }
}
