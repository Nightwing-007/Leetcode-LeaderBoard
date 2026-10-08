-- =====================================================================
-- College Coding Performance Dashboard - PostgreSQL schema v2
-- PostgreSQL 13+
--
-- DESIGN:
--   students                     -> stable identity, PK = roll_no
--   assessment_cycles            -> one 5-week CT cycle
--   assessment_weeks             -> Week 1..Week 5
--   student_cycle_enrollment     -> historical dept/year/section
--   platforms                    -> master platform list
--   cycle_platform_config        -> scoring snapshot for each cycle
--   upload_batches / upload_errors
--   student_weekly_performance   -> RAW Excel data, never copied forward
--   student_weekly_ct_scores     -> optional weekly derived CT scores
--   student_weekly_ct_components -> weekly CT audit trail
--   student_cycle_ct_scores      -> FINAL CT score after Week 5
--
-- FINAL CT WEIGHTS:
--   LeetCode    30%
--   SkillRack   10%
--   Degre.AI    20%
--   AtCoder     20%
--   Codeforces  20%
--
-- Missing weekly data:
--   NULL / absent row means "not received".
--   The raw table is NEVER filled with previous values.
--   CT calculation uses the most recent previous non-NULL value.
--
-- FINAL CT:
--   Calculated only after all 5 weeks exist for the cycle.
--   It uses each platform's most recent available value through Week 5.
--   If a platform has never had a value, its weight is unavailable and
--   the remaining available weights are re-normalized.
-- =====================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS btree_gist;

-- =====================================================================
-- 0. HELPERS
-- =====================================================================

CREATE OR REPLACE FUNCTION trg_set_updated_at() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END $$;

-- =====================================================================
-- 1. STUDENTS
--    roll_no IS the student identity. No surrogate student id.
-- =====================================================================

CREATE TABLE students (
    roll_no       varchar(20)  PRIMARY KEY,
    student_name  varchar(120) NOT NULL,
    batch         smallint,
    department    varchar(30),
    year          smallint,
    section       varchar(5),
    is_active     boolean      NOT NULL DEFAULT true,
    created_at    timestamptz  NOT NULL DEFAULT now(),
    updated_at    timestamptz  NOT NULL DEFAULT now(),

    CONSTRAINT chk_roll_no_format
        CHECK (roll_no = upper(btrim(roll_no)) AND length(roll_no) > 0),
    CONSTRAINT chk_students_year
        CHECK (year IS NULL OR year BETWEEN 1 AND 6),
    CONSTRAINT chk_students_batch
        CHECK (batch IS NULL OR batch BETWEEN 2000 AND 2100)
);

CREATE INDEX idx_students_dept_year_section
    ON students (department, year, section);

CREATE INDEX idx_students_batch
    ON students (batch);

CREATE TRIGGER trg_students_updated
BEFORE UPDATE ON students
FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

-- =====================================================================
-- 2. ASSESSMENT CYCLES
--    Every CT cycle is exactly 5 weeks.
-- =====================================================================

CREATE TABLE assessment_cycles (
    cycle_id        integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cycle_name      varchar(60) NOT NULL UNIQUE,
    academic_year   varchar(9)  NOT NULL,
    weeks_in_cycle  smallint    NOT NULL DEFAULT 5,
    start_date      date        NOT NULL,
    end_date        date        NOT NULL,
    is_current      boolean     NOT NULL DEFAULT false,
    created_at      timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT chk_cycle_dates
        CHECK (end_date >= start_date),
    CONSTRAINT chk_cycle_weeks
        CHECK (weeks_in_cycle = 5),
    CONSTRAINT ex_cycle_no_overlap
        EXCLUDE USING gist (
            daterange(start_date, end_date, '[]') WITH &&
        )
);

CREATE UNIQUE INDEX uq_one_current_cycle
    ON assessment_cycles (is_current)
    WHERE is_current;

CREATE INDEX idx_cycles_academic_year
    ON assessment_cycles (academic_year);

-- =====================================================================
-- 3. ASSESSMENT WEEKS
-- =====================================================================

CREATE TABLE assessment_weeks (
    week_id      integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cycle_id     integer     NOT NULL
                 REFERENCES assessment_cycles (cycle_id) ON DELETE RESTRICT,
    week_number  smallint    NOT NULL,
    start_date   date        NOT NULL,
    end_date     date        NOT NULL,
    is_current   boolean     NOT NULL DEFAULT false,
    created_at   timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT uq_week_in_cycle
        UNIQUE (cycle_id, week_number),

    CONSTRAINT chk_week_number
        CHECK (week_number BETWEEN 1 AND 5),

    CONSTRAINT chk_week_dates
        CHECK (end_date >= start_date),

    CONSTRAINT ex_week_no_overlap
        EXCLUDE USING gist (
            daterange(start_date, end_date, '[]') WITH &&
        )
);

CREATE UNIQUE INDEX uq_one_current_week
    ON assessment_weeks (is_current)
    WHERE is_current;

CREATE INDEX idx_weeks_dates
    ON assessment_weeks (start_date, end_date);

