CREATE TABLE IF NOT EXISTS coding_platforms (
    id SERIAL PRIMARY KEY,
    platform_name VARCHAR(50) UNIQUE NOT NULL,
    weight_percentage NUMERIC(5,2) DEFAULT 20.00,
    is_active BOOLEAN DEFAULT TRUE
);

INSERT INTO coding_platforms (platform_name, weight_percentage) VALUES 
    ('LeetCode', 30.00), ('SkillRack', 10.00), ('AtCoder', 20.00), ('Codeforces', 20.00), ('Degre.AI', 20.00)
ON CONFLICT (platform_name) DO UPDATE SET weight_percentage = EXCLUDED.weight_percentage;

CREATE TABLE IF NOT EXISTS students (
    id BIGSERIAL PRIMARY KEY,
    register_number VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    academic_year INT NOT NULL CHECK (academic_year IN (1, 2, 3, 4)),
    department VARCHAR(50) NOT NULL,
    section VARCHAR(10),
    batch VARCHAR(20) NOT NULL,
    gender VARCHAR(20) DEFAULT 'Male',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE students ADD COLUMN IF NOT EXISTS gender VARCHAR(20) DEFAULT 'Male';

CREATE TABLE IF NOT EXISTS platform_accounts (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT REFERENCES students(id) ON DELETE CASCADE,
    platform_id INT REFERENCES coding_platforms(id) ON DELETE CASCADE,
    platform_username VARCHAR(150) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (student_id, platform_id)
);

CREATE TABLE IF NOT EXISTS platform_performance (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT REFERENCES students(id) ON DELETE CASCADE,
    platform_id INT REFERENCES coding_platforms(id) ON DELETE CASCADE,
    problems_solved INT DEFAULT 0,
    rating NUMERIC(10,2) DEFAULT 0,
    assessment_score NUMERIC(10,2) DEFAULT 0,
    global_rank BIGINT,
    assessment_rank BIGINT,
    contest_rating NUMERIC(10,2) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (student_id, platform_id)
);

CREATE TABLE IF NOT EXISTS assessments (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT REFERENCES students(id) ON DELETE CASCADE,
    platform_id INT REFERENCES coding_platforms(id) ON DELETE CASCADE,
    assessment_name VARCHAR(150) NOT NULL,
    assessment_date DATE NOT NULL,
    score NUMERIC(10,2),
    rating NUMERIC(10,2),
    mcq_score NUMERIC(10,2),
    rank BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE assessments ADD COLUMN IF NOT EXISTS mcq_score NUMERIC(10,2);

CREATE INDEX IF NOT EXISTS idx_students_reg_no ON students(register_number);
CREATE INDEX IF NOT EXISTS idx_students_dept ON students(department);
CREATE INDEX IF NOT EXISTS idx_students_year ON students(academic_year);
CREATE INDEX IF NOT EXISTS idx_students_section ON students(section);
CREATE INDEX IF NOT EXISTS idx_students_composite ON students(department, academic_year, section);
CREATE INDEX IF NOT EXISTS idx_perf_student_platform ON platform_performance(student_id, platform_id);

DROP VIEW IF EXISTS v_rank_class_toppers CASCADE;
DROP VIEW IF EXISTS v_rank_department_year_toppers CASCADE;
DROP VIEW IF EXISTS v_rank_department_toppers CASCADE;
DROP VIEW IF EXISTS v_rank_year_toppers CASCADE;
DROP VIEW IF EXISTS v_rank_college_toppers CASCADE;
DROP VIEW IF EXISTS v_student_overall_scores CASCADE;

CREATE OR REPLACE VIEW v_student_overall_scores AS
WITH platform_presence AS (
    SELECT
        COUNT(*) FILTER (WHERE UPPER(cp.platform_name) = 'LEETCODE' AND (pp.problems_solved > 0 OR pp.rating > 0 OR pp.global_rank > 0)) > 0 AS has_lc,
        COUNT(*) FILTER (WHERE UPPER(cp.platform_name) = 'SKILLRACK' AND (pp.problems_solved > 0 OR pp.rating > 0 OR pp.global_rank > 0)) > 0 AS has_sr,
        COUNT(*) FILTER (WHERE UPPER(cp.platform_name) = 'ATCODER' AND (pp.problems_solved > 0 OR pp.rating > 0)) > 0 AS has_ac,
        COUNT(*) FILTER (WHERE UPPER(cp.platform_name) = 'CODEFORCES' AND (pp.problems_solved > 0 OR pp.rating > 0)) > 0 AS has_cf,
        COUNT(*) FILTER (WHERE UPPER(cp.platform_name) LIKE 'DEGRE%' AND (pp.problems_solved > 0 OR pp.assessment_score > 0)) > 0 AS has_dg
    FROM coding_platforms cp
    LEFT JOIN platform_performance pp ON pp.platform_id = cp.id
),
platform_weights AS (
    SELECT
        COALESCE(MAX(CASE WHEN UPPER(platform_name) = 'LEETCODE' THEN weight_percentage END), 30.00) AS w_lc,
        COALESCE(MAX(CASE WHEN UPPER(platform_name) = 'SKILLRACK' THEN weight_percentage END), 10.00) AS w_sr,
        COALESCE(MAX(CASE WHEN UPPER(platform_name) = 'ATCODER' THEN weight_percentage END), 20.00) AS w_ac,
        COALESCE(MAX(CASE WHEN UPPER(platform_name) = 'CODEFORCES' THEN weight_percentage END), 20.00) AS w_cf,
        COALESCE(MAX(CASE WHEN UPPER(platform_name) LIKE 'DEGRE%' THEN weight_percentage END), 20.00) AS w_dg
    FROM coding_platforms
),
effective_weights AS (
    SELECT
        CASE WHEN pp.has_lc THEN pw.w_lc ELSE 0.0 END AS eff_w_lc,
        CASE WHEN pp.has_sr THEN pw.w_sr ELSE 0.0 END AS eff_w_sr,
        CASE WHEN pp.has_ac THEN pw.w_ac ELSE 0.0 END AS eff_w_ac,
        CASE WHEN pp.has_cf THEN pw.w_cf ELSE 0.0 END AS eff_w_cf,
        CASE WHEN pp.has_dg THEN pw.w_dg ELSE 0.0 END AS eff_w_dg,
        NULLIF(
            (CASE WHEN pp.has_lc THEN pw.w_lc ELSE 0.0 END) +
            (CASE WHEN pp.has_sr THEN pw.w_sr ELSE 0.0 END) +
            (CASE WHEN pp.has_ac THEN pw.w_ac ELSE 0.0 END) +
            (CASE WHEN pp.has_cf THEN pw.w_cf ELSE 0.0 END) +
            (CASE WHEN pp.has_dg THEN pw.w_dg ELSE 0.0 END),
            0.0
        ) AS total_eff_weight
    FROM platform_presence pp
    CROSS JOIN platform_weights pw
),
leetcode_pct AS (
    SELECT
        s.id AS student_id,
        PERCENT_RANK() OVER (
            ORDER BY 
                COALESCE(pp.contest_rating, pp.rating, 0) ASC,
                COALESCE(pp.problems_solved, 0) ASC,
                CASE WHEN pp.global_rank IS NOT NULL AND pp.global_rank > 0 THEN pp.global_rank ELSE 9999999 END DESC
                NULLS FIRST
        ) AS pct
    FROM students s
    LEFT JOIN platform_performance pp
        ON pp.student_id = s.id
       AND pp.platform_id = (SELECT id FROM coding_platforms WHERE UPPER(platform_name) = 'LEETCODE' LIMIT 1)
),
skillrack_pct AS (
    SELECT
        s.id AS student_id,
        PERCENT_RANK() OVER (
            ORDER BY 
                COALESCE(pp.rating, 0) ASC,
                COALESCE(pp.problems_solved, 0) ASC,
                CASE WHEN pp.global_rank IS NOT NULL AND pp.global_rank > 0 THEN pp.global_rank ELSE 9999999 END DESC
                NULLS FIRST
        ) AS pct
    FROM students s
    LEFT JOIN platform_performance pp
        ON pp.student_id = s.id
       AND pp.platform_id = (SELECT id FROM coding_platforms WHERE UPPER(platform_name) = 'SKILLRACK' LIMIT 1)
),
codeforces_pct AS (
    SELECT
        s.id AS student_id,
        PERCENT_RANK() OVER (
            ORDER BY 
                COALESCE(pp.rating, 0) ASC,
                COALESCE(pp.problems_solved, 0) ASC 
                NULLS FIRST
        ) AS pct
    FROM students s
    LEFT JOIN platform_performance pp
        ON pp.student_id = s.id
       AND pp.platform_id = (SELECT id FROM coding_platforms WHERE UPPER(platform_name) = 'CODEFORCES' LIMIT 1)
),
atcoder_pct AS (
    SELECT
        s.id AS student_id,
        PERCENT_RANK() OVER (
            ORDER BY 
                COALESCE(pp.rating, 0) ASC,
                COALESCE(pp.problems_solved, 0) ASC 
                NULLS FIRST
        ) AS pct
    FROM students s
    LEFT JOIN platform_performance pp
        ON pp.student_id = s.id
       AND pp.platform_id = (SELECT id FROM coding_platforms WHERE UPPER(platform_name) = 'ATCODER' LIMIT 1)
),
degre_pct AS (
    SELECT
        s.id AS student_id,
        PERCENT_RANK() OVER (
            ORDER BY 
                COALESCE(pp.assessment_score, 0) ASC,
                COALESCE(pp.problems_solved, 0) ASC 
                NULLS FIRST
        ) AS pct
    FROM students s
    LEFT JOIN platform_performance pp
        ON pp.student_id = s.id
       AND pp.platform_id = (SELECT id FROM coding_platforms WHERE UPPER(platform_name) LIKE 'DEGRE%' LIMIT 1)
),
base_cumulative AS (
    SELECT
        s.id AS student_id,
        s.register_number,
        s.name,
        s.academic_year,
        s.department,
        s.section,
        COALESCE(s.gender, 'Male') AS gender,
        (
            (
                (COALESCE(lc.pct, 0) * ew.eff_w_lc) +
                (COALESCE(sr.pct, 0) * ew.eff_w_sr) +
                (COALESCE(ac.pct, 0) * ew.eff_w_ac) +
                (COALESCE(cf.pct, 0) * ew.eff_w_cf) +
                (COALESCE(dg.pct, 0) * ew.eff_w_dg)
            ) / COALESCE(ew.total_eff_weight, 100.0) * 100.0
        ) AS base_cumulative_score
    FROM students s
    CROSS JOIN effective_weights ew
    JOIN leetcode_pct lc ON lc.student_id = s.id
    JOIN skillrack_pct sr ON sr.student_id = s.id
    JOIN atcoder_pct ac ON ac.student_id = s.id
    JOIN codeforces_pct cf ON cf.student_id = s.id
    JOIN degre_pct dg ON dg.student_id = s.id
),
final_scores AS (
    SELECT
        student_id,
        register_number,
        name,
        academic_year,
        department,
        section,
        gender,
        base_cumulative_score,
        ROUND(base_cumulative_score::numeric, 2) AS ct_score
    FROM base_cumulative
)
SELECT
    student_id,
    register_number,
    name,
    academic_year,
    department,
    section,
    gender,
    ct_score AS overall_score,
    CASE
        WHEN ct_score >= 80.00 THEN 'Elite'
        WHEN ct_score >= 60.00 THEN 'Specialist'
        WHEN ct_score >= 40.00 THEN 'Challenger'
        WHEN ct_score >= 20.00 THEN 'Solver'
        ELSE 'Starter'
    END AS category
FROM final_scores;

CREATE OR REPLACE VIEW v_rank_college_toppers AS
SELECT
    RANK() OVER (ORDER BY overall_score DESC) as rank,
    student_id, register_number, name, department, academic_year, section, gender,
    overall_score, category
FROM v_student_overall_scores;

CREATE OR REPLACE VIEW v_rank_year_toppers AS
SELECT
    RANK() OVER (PARTITION BY academic_year ORDER BY overall_score DESC) as rank,
    student_id, register_number, name, department, academic_year, section, gender,
    overall_score, category
FROM v_student_overall_scores;

CREATE OR REPLACE VIEW v_rank_department_toppers AS
SELECT
    RANK() OVER (PARTITION BY department ORDER BY overall_score DESC) as rank,
    student_id, register_number, name, department, academic_year, section, gender,
    overall_score, category
FROM v_student_overall_scores;

CREATE OR REPLACE VIEW v_rank_department_year_toppers AS
SELECT
    RANK() OVER (PARTITION BY department, academic_year ORDER BY overall_score DESC) as rank,
    student_id, register_number, name, department, academic_year, section, gender,
    overall_score, category
FROM v_student_overall_scores;

CREATE OR REPLACE VIEW v_rank_class_toppers AS
WITH ranked_classes AS (
    SELECT
        RANK() OVER (PARTITION BY department, academic_year, section ORDER BY overall_score DESC) as class_rank,
        COUNT(*) OVER (PARTITION BY department, academic_year, section) as class_size,
        student_id, register_number, name, department, academic_year, section, gender,
        overall_score, category
    FROM v_student_overall_scores
)
SELECT
    class_rank, student_id, register_number, name, department, academic_year, section, gender,
    overall_score, category, class_size,
    ROUND(((class_size - class_rank) / NULLIF(class_size::numeric, 0)) * 100, 2) AS percentile
FROM ranked_classes;
