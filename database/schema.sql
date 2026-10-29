-- ============================================================
-- Event Management Application — Database Schema
-- Run this file once to set up tables and seed data.
-- ============================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables (safe re-run)
DROP TABLE IF EXISTS `registrations`;
DROP TABLE IF EXISTS `events`;
DROP TABLE IF EXISTS `admins`;

SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------
-- Table: admins
-- Stores admin credentials. Passwords are always hashed.
-- ------------------------------------------------------------
CREATE TABLE `admins` (
    `id`            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    `email`         VARCHAR(255)    NOT NULL UNIQUE,
    `password_hash` VARCHAR(255)    NOT NULL,
    `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: events
-- Core event data. Status (Upcoming/Past/Closed) is computed
-- at query time — never stored — to avoid stale data.
-- ------------------------------------------------------------
CREATE TABLE `events` (
    `id`                    INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    `title`                 VARCHAR(255)    NOT NULL,
    `description`           TEXT            NOT NULL,
    `event_date`            DATETIME        NOT NULL,
    `venue`                 VARCHAR(255)    NOT NULL,
    `image_url`             VARCHAR(512)    DEFAULT NULL,
    `capacity`              INT UNSIGNED    DEFAULT NULL COMMENT 'NULL means unlimited',
    `registration_deadline` DATETIME        DEFAULT NULL COMMENT 'NULL means open until event date',
    `created_at`            DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: registrations
-- ON DELETE CASCADE: deleting an event removes its registrations.
-- This keeps the DB consistent and avoids orphaned rows.
-- UNIQUE(event_id, email) prevents duplicate registrations.
-- ------------------------------------------------------------
CREATE TABLE `registrations` (
    `id`         INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    `event_id`   INT UNSIGNED    NOT NULL,
    `name`       VARCHAR(255)    NOT NULL,
    `email`      VARCHAR(255)    NOT NULL,
    `phone`      VARCHAR(20)     NOT NULL,
    `created_at` DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_event_email` (`event_id`, `email`),
    CONSTRAINT `fk_reg_event`
        FOREIGN KEY (`event_id`) REFERENCES `events` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SEED DATA
-- ============================================================

-- ⚠️  IMPORTANT: Do NOT rely on the hash below in production.
-- Run `php setup_admin.php` from the project root after importing this schema.
-- That script generates a correct bcrypt hash and upserts the admin row.
-- The hash below is a placeholder that will be overwritten by setup_admin.php.
INSERT INTO `admins` (`email`, `password_hash`) VALUES (
    'admin@college.edu',
    'PLACEHOLDER_RUN_SETUP_ADMIN_PHP'
) ON DUPLICATE KEY UPDATE email = email; -- no-op if already set by setup_admin.php

-- Note: dates are realistic relative to 2026-10-29 (today)
INSERT INTO `events`
    (`title`, `description`, `event_date`, `venue`, `image_url`, `capacity`, `registration_deadline`)
VALUES

-- 1. Upcoming — Web Development Workshop (2026-11-15)
(
    'Web Development Workshop',
    'A hands-on full-day workshop covering modern web technologies including HTML5, CSS3, JavaScript ES2024, and an introduction to React. Participants will build a mini project from scratch under the guidance of industry mentors. Laptops required. All skill levels welcome — beginners to intermediate developers.',
    '2026-11-15 09:00:00',
    'Computer Science Block — Lab 3, Ground Floor',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80',
    NULL,
    '2026-11-12 23:59:59'
),

-- 2. Upcoming — Annual Tech Fest (2026-12-05)
(
    'Annual Tech Fest 2026',
    'Our flagship annual technology festival bringing together students, faculty, and industry professionals for two days of innovation. Features include project exhibitions, coding competitions, guest lectures from top tech companies, a drone racing championship, and an AI art gallery. Open to all branches and years.',
    '2026-12-05 10:00:00',
    'Main Auditorium & Open Grounds, Central Campus',
    '/Tech_Fest.jpeg',
    500,
    '2026-12-01 23:59:59'
),

-- 3. Upcoming — Campus Hackathon 2026 (2027-01-20)
(
    'Campus Hackathon 2026',
    'A 24-hour non-stop hackathon where teams of 2–4 students compete to build innovative solutions to real-world problems. Problem statements will be revealed at the start of the event. Categories include Healthcare, EdTech, FinTech, and Smart City. Prizes worth ₹1,00,000 and internship opportunities from sponsoring companies.',
    '2027-01-20 08:00:00',
    'Innovation Hub, Block D, Second Floor',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80',
    NULL,
    '2027-01-15 23:59:59'
),

-- 4. Upcoming but capacity = 2 — AI Seminar (2026-11-08)
(
    'AI & Machine Learning Seminar',
    'An exclusive seminar featuring Dr. Priya Nair, lead AI researcher at TechCorp India, discussing the current landscape of artificial intelligence, large language models, and the future of machine learning in industry. Includes a live demo of custom-trained models and a Q&A session. Seating is strictly limited — register early.',
    '2026-11-08 14:00:00',
    'Seminar Hall 1, Academic Block A',
    '/ai_seminar.jpeg',
    2,
    '2026-11-05 23:59:59'
),

-- 5. Past — Freshers Welcome (2026-08-10)
(
    'Freshers'' Welcome 2026',
    'A grand welcome ceremony organised for the new batch of 2026 students. The event featured cultural performances by senior students, an orientation by the Dean, a talent showcase by freshers, and a gala dinner. The evening concluded with the crowning of Mr. and Ms. Fresher 2026. We hope you carry these memories throughout your journey here.',
    '2026-08-10 17:00:00',
    'College Amphitheatre, Main Campus',
    '/freshers_day.jpeg',
    NULL,
    NULL
),

-- 6. Registration deadline passed, event upcoming — Career Guidance Talk (2026-11-20, deadline 2026-10-20)
(
    'Career Guidance & Placement Talk',
    'An in-depth session by our Training & Placement Officer along with HR representatives from five leading companies. Topics include resume building, cracking technical interviews, aptitude preparation, and understanding the recruitment process. Participants will receive a personalised career roadmap worksheet. Note: registration for this event has now closed.',
    '2026-11-20 11:00:00',
    'Seminar Hall 2, Academic Block B',
    '/Career_pic.jpeg',
    200,
    '2026-10-20 23:59:59'  -- deadline already passed on 2026-10-29
);