-- =====================================================================
-- 4. HISTORICAL STUDENT ENROLLMENT FOR EACH CYCLE
--    Rankings MUST use this table, not current student values.
-- =====================================================================

CREATE TABLE student_cycle_enrollment (
    roll_no     varchar(20) NOT NULL
                REFERENCES students (roll_no)
                ON UPDATE CASCADE ON DELETE CASCADE,
    cycle_id    integer     NOT NULL
                REFERENCES assessment_cycles (cycle_id)
                ON DELETE RESTRICT,
    department  varchar(30) NOT NULL,
    year        smallint    NOT NULL,
    section     varchar(5)  NOT NULL,
    created_at  timestamptz NOT NULL DEFAULT now(),

    PRIMARY KEY (roll_no, cycle_id),

    CONSTRAINT chk_enroll_year
        CHECK (year BETWEEN 1 AND 6)
);

CREATE INDEX idx_enroll_cycle_dept_year_sec
    ON student_cycle_enrollment (cycle_id, department, year, section);

CREATE INDEX idx_enroll_cycle_dept_year
    ON student_cycle_enrollment (cycle_id, department, year);

-- =====================================================================
-- 5. GLOBAL PLATFORM MASTER
-- =====================================================================

CREATE TABLE platforms (
    platform_id       smallint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    platform_code     varchar(20)  NOT NULL UNIQUE,
    platform_name     varchar(40)  NOT NULL UNIQUE,
    default_weight    numeric(5,2) NOT NULL,
    default_score_metric varchar(40) NOT NULL,
    default_norm_min  numeric(12,2) NOT NULL,
    default_norm_max  numeric(12,2) NOT NULL,
    default_higher_is_better boolean NOT NULL DEFAULT true,
    is_active         boolean NOT NULL DEFAULT true,
    created_at        timestamptz NOT NULL DEFAULT now(),
    updated_at        timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT chk_platform_weight
        CHECK (default_weight >= 0 AND default_weight <= 100),

    CONSTRAINT chk_platform_norm
        CHECK (default_norm_max > default_norm_min),

    CONSTRAINT chk_platform_metric
        CHECK (default_score_metric ~ '^[a-z][a-z0-9_]*$')
);

CREATE INDEX idx_platforms_active
    ON platforms (is_active);

CREATE TRIGGER trg_platforms_updated
BEFORE UPDATE ON platforms
FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

-- =====================================================================
-- 6. CYCLE-SPECIFIC SCORING CONFIGURATION
--    IMPORTANT: this freezes weights/normalization for historical cycles.
-- =====================================================================

CREATE TABLE cycle_platform_config (
    cycle_id           integer NOT NULL
                       REFERENCES assessment_cycles (cycle_id)
                       ON DELETE CASCADE,
    platform_id        smallint NOT NULL
                       REFERENCES platforms (platform_id)
                       ON DELETE RESTRICT,
    weight             numeric(5,2) NOT NULL,
    score_metric       varchar(40) NOT NULL,
    norm_min           numeric(12,2) NOT NULL,
    norm_max           numeric(12,2) NOT NULL,
    higher_is_better   boolean NOT NULL DEFAULT true,
    is_enabled         boolean NOT NULL DEFAULT true,
    created_at         timestamptz NOT NULL DEFAULT now(),

    PRIMARY KEY (cycle_id, platform_id),

    CONSTRAINT chk_cycle_cfg_weight
        CHECK (weight >= 0 AND weight <= 100),

    CONSTRAINT chk_cycle_cfg_norm
        CHECK (norm_max > norm_min),

    CONSTRAINT chk_cycle_cfg_metric
        CHECK (score_metric ~ '^[a-z][a-z0-9_]*$')
);

CREATE INDEX idx_cycle_cfg_platform
    ON cycle_platform_config (platform_id);

CREATE OR REPLACE FUNCTION trg_check_cycle_weight_total()
RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
    total numeric;
BEGIN
    SELECT COALESCE(SUM(weight), 0)
    INTO total
    FROM cycle_platform_config
    WHERE cycle_id = NEW.cycle_id
      AND is_enabled;

    IF total <> 100 THEN
        RAISE EXCEPTION
            'Enabled platform weights for cycle % must sum to 100; currently %',
            NEW.cycle_id, total;
    END IF;

    RETURN NULL;
END $$;

CREATE CONSTRAINT TRIGGER trg_cycle_platform_weight_total
AFTER INSERT OR UPDATE OR DELETE ON cycle_platform_config
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION trg_check_cycle_weight_total();

-- =====================================================================
-- 7. UPLOAD BATCHES
-- =====================================================================

