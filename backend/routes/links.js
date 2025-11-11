// backend/routes/links.js
const express = require('express');
const jwt = require('jsonwebtoken');
const Link = require('../models/Link');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

// Middleware: verify token and set req.userId
function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: 'No authorization header' });

    const parts = auth.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ message: 'Malformed authorization header' });
    }

    const token = parts[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || !decoded.id) return res.status(401).json({ message: 'Invalid token payload' });

    req.userId = decoded.id;
    next();
  } catch (err) {
    console.error('Auth verification failed:', err && err.message ? err.message : err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// POST /api/links  — create a new link (owned by user)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, url, notes, tags } = req.body || {};
    if (!title || !url) return res.status(400).json({ message: 'Title and url required' });

    const link = new Link({
      user: req.userId,
      title,
      url,
      notes: notes || '',
      tags: Array.isArray(tags) ? tags : [],
    });

    const saved = await link.save();
    return res.status(201).json({ message: 'Link saved', link: saved });
  } catch (err) {
    console.error('POST /api/links error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation failed', details: err.errors });
    }
    return res.status(500).json({ message: 'Failed to save link', error: err.message });
  }
});

// GET /api/links — fetch links for the logged-in user
router.get('/', requireAuth, async (req, res) => {
  try {
    const list = await Link.find({ user: req.userId }).sort({ createdAt: -1 }).limit(200).exec();
    res.json(list);
  } catch (err) {
    console.error('GET /api/links error:', err);
    res.status(500).json({ message: 'Failed to fetch links', error: err.message });
  }
});

// DELETE /api/links/:id — delete a link (owner only)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ message: 'Missing link id' });

    // find link and ensure it belongs to the requesting user
    const link = await Link.findById(id).exec();
    if (!link) return res.status(404).json({ message: 'Link not found' });

    if (String(link.user) !== String(req.userId)) {
      return res.status(403).json({ message: 'Not authorized to delete this link' });
    }

    await Link.deleteOne({ _id: id }).exec();
    return res.json({ message: 'Link deleted', id });
  } catch (err) {
    console.error('DELETE /api/links/:id error:', err);
    return res.status(500).json({ message: 'Failed to delete link', error: err.message });
  }
});

module.exports = router;
