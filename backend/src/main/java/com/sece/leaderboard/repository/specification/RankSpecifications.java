package com.sece.leaderboard.repository.specification;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

/**
 * Reusable dynamic Specification builder for filtering read-only ranking entities by department,
 * academic year, section, and search query.
 */
public class RankSpecifications {

    public static <T> Specification<T> filter(String department, Integer academicYear, String section, String searchQuery) {
        return filter(department, academicYear, section, searchQuery, null);
    }

    public static <T> Specification<T> filter(String department, Integer academicYear, String section, String searchQuery, String gender) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (department != null && !department.isBlank() && !"All".equalsIgnoreCase(department)) {
                predicates.add(cb.equal(cb.lower(root.get("department")), department.trim().toLowerCase()));
            }

            if (academicYear != null) {
                predicates.add(cb.equal(root.get("academicYear"), academicYear));
            }

            if (section != null && !section.isBlank() && !"All".equalsIgnoreCase(section)) {
                predicates.add(cb.equal(cb.lower(root.get("section")), section.trim().toLowerCase()));
            }

            if (gender != null && !gender.isBlank() && !"All".equalsIgnoreCase(gender)) {
                predicates.add(cb.equal(cb.lower(root.get("gender")), gender.trim().toLowerCase()));
            }

            if (searchQuery != null && !searchQuery.isBlank()) {
                String pattern = "%" + searchQuery.trim().toLowerCase() + "%";
                Predicate nameMatch = cb.like(cb.lower(root.get("name")), pattern);
                Predicate regMatch = cb.like(cb.lower(root.get("registerNumber")), pattern);
                predicates.add(cb.or(nameMatch, regMatch));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
