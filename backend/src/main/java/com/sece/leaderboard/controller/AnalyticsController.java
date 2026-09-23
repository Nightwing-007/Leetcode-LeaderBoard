package com.sece.leaderboard.controller;

import com.sece.leaderboard.dto.AnalyticsSummaryDto;
import com.sece.leaderboard.dto.DepartmentStatsDto;
import com.sece.leaderboard.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/summary")
    public ResponseEntity<AnalyticsSummaryDto> getSummary() {
        return ResponseEntity.ok(analyticsService.getSummary());
    }

    @GetMapping("/department-comparison")
    public ResponseEntity<List<DepartmentStatsDto>> getDepartmentComparisons() {
        return ResponseEntity.ok(analyticsService.getDepartmentComparisons());
    }
}
