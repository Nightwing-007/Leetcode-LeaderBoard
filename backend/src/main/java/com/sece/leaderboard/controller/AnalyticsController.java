package com.sece.leaderboard.controller;

import com.sece.leaderboard.dto.AnalyticsSummaryDto;
import com.sece.leaderboard.dto.DepartmentStatsDto;
import com.sece.leaderboard.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controller for Institutional Analytics and Dashboard Statistics.
 * Endpoints:
 * - GET /api/v1/analytics/summary
 * - GET /api/v1/analytics/statistics
 * - GET /api/v1/analytics/department-comparison
 * - GET /api/v1/dashboard/statistics
 */
@RestController
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping({"/api/v1/analytics/summary", "/api/v1/analytics/statistics", "/api/v1/dashboard/statistics"})
    public ResponseEntity<AnalyticsSummaryDto> getSummary() {
        return ResponseEntity.ok(analyticsService.getSummary());
    }

    @GetMapping("/api/v1/analytics/department-comparison")
    public ResponseEntity<List<DepartmentStatsDto>> getDepartmentComparisons() {
        return ResponseEntity.ok(analyticsService.getDepartmentComparisons());
    }
}
