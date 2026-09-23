-- =============================================================================
-- Sri Eshwar College of Engineering - Coding & PGP Leaderboard Database Schema
-- Database: PostgreSQL
-- =============================================================================

-- 1. Core Students Table
CREATE TABLE IF NOT EXISTS students (
    id BIGSERIAL PRIMARY KEY,
    roll_no VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    department_code VARCHAR(20) NOT NULL,
    batch_year VARCHAR(20) NOT NULL,
    section VARCHAR(20),
    sub_batch VARCHAR(30),
    gender VARCHAR(10) DEFAULT 'Male',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_students_roll_no ON students(roll_no);
CREATE INDEX IF NOT EXISTS idx_students_dept ON students(department_code);
CREATE INDEX IF NOT EXISTS idx_students_batch ON students(batch_year);

-- 2. LeetCode Profiles Table
CREATE TABLE IF NOT EXISTS leetcode_profiles (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT UNIQUE NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    leetcode_username VARCHAR(100),
    global_rank BIGINT DEFAULT 999999,
    contest_rating NUMERIC(8, 2) DEFAULT 1500.00,
    contests_attended INT DEFAULT 0,
    top_percentage VARCHAR(20) DEFAULT 'N/A',
    solved_total INT DEFAULT 0,
    solved_easy INT DEFAULT 0,
    solved_medium INT DEFAULT 0,
    solved_hard INT DEFAULT 0,
    last_synced_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lc_global_rank ON leetcode_profiles(global_rank ASC);
CREATE INDEX IF NOT EXISTS idx_lc_contest_rating ON leetcode_profiles(contest_rating DESC);
CREATE INDEX IF NOT EXISTS idx_lc_solved_total ON leetcode_profiles(solved_total DESC);

-- 3. PGP / SkillRack Scores Table
CREATE TABLE IF NOT EXISTS pgp_scores (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT UNIQUE NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    programs_solved INT DEFAULT 0,
    code_tests INT DEFAULT 0,
    code_tracks INT DEFAULT 0,
    code_tutor INT DEFAULT 0,
    dc INT DEFAULT 0,
    dt INT DEFAULT 0,
    aptitude_score INT DEFAULT 0,
    total_points INT DEFAULT 0,
    skillrack_rank BIGINT DEFAULT 0,
    report_date DATE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pgp_total_points ON pgp_scores(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_pgp_skillrack_rank ON pgp_scores(skillrack_rank ASC);

-- 4. Daily / Weekly Ranking Snapshots Table
CREATE TABLE IF NOT EXISTS ranking_snapshots (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL,
    lc_global_rank BIGINT,
    lc_contest_rating NUMERIC(8, 2),
    lc_solved_total INT,
    pgp_points INT,
    skillrack_rank BIGINT
);

CREATE INDEX IF NOT EXISTS idx_snapshots_date_student ON ranking_snapshots(snapshot_date, student_id);
