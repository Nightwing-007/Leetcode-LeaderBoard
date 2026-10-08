package com.sece.leaderboard.service;

import com.sece.leaderboard.entity.Student;
import com.sece.leaderboard.repository.StudentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

@Service
public class LeetCodeSyncService {

    private static final Logger log = LoggerFactory.getLogger(LeetCodeSyncService.class);

    private final StudentRepository studentRepository;
    private final RestTemplate restTemplate;

    public LeetCodeSyncService(StudentRepository studentRepository,
                               RestTemplate restTemplate) {
        this.studentRepository = studentRepository;
        this.restTemplate = restTemplate;
    }

    // TODO: PHASE 2 REFACTOR
    /*
    Legacy LeetCodeProfile sync logic:
    public void syncAllLeetcodeProfiles() {
        List<Student> students = studentRepository.findAll();
        for (Student student : students) {
            LeetCodeProfile profile = student.getLeetCodeProfile();
            ...
        }
    }
    */

    @Async
    @Transactional
    public void syncAllLeetcodeProfiles() {
        log.info("LeetCode sync paused pending Phase 2 refactoring with platform_accounts and platform_performance.");
    }
}
