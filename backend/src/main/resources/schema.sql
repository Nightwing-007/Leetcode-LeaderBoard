CREATE TABLE IF NOT EXISTS coding_platforms (
    id SERIAL PRIMARY KEY,
    platform_name VARCHAR(50) UNIQUE NOT NULL,
    weight_percentage NUMERIC(5,2) DEFAULT 20.00,
    is_active BOOLEAN DEFAULT TRUE
);

INSERT INTO coding_platforms (platform_name, weight_percentage) VALUES 
    ('LeetCode', 20.00), ('SkillRack', 20.00), ('AtCoder', 20.00), ('Codeforces', 20.00), ('Degre.AI', 20.00)
ON CONFLICT (platform_name) DO NOTHING;

CREATE TABLE IF NOT EXISTS students (
    id BIGSERIAL PRIMARY KEY,
    register_number VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    academic_year INT NOT NULL CHECK (academic_year IN (1, 2, 3, 4)),
    department VARCHAR(50) NOT NULL,
    section VARCHAR(10),
    batch VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

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
    rank BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_students_reg_no ON students(register_number);
CREATE INDEX IF NOT EXISTS idx_students_dept ON students(department);
CREATE INDEX IF NOT EXISTS idx_students_year ON students(academic_year);
CREATE INDEX IF NOT EXISTS idx_students_section ON students(section);
CREATE INDEX IF NOT EXISTS idx_students_composite ON students(department, academic_year, section);
CREATE INDEX IF NOT EXISTS idx_perf_student_platform ON platform_performance(student_id, platform_id);

CREATE OR REPLACE VIEW v_student_overall_scores AS
WITH platform_max_min AS (
    SELECT platform_id, NULLIF(MAX(problems_solved + rating + assessment_score), 0) as max_val, MIN(problems_solved + rating + assessment_score) as min_val
    FROM platform_performance GROUP BY platform_id
),
normalized_performance AS (
    SELECT pp.student_id, pp.platform_id, cp.weight_percentage,
        COALESCE((((pp.problems_solved + pp.rating + pp.assessment_score) - pmm.min_val) / (pmm.max_val - pmm.min_val)) * (cp.weight_percentage), 0) AS weighted_score
    FROM platform_performance pp
    JOIN coding_platforms cp ON pp.platform_id = cp.id
    JOIN platform_max_min pmm ON pp.platform_id = pmm.platform_id
)
SELECT s.id AS student_id, s.register_number, s.name, s.academic_year, s.department, s.section, COALESCE(SUM(np.weighted_score), 0) AS overall_score
FROM students s LEFT JOIN normalized_performance np ON s.id = np.student_id GROUP BY s.id;

CREATE OR REPLACE VIEW v_rank_college_toppers AS SELECT RANK() OVER (ORDER BY overall_score DESC) as rank, student_id, register_number, name, department, academic_year, section, overall_score FROM v_student_overall_scores;
CREATE OR REPLACE VIEW v_rank_year_toppers AS SELECT RANK() OVER (PARTITION BY academic_year ORDER BY overall_score DESC) as rank, student_id, register_number, name, department, academic_year, section, overall_score FROM v_student_overall_scores;
CREATE OR REPLACE VIEW v_rank_department_toppers AS SELECT RANK() OVER (PARTITION BY department ORDER BY overall_score DESC) as rank, student_id, register_number, name, department, academic_year, section, overall_score FROM v_student_overall_scores;
CREATE OR REPLACE VIEW v_rank_department_year_toppers AS SELECT RANK() OVER (PARTITION BY department, academic_year ORDER BY overall_score DESC) as rank, student_id, register_number, name, department, academic_year, section, overall_score FROM v_student_overall_scores;
CREATE OR REPLACE VIEW v_rank_class_toppers AS
WITH ranked_classes AS (
    SELECT RANK() OVER (PARTITION BY department, academic_year, section ORDER BY overall_score DESC) as class_rank,
    COUNT(*) OVER (PARTITION BY department, academic_year, section) as class_size,
    student_id, register_number, name, department, academic_year, section, overall_score FROM v_student_overall_scores
)
SELECT class_rank, student_id, register_number, name, department, academic_year, section, overall_score, class_size, ROUND(((class_size - class_rank) / class_size::numeric) * 100, 2) AS percentile FROM ranked_classes;
