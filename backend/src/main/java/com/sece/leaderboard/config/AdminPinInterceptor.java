package com.sece.leaderboard.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AdminPinInterceptor implements HandlerInterceptor {

    @Value("${app.admin.pin:sece2026}")
    private String configuredPin;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Allow CORS pre-flight OPTIONS requests
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String pinHeader = request.getHeader("X-Admin-PIN");
        if (pinHeader == null || !pinHeader.trim().equals(configuredPin.trim())) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Unauthorized: Invalid or missing Admin PIN\"}");
            return false;
        }
        return true;
    }
}
