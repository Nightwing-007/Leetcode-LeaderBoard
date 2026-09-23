package com.sece.leaderboard.service;

import com.sece.leaderboard.entity.LeetCodeProfile;
import com.sece.leaderboard.entity.Student;
import com.sece.leaderboard.repository.LeetCodeProfileRepository;
import com.sece.leaderboard.repository.StudentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class LeetCodeSyncService {

    private static final Logger log = LoggerFactory.getLogger(LeetCodeSyncService.class);

    private final StudentRepository studentRepository;
    private final LeetCodeProfileRepository leetCodeProfileRepository;
    private final RestTemplate restTemplate;

    private static final String LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql";

    public LeetCodeSyncService(StudentRepository studentRepository,
                               LeetCodeProfileRepository leetCodeProfileRepository,
                               RestTemplate restTemplate) {
        this.studentRepository = studentRepository;
        this.leetCodeProfileRepository = leetCodeProfileRepository;
        this.restTemplate = restTemplate;
    }

    @Async
    @Transactional
    public void syncAllLeetcodeProfiles() {
        log.info("Starting background LeetCode profiles sync...");
        List<Student> students = studentRepository.findAll();

        int syncedCount = 0;
        for (Student student : students) {
            LeetCodeProfile profile = student.getLeetCodeProfile();
            if (profile != null && profile.getLeetcodeUsername() != null && !profile.getLeetcodeUsername().isBlank()) {
                try {
                    syncSingleUser(profile);
                    syncedCount++;
                    Thread.sleep(1000);
                } catch (Exception e) {
                    log.warn("Failed to sync LeetCode stats for user: {}", profile.getLeetcodeUsername(), e);
                }
            }
        }
        log.info("Finished LeetCode sync. Total synced: {}", syncedCount);
    }

    public void syncSingleUser(LeetCodeProfile profile) {
        String username = profile.getLeetcodeUsername().trim();
        log.info("Syncing LeetCode stats for: {}", username);

        String graphqlQuery = """
            query getUserProfile($username: String!) {
              matchedUser(username: $username) {
                username
                profile {
                  ranking
                }
                submitStats: submitStatsGlobal {
                  acSubmissionNum {
                    difficulty
                    count
                  }
                }
              }
              userContestRanking(username: $username) {
                attendedContestsCount
                rating
                globalRanking
                topPercentage
              }
            }
        """;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");

        Map<String, Object> body = Map.of(
                "query", graphqlQuery,
                "variables", Map.of("username", username)
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(LEETCODE_GRAPHQL_URL, request, Map.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> data = (Map<String, Object>) response.getBody().get("data");
                if (data != null) {
                    Map<String, Object> matchedUser = (Map<String, Object>) data.get("matchedUser");
                    Map<String, Object> contestRanking = (Map<String, Object>) data.get("userContestRanking");

                    if (matchedUser != null) {
                        Map<String, Object> submitStats = (Map<String, Object>) matchedUser.get("submitStats");
                        if (submitStats != null) {
                            List<Map<String, Object>> acNums = (List<Map<String, Object>>) submitStats.get("acSubmissionNum");
                            if (acNums != null) {
                                for (Map<String, Object> item : acNums) {
                                    String diff = (String) item.get("difficulty");
                                    Number count = (Number) item.get("count");
                                    int val = count != null ? count.intValue() : 0;
                                    if ("All".equalsIgnoreCase(diff)) profile.setSolvedTotal(val);
                                    else if ("Easy".equalsIgnoreCase(diff)) profile.setSolvedEasy(val);
                                    else if ("Medium".equalsIgnoreCase(diff)) profile.setSolvedMedium(val);
                                    else if ("Hard".equalsIgnoreCase(diff)) profile.setSolvedHard(val);
                                }
                            }
                        }
                    }

                    if (contestRanking != null) {
                        Number rating = (Number) contestRanking.get("rating");
                        Number attended = (Number) contestRanking.get("attendedContestsCount");
                        Number globalRank = (Number) contestRanking.get("globalRanking");
                        Number topPct = (Number) contestRanking.get("topPercentage");

                        if (rating != null) profile.setContestRating(BigDecimal.valueOf(rating.doubleValue()));
                        if (attended != null) profile.setContestsAttended(attended.intValue());
                        if (globalRank != null) profile.setGlobalRank(globalRank.longValue());
                        if (topPct != null) profile.setTopPercentage(topPct + "%");
                    }

                    profile.setLastSyncedAt(LocalDateTime.now());
                    leetCodeProfileRepository.save(profile);
                }
            }
        } catch (Exception e) {
            log.warn("Could not query LeetCode GraphQL for {}", username, e);
        }
    }
}
