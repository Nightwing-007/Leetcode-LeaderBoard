package com.sece.leaderboard.leaderboard;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableCaching
@EnableScheduling
@ComponentScan(basePackages = "com.sece.leaderboard")
@EntityScan(basePackages = "com.sece.leaderboard.entity")
@EnableJpaRepositories(basePackages = "com.sece.leaderboard.repository")
public class LeaderboardApplication {

    public static void main(String[] args) {
        SpringApplication.run(LeaderboardApplication.class, args);
    }
}
