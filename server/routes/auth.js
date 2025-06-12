const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  const { username, email, password, display_name } = req.body;

  try {
    // Check if username or email already exists
    const userExists = await pool.query(
      "SELECT * FROM users WHERE username = $1 OR email = $2",
      [username, email]
    );
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: "Username or email already taken" });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Set timestamps
    const now = new Date().toISOString();

    const result = await pool.query(
      `INSERT INTO users 
        (username, email, password_hash, display_name, role, status, bio, join_date, last_login, is_active, created_at, updated_at) 
       VALUES 
        ($1, $2, $3, $4, 'user', 'active', '', $5, NULL, true, $5, $5)
       RETURNING id, username, email, display_name`,
      [username, email, password_hash, display_name, now]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const userResult = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    const user = userResult.rows[0];
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    // Optionally update last_login
    await pool.query("UPDATE users SET last_login = $1, updated_at = $1 WHERE id = $2", [
      new Date().toISOString(),
      user.id,
    ]);

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        display_name: user.display_name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