CREATE TABLE upload_batches (
    upload_id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    file_name          varchar(255) NOT NULL,
    file_hash          char(64) NOT NULL,
    platform_id        smallint NOT NULL
                       REFERENCES platforms (platform_id),
    cycle_id           integer NOT NULL,
    week_number        smallint NOT NULL,
    uploaded_by        varchar(100) NOT NULL,
    uploaded_at        timestamptz NOT NULL DEFAULT now(),
    total_records      integer NOT NULL DEFAULT 0,
    successful_records integer NOT NULL DEFAULT 0,
    failed_records     integer NOT NULL DEFAULT 0,
    status             varchar(25) NOT NULL DEFAULT 'PENDING',
    error_summary      text,

    CONSTRAINT fk_upload_week
        FOREIGN KEY (cycle_id, week_number)
        REFERENCES assessment_weeks (cycle_id, week_number),

    CONSTRAINT uq_upload_file_hash
        UNIQUE (file_hash),

    CONSTRAINT chk_upload_status
        CHECK (status IN (
            'PENDING',
            'PROCESSING',
            'COMPLETED',
            'COMPLETED_WITH_ERRORS',
            'FAILED'
        )),

    CONSTRAINT chk_upload_counts
        CHECK (
            total_records >= 0
            AND successful_records >= 0
            AND failed_records >= 0
            AND successful_records + failed_records <= total_records
        )
);

CREATE INDEX idx_upload_cycle_week_platform
    ON upload_batches (cycle_id, week_number, platform_id);

CREATE INDEX idx_upload_status
    ON upload_batches (status);

CREATE INDEX idx_upload_uploaded_at
    ON upload_batches (uploaded_at DESC);

CREATE TABLE upload_errors (
    error_id       bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    upload_id      bigint NOT NULL
                   REFERENCES upload_batches (upload_id)
                   ON DELETE CASCADE,
    excel_row      integer,
    roll_no_raw    varchar(50),
    error_message  text NOT NULL,
    raw_row        jsonb
);

CREATE INDEX idx_upload_errors_upload
    ON upload_errors (upload_id);

-- =====================================================================
-- 8. RAW WEEKLY PERFORMANCE
--    NULL means data was not received.
--    NEVER store fallback values here.
-- =====================================================================

CREATE TABLE student_weekly_performance (
    roll_no          varchar(20) NOT NULL
                     REFERENCES students (roll_no)
                     ON UPDATE CASCADE ON DELETE CASCADE,
    cycle_id         integer NOT NULL,
    week_number      smallint NOT NULL,
    platform_id      smallint NOT NULL
                     REFERENCES platforms (platform_id),
    problems_solved  integer,
    rating           numeric(8,2),
    global_rank      integer,
    assessment_score numeric(7,2),
    extra_metrics    jsonb NOT NULL DEFAULT '{}'::jsonb,
    source_upload_id bigint
                     REFERENCES upload_batches (upload_id)
                     ON DELETE SET NULL,
    created_at       timestamptz NOT NULL DEFAULT now(),
    updated_at       timestamptz NOT NULL DEFAULT now(),

    PRIMARY KEY (roll_no, cycle_id, week_number, platform_id),

    CONSTRAINT fk_perf_week
        FOREIGN KEY (cycle_id, week_number)
        REFERENCES assessment_weeks (cycle_id, week_number)
        ON DELETE RESTRICT,

    CONSTRAINT chk_perf_problems
        CHECK (problems_solved IS NULL OR problems_solved >= 0),

    CONSTRAINT chk_perf_rating
        CHECK (rating IS NULL OR rating >= 0),

    CONSTRAINT chk_perf_rank
        CHECK (global_rank IS NULL OR global_rank > 0),

    CONSTRAINT chk_perf_score
        CHECK (assessment_score IS NULL OR assessment_score >= 0),

    CONSTRAINT chk_perf_extra
        CHECK (jsonb_typeof(extra_metrics) = 'object'),

    CONSTRAINT chk_perf_has_metric
        CHECK (
            problems_solved IS NOT NULL
            OR rating IS NOT NULL
            OR global_rank IS NOT NULL
            OR assessment_score IS NOT NULL
            OR extra_metrics <> '{}'::jsonb
        )
);

CREATE INDEX idx_perf_cycle_week_platform
    ON student_weekly_performance (cycle_id, week_number, platform_id);

CREATE INDEX idx_perf_platform
    ON student_weekly_performance (platform_id);

CREATE INDEX idx_perf_upload
    ON student_weekly_performance (source_upload_id);

CREATE INDEX idx_perf_fallback_lookup
    ON student_weekly_performance
        (roll_no, cycle_id, platform_id, week_number DESC);

CREATE INDEX idx_perf_extra_gin
    ON student_weekly_performance USING gin (extra_metrics);

CREATE TRIGGER trg_perf_updated
BEFORE UPDATE ON student_weekly_performance
FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

-- =====================================================================
-- 9. RAW DATA AUDIT
-- =====================================================================

CREATE TABLE student_weekly_performance_audit (
    audit_id      bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    operation     char(1) NOT NULL CHECK (operation IN ('U','D')),
    changed_at    timestamptz NOT NULL DEFAULT now(),
    roll_no       varchar(20) NOT NULL,
    cycle_id      integer NOT NULL,
    week_number   smallint NOT NULL,
    platform_id   smallint NOT NULL,
    old_row       jsonb NOT NULL
);

CREATE INDEX idx_perf_audit_key
    ON student_weekly_performance_audit
       (roll_no, cycle_id, week_number, platform_id);

