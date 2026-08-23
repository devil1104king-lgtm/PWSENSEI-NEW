-- PW SENSEI Complete Database Schema
-- Compatible with PostgreSQL, CockroachDB, and SQLite

CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS batches (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  thumbnail_url TEXT,
  banner_url TEXT,
  language VARCHAR(50) DEFAULT 'Hinglish',
  target_audience VARCHAR(255) DEFAULT 'For NEET/JEE Students',
  start_date VARCHAR(100),
  end_date VARCHAR(100),
  price INTEGER DEFAULT 0,
  is_free INTEGER DEFAULT 1,
  is_new INTEGER DEFAULT 1,
  is_published INTEGER DEFAULT 1,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subjects (
  id SERIAL PRIMARY KEY,
  batch_id VARCHAR(100) NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  default_teacher_name VARCHAR(255),
  default_thumbnail_url TEXT,
  icon VARCHAR(50) DEFAULT '📚',
  chapter_count INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chapters (
  id SERIAL PRIMARY KEY,
  subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  chapter_number INTEGER DEFAULT 1,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_published INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lectures (
  id SERIAL PRIMARY KEY,
  chapter_id INTEGER NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  external_link TEXT NOT NULL,
  duration VARCHAR(50) DEFAULT '50 mins',
  teacher_name VARCHAR(255),
  lecture_date VARCHAR(100),
  is_live INTEGER DEFAULT 0,
  is_today INTEGER DEFAULT 0,
  thumbnail_url TEXT,
  display_order INTEGER DEFAULT 1,
  lecture_number INTEGER DEFAULT 1,
  video_type VARCHAR(50) DEFAULT 'lecture',
  is_published INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notes (
  id SERIAL PRIMARY KEY,
  chapter_id INTEGER NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  lecture_id INTEGER REFERENCES lectures(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  external_link TEXT NOT NULL,
  file_size VARCHAR(50) DEFAULT '2.4 MB',
  type VARCHAR(50) DEFAULT 'note',
  display_order INTEGER DEFAULT 1,
  is_published INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quizzes (
  id SERIAL PRIMARY KEY,
  chapter_id INTEGER NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  lecture_id INTEGER REFERENCES lectures(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  total_questions INTEGER DEFAULT 10,
  duration INTEGER DEFAULT 15,
  external_link TEXT,
  is_published INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS extra_resources (
  id SERIAL PRIMARY KEY,
  lecture_id INTEGER NOT NULL REFERENCES lectures(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  resource_type VARCHAR(50) DEFAULT 'pdf',
  description TEXT,
  display_order INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS teachers (
  id SERIAL PRIMARY KEY,
  batch_id VARCHAR(100) REFERENCES batches(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  photo_url TEXT,
  default_thumbnail_url TEXT,
  subject VARCHAR(255),
  subjects_taught VARCHAR(255),
  experience VARCHAR(100),
  bio TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  batch_id VARCHAR(100) NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS banners (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  link TEXT,
  target_url TEXT,
  badge_text VARCHAR(100),
  badge_color VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nav_links (
  id SERIAL PRIMARY KEY,
  label VARCHAR(100) NOT NULL,
  url TEXT NOT NULL,
  icon VARCHAR(50) DEFAULT '🔗',
  display_order INTEGER DEFAULT 0,
  is_external INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT,
  xp INTEGER DEFAULT 100,
  enrolled_count INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
