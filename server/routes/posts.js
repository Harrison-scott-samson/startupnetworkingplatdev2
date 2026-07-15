const express = require('express');
const { Post } = require('../models/Others');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get feed
router.get('/', async (req, res) => {
  try {
    const { type, page = 1 } = req.query;
    const filter = {};
    if (type) filter.type = type;
    const posts = await Post.find(filter)
      .populate('author', 'name avatar role')
      .populate('comments.user', 'name avatar')
      .populate('startup', 'name logo')
      .sort({ createdAt: -1 })
      .skip((page - 1) * 20)
      .limit(20);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create post
router.post('/', auth, async (req, res) => {
  try {
    const post = await Post.create({ ...req.body, author: req.user._id });
    const populated = await post.populate('author', 'name avatar role');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Like post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const idx = post.likes.indexOf(req.user._id);
    if (idx > -1) post.likes.splice(idx, 1);
    else post.likes.push(req.user._id);
    await post.save();
    res.json({ likes: post.likes.length, liked: idx === -1 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Comment on post
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    post.comments.push({ user: req.user._id, text: req.body.text });
    await post.save();
    const updated = await post.populate('comments.user', 'name avatar');
    res.json(updated.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