CREATE OR REPLACE FUNCTION trg_audit_performance()
RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO student_weekly_performance_audit
        (operation, roll_no, cycle_id, week_number, platform_id, old_row)
    VALUES
        (
            left(TG_OP, 1),
            OLD.roll_no,
            OLD.cycle_id,
            OLD.week_number,
            OLD.platform_id,
            to_jsonb(OLD)
        );

    RETURN NULL;
END $$;

CREATE TRIGGER trg_perf_audit
AFTER UPDATE OR DELETE ON student_weekly_performance
FOR EACH ROW EXECUTE FUNCTION trg_audit_performance();

-- =====================================================================
-- 10. WEEKLY CT SCORE
--     Optional derived score for each week.
-- =====================================================================

CREATE TABLE student_weekly_ct_scores (
    roll_no               varchar(20) NOT NULL
                          REFERENCES students (roll_no)
                          ON UPDATE CASCADE ON DELETE CASCADE,
    cycle_id              integer NOT NULL,
    week_number           smallint NOT NULL,
    ct_score              numeric(6,2),
    available_weight      numeric(5,2) NOT NULL,
    total_weight          numeric(5,2) NOT NULL,
    weight_coverage_pct   numeric(5,2) NOT NULL,
    platforms_current     smallint NOT NULL,
    platforms_fallback    smallint NOT NULL,
    platforms_unavailable smallint NOT NULL,
    score_method          varchar(20) NOT NULL DEFAULT 'RENORMALIZED',
    formula_version       integer NOT NULL DEFAULT 1,
    calculated_at         timestamptz NOT NULL DEFAULT now(),

    PRIMARY KEY (roll_no, cycle_id, week_number),

    CONSTRAINT fk_ct_week
        FOREIGN KEY (cycle_id, week_number)
        REFERENCES assessment_weeks (cycle_id, week_number)
        ON DELETE RESTRICT,

    CONSTRAINT chk_ct_range
        CHECK (ct_score IS NULL OR ct_score BETWEEN 0 AND 100),

    CONSTRAINT chk_ct_weights
        CHECK (
            available_weight BETWEEN 0 AND total_weight
        ),

    CONSTRAINT chk_ct_method
        CHECK (score_method IN ('RENORMALIZED', 'ZERO_FILL'))
);

CREATE INDEX idx_ct_cycle_week_score
    ON student_weekly_ct_scores
       (cycle_id, week_number, ct_score DESC NULLS LAST);

-- =====================================================================
-- 11. WEEKLY CT COMPONENT AUDIT
-- =====================================================================

CREATE TABLE student_weekly_ct_components (
    roll_no             varchar(20) NOT NULL,
    cycle_id            integer NOT NULL,
    week_number         smallint NOT NULL,
    platform_id         smallint NOT NULL
                        REFERENCES platforms (platform_id),
    status              varchar(12) NOT NULL,
    source_week_number  smallint,
    score_metric        varchar(40) NOT NULL,
    raw_value           numeric(12,2),
    norm_min            numeric(12,2) NOT NULL,
    norm_max            numeric(12,2) NOT NULL,
    normalized_score    numeric(7,4),
    weight              numeric(5,2) NOT NULL,
    weighted_score      numeric(8,4),

    PRIMARY KEY (roll_no, cycle_id, week_number, platform_id),

    FOREIGN KEY (roll_no, cycle_id, week_number)
        REFERENCES student_weekly_ct_scores
            (roll_no, cycle_id, week_number)
        ON DELETE CASCADE,

    CONSTRAINT chk_comp_status
        CHECK (status IN ('CURRENT', 'FALLBACK', 'UNAVAILABLE')),

    CONSTRAINT chk_comp_norm
        CHECK (
            normalized_score IS NULL
            OR normalized_score BETWEEN 0 AND 100
        ),

    CONSTRAINT chk_comp_consistency
        CHECK (
            (
                status = 'UNAVAILABLE'
                AND raw_value IS NULL
                AND normalized_score IS NULL
                AND weighted_score IS NULL
                AND source_week_number IS NULL
            )
            OR
            (
                status <> 'UNAVAILABLE'
                AND raw_value IS NOT NULL
                AND normalized_score IS NOT NULL
                AND weighted_score IS NOT NULL
                AND source_week_number IS NOT NULL
                AND source_week_number <= week_number
            )
        )
);

CREATE INDEX idx_comp_cycle_week
    ON student_weekly_ct_components
       (cycle_id, week_number, platform_id);

-- =====================================================================
-- 12. FINAL CT SCORE FOR THE 5-WEEK CYCLE
--     THIS is the score to use for the final topper tables.
-- =====================================================================

