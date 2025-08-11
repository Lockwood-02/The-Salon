-- Ensure role values are limited to allowed types
ALTER TABLE users
  ADD CONSTRAINT users_role_check
  CHECK (role IN ('user','creator','admin'));

-- Example to update a user's role
-- UPDATE users SET role = 'creator', updated_at = NOW() WHERE id = 1;
