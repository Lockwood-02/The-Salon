const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const result = await pool.query(
      'SELECT username, display_name, role, status, bio, join_date, last_login FROM users WHERE LOWER(username) = LOWER($1)',
      [username]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;