CREATE TABLE student_cycle_ct_scores (
    roll_no               varchar(20) NOT NULL
                          REFERENCES students (roll_no)
                          ON UPDATE CASCADE ON DELETE CASCADE,
    cycle_id              integer NOT NULL
                          REFERENCES assessment_cycles (cycle_id)
                          ON DELETE RESTRICT,
    ct_score              numeric(6,2),
    available_weight      numeric(5,2) NOT NULL,
    total_weight          numeric(5,2) NOT NULL,
    weight_coverage_pct   numeric(5,2) NOT NULL,
    platforms_current     smallint NOT NULL,
    platforms_fallback    smallint NOT NULL,
    platforms_unavailable smallint NOT NULL,
    based_on_week         smallint NOT NULL DEFAULT 5,
    score_method          varchar(20) NOT NULL DEFAULT 'RENORMALIZED',
    formula_version       integer NOT NULL DEFAULT 1,
    calculated_at         timestamptz NOT NULL DEFAULT now(),

    PRIMARY KEY (roll_no, cycle_id),

    CONSTRAINT chk_cycle_ct_range
        CHECK (ct_score IS NULL OR ct_score BETWEEN 0 AND 100),

    CONSTRAINT chk_cycle_ct_weights
        CHECK (available_weight BETWEEN 0 AND total_weight),

    CONSTRAINT chk_cycle_ct_week
        CHECK (based_on_week = 5),

    CONSTRAINT chk_cycle_ct_method
        CHECK (score_method IN ('RENORMALIZED', 'ZERO_FILL'))
);

CREATE INDEX idx_cycle_ct_score
    ON student_cycle_ct_scores
       (cycle_id, ct_score DESC NULLS LAST);

-- =====================================================================
-- 13. FUNCTIONS
-- =====================================================================

-- Extract the selected scoring metric from a raw weekly row.
CREATE OR REPLACE FUNCTION fn_metric_value(
    p student_weekly_performance,
    metric text
)
RETURNS numeric
LANGUAGE sql
IMMUTABLE AS $$
    SELECT CASE metric
        WHEN 'problems_solved'  THEN p.problems_solved::numeric
        WHEN 'rating'           THEN p.rating
        WHEN 'global_rank'      THEN p.global_rank::numeric
        WHEN 'assessment_score' THEN p.assessment_score
        ELSE (p.extra_metrics ->> metric)::numeric
    END
$$;

-- Min-max normalization to 0..100.
CREATE OR REPLACE FUNCTION fn_normalize(
    v numeric,
    lo numeric,
    hi numeric,
    higher_is_better boolean DEFAULT true
)
RETURNS numeric
LANGUAGE sql
IMMUTABLE AS $$
    SELECT CASE
        WHEN v IS NULL THEN NULL
        WHEN higher_is_better THEN
            100 * LEAST(1, GREATEST(0, (v - lo) / (hi - lo)))
        ELSE
            100 * (
                1 - LEAST(1, GREATEST(0, (v - lo) / (hi - lo)))
            )
    END
$$;

-- Return the effective value for each student/platform.
-- The lookup uses the cycle-specific scoring configuration.
CREATE OR REPLACE FUNCTION fn_effective_platform_values(
    p_cycle_id integer,
    p_week_number integer
)
RETURNS TABLE (
    roll_no varchar,
    platform_id smallint,
    status text,
    source_week smallint,
    raw_value numeric
)
LANGUAGE sql
STABLE AS $$
    SELECT
        e.roll_no,
        cfg.platform_id,
        CASE
            WHEN latest.week_number IS NULL THEN 'UNAVAILABLE'
            WHEN latest.week_number = p_week_number THEN 'CURRENT'
            ELSE 'FALLBACK'
        END AS status,
        latest.week_number,
        latest.v
    FROM student_cycle_enrollment e
    JOIN cycle_platform_config cfg
      ON cfg.cycle_id = e.cycle_id
     AND cfg.is_enabled
    LEFT JOIN LATERAL (
        SELECT
            swp.week_number,
            fn_metric_value(swp, cfg.score_metric) AS v
        FROM student_weekly_performance swp
        WHERE swp.roll_no = e.roll_no
          AND swp.cycle_id = p_cycle_id
          AND swp.platform_id = cfg.platform_id
          AND swp.week_number <= p_week_number
          AND fn_metric_value(swp, cfg.score_metric) IS NOT NULL
        ORDER BY swp.week_number DESC
        LIMIT 1
    ) latest ON true
    WHERE e.cycle_id = p_cycle_id
$$;

