-- ============================================================
-- courseflow — database schema
-- PostgreSQL
--
-- Run with:  psql -U your_user -d courseflow -f schema.sql
-- (create the database first:  CREATE DATABASE courseflow;)
-- ============================================================

-- Drop in reverse dependency order so this file can be re-run
-- while you're still iterating on the design.
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS videos;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS users;


-- ------------------------------------------------------------
-- users
-- ------------------------------------------------------------
CREATE TABLE users (
    id            INTEGER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name          TEXT         NOT NULL,
    email         TEXT         NOT NULL UNIQUE,
    password_hash TEXT         NOT NULL,
    role          TEXT         NOT NULL DEFAULT 'student'
                               CHECK (role IN ('student', 'instructor', 'admin')),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Notes:
--  * password_hash holds the bcrypt output, never a plaintext password.
--  * email is UNIQUE so login can never be ambiguous about which account it means.
--  * CHECK on role means a typo like 'studnet' is rejected by the database,
--    not silently stored. Add values to the list if you need more roles later.


-- ------------------------------------------------------------
-- courses
-- ------------------------------------------------------------
CREATE TABLE courses (
    id            INTEGER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title         TEXT         NOT NULL,
    instructor_id INTEGER      NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Notes:
--  * instructor_id is your "the user who created the course" column, renamed
--    so the schema reads clearly — user_id alone doesn't say which role.
--  * ON DELETE RESTRICT: deleting a user who owns courses is blocked. You
--    don't want removing one account to silently wipe out courses other
--    people are enrolled in. You'd reassign the courses first.


-- ------------------------------------------------------------
-- videos
-- ------------------------------------------------------------
CREATE TABLE videos (
    id          INTEGER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    course_id   INTEGER      NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title       TEXT         NOT NULL,
    storage_key TEXT         NOT NULL,
    position    INTEGER      NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (course_id, position)
);

-- Notes:
--  * storage_key is the folder/ID your FFmpeg step generated
--    (e.g. '1788896851541-266f0d2e'), NOT a full URL. Your server builds
--    the real path from it, so nothing breaks if the host ever changes.
--  * position controls lesson order. SQL gives no ordering guarantee without
--    an ORDER BY, so you need this column — created_at is a fragile proxy.
--  * ON DELETE CASCADE: deleting a course removes its videos — a video can't
--    exist without its course, so this is the safe default (see CASCADE vs
--    RESTRICT explanation above).
--  * UNIQUE (course_id, position): two videos in the same course can't claim
--    the same slot. Heads up — this makes REORDERING lessons trickier: if
--    you try to swap video A (position 1) and video B (position 2) with two
--    separate UPDATE statements, the first UPDATE alone will collide with
--    the constraint mid-way. You'll need to either update both in a single
--    transaction using a temporary placeholder position, or defer the
--    constraint check to the end of the transaction (look up
--    "DEFERRABLE INITIALLY DEFERRED" in Postgres docs when you get to
--    building reordering — not needed yet for inserting videos in order).


-- ------------------------------------------------------------
-- enrollments  (join table: users <-> courses, many-to-many)
-- ------------------------------------------------------------
CREATE TABLE enrollments (
    user_id     INTEGER      NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
    course_id   INTEGER      NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, course_id)
);

-- Notes:
--  * The composite primary key is what makes duplicate enrollments
--    impossible — a user cannot be enrolled in the same course twice.
--  * This is the table your authorization check queries: "does a row exist
--    for (this user, the course owning this video)?"


-- ------------------------------------------------------------
-- indexes
-- ------------------------------------------------------------
-- Postgres automatically indexes PRIMARY KEY and UNIQUE columns, but NOT
-- plain foreign keys. These cover the lookups your app actually performs.

CREATE INDEX idx_videos_course_id       ON videos (course_id, position);
CREATE INDEX idx_courses_instructor_id  ON courses (instructor_id);
CREATE INDEX idx_enrollments_course_id  ON enrollments (course_id);

-- Notes:
--  * idx_videos_course_id covers "all videos in this course, in order".
--  * The enrollments primary key already indexes (user_id, course_id), which
--    serves lookups starting with user_id. The extra index above handles the
--    reverse direction: "who is enrolled in this course?"