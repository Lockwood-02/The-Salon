CREATE TABLE IF NOT EXISTS posts (
  id                INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title             VARCHAR(100) NOT NULL,
  content           TEXT NOT NULL,
  author_display    VARCHAR(100) NOT NULL,   -- snapshot for UI; not a foreign key
  user_id           INTEGER NOT NULL,        -- authoritative link to users
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT posts_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_posts_user_id   ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);