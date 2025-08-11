const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, content, author_display, created_at FROM posts ORDER BY created_at DESC'
    );
    const posts = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      content: row.content,
      author: row.author_display,
      timestamp: row.created_at,
    }));
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  // Post require permissions
  // if (!['creator', 'admin'].includes(req.userRole)) {
  //   return res.status(403).json({ error: 'Insufficient permissions' });
  // }

  try {
    // we still look up username for the display snapshot
    const { rows } = await pool.query('SELECT username FROM users WHERE id = $1', [req.userId]);
    if (rows.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }
    const username = rows[0].username;

    const result = await pool.query(
      `INSERT INTO posts (title, content, user_id, author_display)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, content, author_display, created_at`,
      [title, content, req.userId, username]
    );

    const post = result.rows[0];
    res.status(201).json({
      id: post.id,
      title: post.title,
      content: post.content,
      author: post.author_display,
      timestamp: post.created_at,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;