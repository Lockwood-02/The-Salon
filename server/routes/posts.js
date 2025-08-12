const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all posts
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

// Create a new post
router.post('/', auth, async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  try {
    // Snapshot the author's username
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

// Get comments for a specific post
router.get('/:id/comments', async (req, res) => {
  const postId = parseInt(req.params.id, 10);
  try {
    const { rows } = await pool.query(
      `SELECT c.id, c.comment_text, c.created_at, u.username
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id = $1
       ORDER BY c.created_at ASC`,
      [postId]
    );
    const comments = rows.map(row => ({
      id: row.id,
      author: row.username,
      comment_text: row.comment_text,
      timestamp: row.created_at,
    }));
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a comment to a post
router.post('/:id/comments', auth, async (req, res) => {
  const postId = parseInt(req.params.id, 10);
  const { comment_text } = req.body;
  if (!comment_text) {
    return res.status(400).json({ error: 'Comment text is required' });
  }

  try {
    const { rows } = await pool.query('SELECT username FROM users WHERE id = $1', [req.userId]);
    if (rows.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }
    const username = rows[0].username;

    const result = await pool.query(
      `INSERT INTO comments (post_id, user_id, comment_text)
       VALUES ($1, $2, $3)
       RETURNING id, comment_text, created_at`,
      [postId, req.userId, comment_text]
    );

    const comment = result.rows[0];
    res.status(201).json({
      id: comment.id,
      author: username,
      comment_text: comment.comment_text,
      timestamp: comment.created_at,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

