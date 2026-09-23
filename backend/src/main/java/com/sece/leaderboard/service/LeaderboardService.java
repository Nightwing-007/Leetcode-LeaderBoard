package com.sece.leaderboard.service;

import com.sece.leaderboard.dto.LeaderboardRowDto;
import com.sece.leaderboard.entity.LeetCodeProfile;
import com.sece.leaderboard.entity.PgpScore;
import com.sece.leaderboard.entity.Student;
import com.sece.leaderboard.repository.StudentRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LeaderboardService {

    private final StudentRepository studentRepository;

    public LeaderboardService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    public List<LeaderboardRowDto> getLeaderboard(
            String viewType,
            String dept,
            String batch,
            String gender,
            String query,
            String sortBy
    ) {
        List<Student> students = studentRepository.findAllFiltered(
                dept != null ? dept : "All",
                batch != null ? batch : "All",
                gender != null ? gender : "All",
                query != null ? query.trim() : ""
        );

        List<LeaderboardRowDto> rows = students.stream()
                .map(this::mapToRowDto)
                .collect(Collectors.toList());

        Comparator<LeaderboardRowDto> comparator = getComparator(viewType, sortBy);
        rows.sort(comparator);

        for (int i = 0; i < rows.size(); i++) {
            rows.get(i).setRank(i + 1);
        }

        return rows;
    }

    public List<LeaderboardRowDto> getPodium(String viewType, String dept, String batch) {
        List<LeaderboardRowDto> full = getLeaderboard(viewType, dept, batch, "All", "", "rank");
        return full.stream().limit(3).collect(Collectors.toList());
    }

    private Comparator<LeaderboardRowDto> getComparator(String viewType, String sortBy) {
        if ("leetcode".equalsIgnoreCase(viewType)) {
            if ("rating".equalsIgnoreCase(sortBy)) {
                return Comparator.comparing(LeaderboardRowDto::getLcContestRating, Comparator.nullsLast(Comparator.reverseOrder()));
            } else if ("solved".equalsIgnoreCase(sortBy)) {
                return Comparator.comparing(LeaderboardRowDto::getLcSolvedTotal, Comparator.nullsLast(Comparator.reverseOrder()));
            } else if ("contests".equalsIgnoreCase(sortBy)) {
                return Comparator.comparing(LeaderboardRowDto::getLcContestsAttended, Comparator.nullsLast(Comparator.reverseOrder()));
            } else if ("global_rank".equalsIgnoreCase(sortBy) || "rank".equalsIgnoreCase(sortBy)) {
                return Comparator.comparing(r -> (r.getLcGlobalRank() == null || r.getLcGlobalRank() <= 0) ? Long.MAX_VALUE : r.getLcGlobalRank());
            }
        } else if ("pgp".equalsIgnoreCase(viewType)) {
            if ("solved".equalsIgnoreCase(sortBy)) {
                return Comparator.comparing(LeaderboardRowDto::getPgpProgramsSolved, Comparator.nullsLast(Comparator.reverseOrder()));
            } else if ("dc".equalsIgnoreCase(sortBy)) {
                return Comparator.comparing(LeaderboardRowDto::getPgpDc, Comparator.nullsLast(Comparator.reverseOrder()));
            } else if ("skillrack_rank".equalsIgnoreCase(sortBy)) {
                return Comparator.comparing(r -> (r.getPgpSkillrackRank() == null || r.getPgpSkillrackRank() <= 0) ? Long.MAX_VALUE : r.getPgpSkillrackRank());
            } else {
                return Comparator.comparing(LeaderboardRowDto::getPgpPoints, Comparator.nullsLast(Comparator.reverseOrder()));
            }
        } else if ("weekly".equalsIgnoreCase(viewType)) {
            if ("code".equalsIgnoreCase(sortBy) || "weekly_code_score".equalsIgnoreCase(sortBy)) {
                return Comparator.comparing(LeaderboardRowDto::getWeeklyCodeScore, Comparator.nullsLast(Comparator.reverseOrder()));
            } else if ("mcq".equalsIgnoreCase(sortBy) || "weekly_mcq_score".equalsIgnoreCase(sortBy)) {
                return Comparator.comparing(LeaderboardRowDto::getWeeklyMcqScore, Comparator.nullsLast(Comparator.reverseOrder()));
            } else if ("rank".equalsIgnoreCase(sortBy) || "weekly_rank".equalsIgnoreCase(sortBy)) {
                return Comparator.comparing(r -> (r.getWeeklyRank() == null || r.getWeeklyRank() <= 0) ? Integer.MAX_VALUE : r.getWeeklyRank());
            } else {
                return Comparator.comparing(LeaderboardRowDto::getWeeklyScore, Comparator.nullsLast(Comparator.reverseOrder()));
            }
        }

        return Comparator.comparing(LeaderboardRowDto::getCompositeScore, Comparator.nullsLast(Comparator.reverseOrder()));
    }

    private LeaderboardRowDto mapToRowDto(Student s) {
        LeetCodeProfile lc = s.getLeetCodeProfile();
        PgpScore pgp = s.getPgpScore();

        LeaderboardRowDto dto = new LeaderboardRowDto();
        dto.setId(s.getId());
        dto.setRollNo(s.getRollNo());
        dto.setName(s.getName());
        dto.setDepartment(s.getDepartmentCode());
        dto.setBatch(s.getBatchYear());
        dto.setSection(s.getSection());
        dto.setGender(s.getGender());

        // Weekly Assessment Mapping
        dto.setWeeklyScore(s.getWeeklyScore());
        dto.setWeeklyRank(s.getWeeklyRank());
        dto.setWeeklyCodeScore(s.getWeeklyCodeScore());
        dto.setWeeklyMcqScore(s.getWeeklyMcqScore());
        dto.setWeeklyTestName(s.getWeeklyTestName());

        long lcScore = 0;
        if (lc != null) {
            dto.setLeetcodeId(lc.getLeetcodeUsername());
            dto.setLcGlobalRank(lc.getGlobalRank());
            dto.setLcContestRating(lc.getContestRating());
            dto.setLcContestsAttended(lc.getContestsAttended());
            dto.setLcTopPercentage(lc.getTopPercentage());
            dto.setLcSolvedTotal(lc.getSolvedTotal());
            dto.setLcSolvedEasy(lc.getSolvedEasy());
            dto.setLcSolvedMedium(lc.getSolvedMedium());
            dto.setLcSolvedHard(lc.getSolvedHard());

            double rating = lc.getContestRating() != null ? lc.getContestRating().doubleValue() : 1500.0;
            int contests = lc.getContestsAttended() != null ? lc.getContestsAttended() : 0;
            int solved = lc.getSolvedTotal() != null ? lc.getSolvedTotal() : 0;
            long rank = lc.getGlobalRank() != null ? lc.getGlobalRank() : 100000;
            double rankBonus = Math.max(0, 100000 - rank) * 0.05;

            lcScore = Math.round((rating * 2.0) + (contests * 25.0) + (solved * 1.5) + rankBonus);
        }

        long pgpPoints = 0;
        if (pgp != null) {
            dto.setPgpProgramsSolved(pgp.getProgramsSolved());
            dto.setPgpCodeTests(pgp.getCodeTests());
            dto.setPgpCodeTracks(pgp.getCodeTracks());
            dto.setPgpCodeTutor(pgp.getCodeTutor());
            dto.setPgpDc(pgp.getDc());
            dto.setPgpDt(pgp.getDt());
            dto.setPgpAptitudeScore(pgp.getAptitudeScore());
            dto.setPgpPoints(pgp.getTotalPoints());
            dto.setPgpSkillrackRank(pgp.getSkillrackRank());

            pgpPoints = pgp.getTotalPoints() != null ? pgp.getTotalPoints() : 0;
        }

        long composite = Math.max(lcScore, pgpPoints);
        if (lcScore > 0 && pgpPoints > 0) {
            composite = Math.round((lcScore * 0.6) + (pgpPoints * 0.4));
        }
        dto.setCompositeScore(composite);

        return dto;
    }
}