-- Calculate ONE WEEK's CT score.
-- This does NOT modify raw Excel data.
CREATE OR REPLACE FUNCTION fn_calculate_ct_week(
    p_cycle_id integer,
    p_week_number integer,
    p_min_coverage_pct numeric DEFAULT 0
)
RETURNS integer
LANGUAGE plpgsql AS $$
DECLARE
    n integer;
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM assessment_weeks
        WHERE cycle_id = p_cycle_id
          AND week_number = p_week_number
    ) THEN
        RAISE EXCEPTION
            'Cycle % week % does not exist',
            p_cycle_id, p_week_number;
    END IF;

    DELETE FROM student_weekly_ct_scores
    WHERE cycle_id = p_cycle_id
      AND week_number = p_week_number;

    WITH comp AS (
        SELECT
            ev.roll_no,
            ev.platform_id,
            ev.status,
            ev.source_week,
            ev.raw_value,
            cfg.score_metric,
            cfg.norm_min,
            cfg.norm_max,
            cfg.weight,
            fn_normalize(
                ev.raw_value,
                cfg.norm_min,
                cfg.norm_max,
                cfg.higher_is_better
            ) AS normalized
        FROM fn_effective_platform_values(
            p_cycle_id,
            p_week_number
        ) ev
        JOIN cycle_platform_config cfg
          ON cfg.cycle_id = p_cycle_id
         AND cfg.platform_id = ev.platform_id
         AND cfg.is_enabled
    ),
    agg AS (
        SELECT
            roll_no,
            SUM(weight) AS total_weight,
            COALESCE(
                SUM(weight) FILTER (
                    WHERE status <> 'UNAVAILABLE'
                ),
                0
            ) AS avail_weight,
            COALESCE(
                SUM(normalized * weight / 100)
                    FILTER (WHERE status <> 'UNAVAILABLE'),
                0
            ) AS weighted_sum,
            COUNT(*) FILTER (
                WHERE status = 'CURRENT'
            ) AS n_current,
            COUNT(*) FILTER (
                WHERE status = 'FALLBACK'
            ) AS n_fallback,
            COUNT(*) FILTER (
                WHERE status = 'UNAVAILABLE'
            ) AS n_unavail
        FROM comp
        GROUP BY roll_no
    )
    INSERT INTO student_weekly_ct_scores (
        roll_no,
        cycle_id,
        week_number,
        ct_score,
        available_weight,
        total_weight,
        weight_coverage_pct,
        platforms_current,
        platforms_fallback,
        platforms_unavailable
    )
    SELECT
        roll_no,
        p_cycle_id,
        p_week_number,
        CASE
            WHEN avail_weight > 0
             AND avail_weight / total_weight * 100 >= p_min_coverage_pct
            THEN ROUND(weighted_sum * 100 / avail_weight, 2)
            ELSE NULL
        END,
        avail_weight,
        total_weight,
        ROUND(avail_weight / total_weight * 100, 2),
        n_current,
        n_fallback,
        n_unavail
    FROM agg;

    INSERT INTO student_weekly_ct_components (
        roll_no,
        cycle_id,
        week_number,
        platform_id,
        status,
        source_week_number,
        score_metric,
        raw_value,
        norm_min,
        norm_max,
        normalized_score,
        weight,
        weighted_score
    )
    SELECT
        ev.roll_no,
        p_cycle_id,
        p_week_number,
        ev.platform_id,
        ev.status,
        ev.source_week,
        cfg.score_metric,
        ev.raw_value,
        cfg.norm_min,
        cfg.norm_max,
        ROUND(
            fn_normalize(
                ev.raw_value,
                cfg.norm_min,
                cfg.norm_max,
                cfg.higher_is_better
            ),
            4
        ),
        cfg.weight,
        ROUND(
            fn_normalize(
                ev.raw_value,
                cfg.norm_min,
                cfg.norm_max,
                cfg.higher_is_better
            ) * cfg.weight / 100,
            4
        )
    FROM fn_effective_platform_values(
        p_cycle_id,
        p_week_number
    ) ev
    JOIN cycle_platform_config cfg
      ON cfg.cycle_id = p_cycle_id
     AND cfg.platform_id = ev.platform_id
     AND cfg.is_enabled;

    SELECT COUNT(*)
    INTO n
    FROM student_weekly_ct_scores
    WHERE cycle_id = p_cycle_id
      AND week_number = p_week_number;

    RETURN n;
END $$;

-- Calculate the FINAL CT score.
-- This is allowed ONLY after all five weeks exist in the cycle.
-- The effective values are taken through Week 5, so missing Week 5
-- values correctly fall back to Week 4/3/2/1.
CREATE OR REPLACE FUNCTION fn_calculate_final_ct(
    p_cycle_id integer
)
RETURNS integer
LANGUAGE plpgsql AS $$
DECLARE
    n integer;
    missing_weeks integer;
BEGIN
    SELECT COUNT(*)
    INTO missing_weeks
    FROM generate_series(1, 5) w
    WHERE NOT EXISTS (
        SELECT 1
        FROM assessment_weeks aw
        WHERE aw.cycle_id = p_cycle_id
          AND aw.week_number = w
    );

    IF missing_weeks > 0 THEN
        RAISE EXCEPTION
            'Cycle % is incomplete. All 5 assessment weeks must exist before final CT calculation.',
            p_cycle_id;
    END IF;

    -- Remove old final scores so recalculation is deterministic.
    DELETE FROM student_cycle_ct_scores
    WHERE cycle_id = p_cycle_id;

    WITH effective AS (
        SELECT
            ev.roll_no,
            ev.platform_id,
            ev.status,
            ev.source_week,
            ev.raw_value,
            cfg.score_metric,
            cfg.norm_min,
            cfg.norm_max,
            cfg.weight,
            cfg.higher_is_better,
            fn_normalize(
                ev.raw_value,
                cfg.norm_min,
                cfg.norm_max,
                cfg.higher_is_better
            ) AS normalized
        FROM fn_effective_platform_values(
            p_cycle_id,
            5
        ) ev
        JOIN cycle_platform_config cfg
          ON cfg.cycle_id = p_cycle_id
         AND cfg.platform_id = ev.platform_id
         AND cfg.is_enabled
    ),
    agg AS (
        SELECT
            roll_no,
            SUM(weight) AS total_weight,
            COALESCE(
                SUM(weight) FILTER (
                    WHERE status <> 'UNAVAILABLE'
                ),
                0
            ) AS available_weight,
            COALESCE(
                SUM(normalized * weight / 100)
                    FILTER (WHERE status <> 'UNAVAILABLE'),
                0
            ) AS weighted_sum,
            COUNT(*) FILTER (
                WHERE status = 'CURRENT'
            ) AS n_current,
            COUNT(*) FILTER (
                WHERE status = 'FALLBACK'
            ) AS n_fallback,
            COUNT(*) FILTER (
                WHERE status = 'UNAVAILABLE'
            ) AS n_unavailable
        FROM effective
        GROUP BY roll_no
    )
    INSERT INTO student_cycle_ct_scores (
        roll_no,
        cycle_id,
        ct_score,
        available_weight,
        total_weight,
        weight_coverage_pct,
        platforms_current,
        platforms_fallback,
        platforms_unavailable,
        based_on_week
    )
    SELECT
        roll_no,
        p_cycle_id,
        CASE
            WHEN available_weight > 0
            THEN ROUND(
                weighted_sum * 100 / available_weight,
                2
            )
            ELSE NULL
        END,
        available_weight,
        total_weight,
        ROUND(
            available_weight / total_weight * 100,
            2
        ),
        n_current,
        n_fallback,
        n_unavailable,
        5
    FROM agg;

    SELECT COUNT(*)
    INTO n
    FROM student_cycle_ct_scores
    WHERE cycle_id = p_cycle_id;

    RETURN n;
