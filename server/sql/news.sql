CREATE TABLE IF NOT EXISTS news (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  user_id INTEGER REFERENCES users(id),
  author_display TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
