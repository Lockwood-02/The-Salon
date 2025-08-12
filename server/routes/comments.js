const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

// Get comments for a post
router.get('/posts/:postId/comments', async (req, res) => {
  const { postId } = req.params;
  const sort = req.query.sort === 'oldest' ? 'ASC' : 'DESC';
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  try {
    const { rows } = await pool.query(
      `SELECT c.id, c.post_id, c.author_id, c.parent_id, c.body, c.created_at, c.updated_at, u.username AS author
       FROM comments c
       JOIN users u ON c.author_id = u.id
       WHERE c.post_id = $1
       ORDER BY c.created_at ASC`,
      [postId]
    );
    const map = new Map();
    rows.forEach(r => {
      map.set(r.id, { ...r, children: [] });
    });
    const roots = [];
    map.forEach(c => {
      if (c.parent_id) {
        const parent = map.get(c.parent_id);
        if (parent) parent.children.push(c);
      } else {
        roots.push(c);
      }
    });
    roots.sort((a, b) => sort === 'ASC'
      ? new Date(a.created_at) - new Date(b.created_at)
      : new Date(b.created_at) - new Date(a.created_at));
    const totalPages = Math.max(1, Math.ceil(roots.length / limit));
    const paginated = roots.slice((page - 1) * limit, page * limit);
    res.json({ comments: paginated, page, totalPages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create comment or reply
router.post('/posts/:postId/comments', auth, async (req, res) => {
  const { postId } = req.params;
  const { body, parent_id } = req.body;
  if (!body || !body.trim() || body.length > 2000) {
    return res.status(400).json({ error: 'Invalid comment body' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO comments (post_id, author_id, parent_id, body)
       VALUES ($1, $2, $3, $4)
       RETURNING id, post_id, author_id, parent_id, body, created_at, updated_at`,
      [postId, req.userId, parent_id || null, body]
    );
    const comment = result.rows[0];
    const { rows: userRows } = await pool.query('SELECT username FROM users WHERE id = $1', [req.userId]);
    comment.author = userRows[0].username;
    res.status(201).json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Edit comment
router.put('/comments/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { body } = req.body;
  if (!body || !body.trim() || body.length > 2000) {
    return res.status(400).json({ error: 'Invalid comment body' });
  }
  try {
    const { rows } = await pool.query('SELECT author_id FROM comments WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Comment not found' });
    if (rows[0].author_id !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const result = await pool.query(
      'UPDATE comments SET body = $1, updated_at = NOW() WHERE id = $2 RETURNING id, post_id, author_id, parent_id, body, created_at, updated_at',
      [body, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete comment
router.delete('/comments/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT author_id FROM comments WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Comment not found' });
    if (rows[0].author_id !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await pool.query('DELETE FROM comments WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