END $$;

-- Convenience function:
-- calculate all weekly CT scores and then final Cycle CT.
CREATE OR REPLACE FUNCTION fn_finalize_cycle_ct(
    p_cycle_id integer
)
RETURNS integer
LANGUAGE plpgsql AS $$
DECLARE
    w integer;
    total integer;
BEGIN
    FOR w IN 1..5 LOOP
        PERFORM fn_calculate_ct_week(
            p_cycle_id,
            w,
            0
        );
    END LOOP;

    total := fn_calculate_final_ct(p_cycle_id);
    RETURN total;
END $$;

-- Copy current student department/year/section into cycle enrollment.
CREATE OR REPLACE FUNCTION fn_enroll_active_students(
    p_cycle_id integer
)
RETURNS integer
LANGUAGE sql AS $$
    WITH ins AS (
        INSERT INTO student_cycle_enrollment (
            roll_no,
            cycle_id,
            department,
            year,
            section
        )
        SELECT
            roll_no,
            p_cycle_id,
            department,
            year,
            section
        FROM students
        WHERE is_active
          AND department IS NOT NULL
          AND year IS NOT NULL
          AND section IS NOT NULL
        ON CONFLICT (roll_no, cycle_id)
        DO NOTHING
        RETURNING 1
    )
    SELECT COUNT(*)::integer FROM ins
$$;

-- Set the current cycle/week pointer.
CREATE OR REPLACE FUNCTION fn_set_current_week(
    p_cycle_id integer,
    p_week_number integer
)
RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM assessment_weeks
        WHERE cycle_id = p_cycle_id
          AND week_number = p_week_number
    ) THEN
        RAISE EXCEPTION
            'Cycle % week % not found',
            p_cycle_id,
            p_week_number;
    END IF;

    UPDATE assessment_weeks
    SET is_current = false
    WHERE is_current;

    UPDATE assessment_cycles
    SET is_current = false
    WHERE is_current;

    UPDATE assessment_cycles
    SET is_current = true
    WHERE cycle_id = p_cycle_id;

    UPDATE assessment_weeks
    SET is_current = true
    WHERE cycle_id = p_cycle_id
      AND week_number = p_week_number;
END $$;

-- =====================================================================
-- 14. VIEWS FOR FINAL DASHBOARD
-- =====================================================================

CREATE OR REPLACE VIEW v_final_ct_leaderboard AS
SELECT
    c.cycle_id,
    c.roll_no,
    s.student_name,
    e.department,
    e.year,
    e.section,
    c.ct_score,
    c.weight_coverage_pct,
    c.platforms_fallback,
    c.platforms_unavailable,
    RANK() OVER (
        PARTITION BY c.cycle_id
        ORDER BY c.ct_score DESC NULLS LAST
    ) AS college_rank
FROM student_cycle_ct_scores c
JOIN student_cycle_enrollment e
  ON e.roll_no = c.roll_no
 AND e.cycle_id = c.cycle_id
JOIN students s
  ON s.roll_no = c.roll_no;

CREATE OR REPLACE VIEW v_college_toppers AS
SELECT *
FROM v_final_ct_leaderboard;

CREATE OR REPLACE VIEW v_yearwise_toppers AS
SELECT
    x.*,
    RANK() OVER (
        PARTITION BY x.cycle_id, x.year
        ORDER BY x.ct_score DESC NULLS LAST
    ) AS year_rank
FROM v_final_ct_leaderboard x;

CREATE OR REPLACE VIEW v_department_toppers AS
SELECT
    x.*,
    RANK() OVER (
        PARTITION BY x.cycle_id, x.department
        ORDER BY x.ct_score DESC NULLS LAST
    ) AS department_rank
