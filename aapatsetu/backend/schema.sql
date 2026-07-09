-- =============================================================================
--  Aapat Setu — MySQL Schema
--  Import this in phpMyAdmin → select `aapatsetu` database → Import tab
--  (You don't need to import this if you just run the app — it auto-creates
--   tables on first startup. This file is provided as a reference/backup.)
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `aapatsetu`
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `aapatsetu`;

-- ---------- Users ----------
DROP TABLE IF EXISTS alerts;
DROP TABLE IF EXISTS status_history;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS incidents;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  phone         VARCHAR(20)  NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('citizen','volunteer','responder') NOT NULL DEFAULT 'citizen',
  lat           FLOAT        NULL,
  lng           FLOAT        NULL,
  created_at    DATETIME     NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- Incidents ----------
CREATE TABLE incidents (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  reporter_id    INT          NOT NULL,
  incident_type  VARCHAR(60)  NOT NULL,
  description    TEXT         NOT NULL,
  ai_summary     VARCHAR(255) NULL,
  ai_priority    ENUM('low','medium','high','critical') NULL,
  ai_verified    TINYINT(1)   NOT NULL DEFAULT 0,
  ai_flag_reason VARCHAR(255) NULL,
  is_duplicate_of INT         NULL,
  lat            FLOAT        NOT NULL,
  lng            FLOAT        NOT NULL,
  severity       ENUM('low','medium','high','critical') NOT NULL DEFAULT 'medium',
  status         ENUM('reported','verified','assigned','in_progress','resolved') NOT NULL DEFAULT 'reported',
  photo_url      VARCHAR(500) NULL,
  address        VARCHAR(255) NULL,
  created_at     DATETIME     NULL,
  updated_at     DATETIME     NULL,
  CONSTRAINT fk_inc_reporter FOREIGN KEY (reporter_id) REFERENCES users(id),
  CONSTRAINT fk_inc_dup FOREIGN KEY (is_duplicate_of) REFERENCES incidents(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE INDEX idx_inc_status ON incidents(status);
CREATE INDEX idx_inc_priority ON incidents(ai_priority);
CREATE INDEX idx_inc_type ON incidents(incident_type);
CREATE INDEX idx_inc_location ON incidents(lat, lng);

-- ---------- Tasks ----------
CREATE TABLE tasks (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  incident_id  INT NOT NULL,
  volunteer_id INT NULL,
  status       ENUM('pending','claimed','in_progress','completed') NOT NULL DEFAULT 'pending',
  notes        TEXT NULL,
  created_at   DATETIME NULL,
  updated_at   DATETIME NULL,
  CONSTRAINT fk_task_inc FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
  CONSTRAINT fk_task_vol FOREIGN KEY (volunteer_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- Status history ----------
CREATE TABLE status_history (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  incident_id INT NOT NULL,
  from_status VARCHAR(30) NULL,
  to_status   VARCHAR(30) NOT NULL,
  note        VARCHAR(255) NULL,
  changed_by  INT NULL,
  created_at  DATETIME NULL,
  CONSTRAINT fk_hist_inc FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------- Public alerts ----------
CREATE TABLE alerts (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  title      VARCHAR(200) NOT NULL,
  message    TEXT NOT NULL,
  lat        FLOAT NULL,
  lng        FLOAT NULL,
  radius_km  FLOAT NULL,
  created_by INT NULL,
  created_at DATETIME NULL,
  CONSTRAINT fk_alert_user FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
