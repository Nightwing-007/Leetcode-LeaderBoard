package com.sece.leaderboard.service;

import com.sece.leaderboard.dto.LoginRequest;
import com.sece.leaderboard.dto.LoginResponse;
import com.sece.leaderboard.util.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final String configuredUsername;
    private final String configuredPassword;
    private final JwtUtil jwtUtil;

    public AuthService(
            @Value("${admin.username:admin}") String configuredUsername,
            @Value("${admin.password:sece2026}") String configuredPassword,
            JwtUtil jwtUtil) {
        this.configuredUsername = configuredUsername;
        this.configuredPassword = configuredPassword;
        this.jwtUtil = jwtUtil;
    }

    public LoginResponse authenticate(LoginRequest loginRequest) {
        if (loginRequest == null || loginRequest.getUsername() == null || loginRequest.getPassword() == null) {
            throw new IllegalArgumentException("Username and password must not be empty");
        }

        String username = loginRequest.getUsername().trim();
        String password = loginRequest.getPassword().trim();

        if (!configuredUsername.equals(username) || !configuredPassword.equals(password)) {
            throw new SecurityException("Invalid username or password");
        }

        String token = jwtUtil.generateToken(username);
        long expiresInSeconds = jwtUtil.getExpirationMs() / 1000;

        return new LoginResponse(token, "Bearer", username, expiresInSeconds);
    }

    public boolean validateToken(String token) {
        return jwtUtil.validateToken(token);
    }
}