FROM v_final_ct_leaderboard x;

CREATE OR REPLACE VIEW v_department_year_toppers AS
SELECT
    x.*,
    RANK() OVER (
        PARTITION BY x.cycle_id, x.department, x.year
        ORDER BY x.ct_score DESC NULLS LAST
    ) AS department_year_rank
FROM v_final_ct_leaderboard x;

CREATE OR REPLACE VIEW v_class_toppers AS
SELECT
    x.*,
    COUNT(*) OVER (
        PARTITION BY x.cycle_id, x.department, x.year, x.section
    ) AS class_size,
    RANK() OVER (
        PARTITION BY x.cycle_id, x.department, x.year, x.section
        ORDER BY x.ct_score DESC NULLS LAST
    ) AS class_rank
FROM v_final_ct_leaderboard x;

-- Percentile helper for the class ranking.
CREATE OR REPLACE VIEW v_class_toppers_with_percentile AS
SELECT
    x.*,
    CASE
        WHEN x.class_size <= 1 THEN 100.00
        ELSE ROUND(
            ((x.class_size - x.class_rank)::numeric
             / (x.class_size - 1)) * 100,
            2
        )
    END AS class_percentile
FROM v_class_toppers x;

-- =====================================================================
-- 15. CURRENT-WEEK CONTEXT
-- =====================================================================

CREATE OR REPLACE VIEW v_current_week_context AS
SELECT
    c.cycle_id,
    c.cycle_name,
    w.week_number AS current_week,
    w.start_date,
    w.end_date
FROM assessment_cycles c
JOIN assessment_weeks w
  ON w.cycle_id = c.cycle_id
WHERE c.is_current
  AND w.is_current;

-- =====================================================================
-- 16. RECOMMENDED SEED DATA
--     Execute AFTER creating a cycle.
--     The application should normally create cycle configuration from
--     these defaults when starting a new cycle.
-- =====================================================================

INSERT INTO platforms (
    platform_code,
    platform_name,
    default_weight,
    default_score_metric,
    default_norm_min,
    default_norm_max,
    default_higher_is_better
)
VALUES
    ('LEETCODE',  'LeetCode',   30.00, 'rating', 0, 3000, true),
    ('SKILLRACK', 'SkillRack',  10.00, 'rating', 0, 1000, true),
    ('DEGREE_AI', 'Degre.AI',   20.00, 'rating', 0, 1000, true),
    ('ATCODER',   'AtCoder',    20.00, 'rating', 0, 4000, true),
    ('CODEFORCES','Codeforces', 20.00, 'rating', 0, 4000, true)
ON CONFLICT (platform_code) DO NOTHING;

COMMIT;

-- =====================================================================
-- EXAMPLE SETUP
-- =====================================================================
--
-- 1. Create a 5-week cycle:
--
-- INSERT INTO assessment_cycles
--     (cycle_name, academic_year, weeks_in_cycle, start_date, end_date)
-- VALUES
--     ('2026-27 CT Cycle 1', '2026-2027', 5,
--      '2026-07-01', '2026-08-04')
-- RETURNING cycle_id;
--
-- 2. Create Week 1..Week 5:
--
-- INSERT INTO assessment_weeks
--     (cycle_id, week_number, start_date, end_date)
-- VALUES
--     (1, 1, '2026-07-01', '2026-07-07'),
--     (1, 2, '2026-07-08', '2026-07-14'),
--     (1, 3, '2026-07-15', '2026-07-21'),
--     (1, 4, '2026-07-22', '2026-07-28'),
--     (1, 5, '2026-07-29', '2026-08-04');
--
-- 3. Freeze the scoring configuration for this cycle:
--
-- INSERT INTO cycle_platform_config
--     (cycle_id, platform_id, weight, score_metric,
--      norm_min, norm_max, higher_is_better)
-- SELECT
--     1,
--     platform_id,
--     default_weight,
--     default_score_metric,
--     default_norm_min,
--     default_norm_max,
--     default_higher_is_better
-- FROM platforms
-- WHERE is_active;
--
-- 4. Enroll students:
--
-- SELECT fn_enroll_active_students(1);
--
-- 5. After each weekly upload, calculate weekly CT if desired:
--
-- SELECT fn_calculate_ct_week(1, 1);
--
-- 6. AFTER ALL FIVE WEEKS ARE AVAILABLE:
--
-- SELECT fn_finalize_cycle_ct(1);
--
-- 7. Final topper tables:
--
-- SELECT * FROM v_college_toppers
-- ORDER BY college_rank, roll_no;
--
-- SELECT * FROM v_yearwise_toppers
-- WHERE year_rank <= 10
-- ORDER BY year, year_rank;
--
-- SELECT * FROM v_department_toppers
-- WHERE department_rank <= 10
-- ORDER BY department, department_rank;
--
-- SELECT * FROM v_department_year_toppers
-- WHERE department_year_rank <= 10
-- ORDER BY department, year, department_year_rank;
--
-- SELECT * FROM v_class_toppers_with_percentile
-- WHERE class_rank <= 10
-- ORDER BY department, year, section, class_rank;
--
-- =====================================================================
