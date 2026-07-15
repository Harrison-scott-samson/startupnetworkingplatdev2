const express = require('express');
const { Message, Connection, MentorProfile, Application, Challenge } = require('../models/Others');
const User = require('../models/User');
const Startup = require('../models/Startup');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// ── Messages ──
router.get('/messages/:userId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id }
      ]
    }).sort({ createdAt: 1 }).limit(100);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/conversations', auth, async (req, res) => {
  try {
    const messages = await Message.aggregate([
      { $match: { $or: [{ sender: req.user._id }, { receiver: req.user._id }] } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ['$sender', req.user._id] }, '$receiver', '$sender']
          },
          lastMessage: { $first: '$content' },
          lastDate: { $first: '$createdAt' },
          unread: {
            $sum: {
              $cond: [{ $and: [{ $eq: ['$receiver', req.user._id] }, { $eq: ['$read', false] }] }, 1, 0]
            }
          }
        }
      }
    ]);
    const populated = await User.populate(messages, { path: '_id', select: 'name avatar role' });
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/messages', auth, async (req, res) => {
  try {
    const message = await Message.create({
      sender: req.user._id,
      receiver: req.body.receiver,
      content: req.body.content
    });
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── Connections ──
router.post('/connections', auth, async (req, res) => {
  try {
    const connection = await Connection.create({
      userA: req.user._id,
      userB: req.body.userId,
      initiatedBy: req.user._id
    });
    res.status(201).json(connection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/connections/:id', auth, async (req, res) => {
  try {
    const connection = await Connection.findById(req.params.id);
    if (!connection) return res.status(404).json({ message: 'Not found' });
    connection.status = req.body.status;
    await connection.save();
    res.json(connection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── Mentors ──
router.get('/mentors', async (req, res) => {
  try {
    const mentors = await MentorProfile.find({}).populate('user', 'name avatar bio location');
    res.json(mentors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/mentors', auth, async (req, res) => {
  try {
    let mentor = await MentorProfile.findOne({ user: req.user._id });
    if (mentor) {
      Object.assign(mentor, req.body);
      await mentor.save();
    } else {
      mentor = await MentorProfile.create({ ...req.body, user: req.user._id });
    }
    res.json(mentor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/mentors/:id/book', auth, async (req, res) => {
  try {
    const mentor = await MentorProfile.findById(req.params.id);
    if (!mentor) return res.status(404).json({ message: 'Mentor not found' });
    mentor.sessions.push({ startup: req.body.startupId, date: req.body.date, status: 'scheduled' });
    mentor.totalSessions += 1;
    await mentor.save();
    res.json(mentor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── Applications (Cofounder Finder) ──
router.get('/applications/startup/:startupId', auth, async (req, res) => {
  try {
    const apps = await Application.find({ startup: req.params.startupId })
      .populate('applicant', 'name avatar skills');
    res.json(apps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/applications', auth, async (req, res) => {
  try {
    const app = await Application.create({ ...req.body, applicant: req.user._id });
    res.status(201).json(app);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/applications/:id', auth, async (req, res) => {
  try {
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ message: 'Not found' });
    app.status = req.body.status;
    await app.save();
    res.json(app);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── Challenges ──
router.get('/challenges', async (req, res) => {
  try {
    const challenges = await Challenge.find({}).populate('submissions.user', 'name avatar');
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/challenges', auth, async (req, res) => {
  try {
    const challenge = await Challenge.create(req.body);
    res.status(201).json(challenge);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/challenges/:id/submit', auth, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ message: 'Challenge not found' });
    challenge.submissions.push({ user: req.user._id, ...req.body });
    await challenge.save();
    res.json(challenge);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── Admin ──
router.get('/admin/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/admin/startups', adminAuth, async (req, res) => {
  try {
    const startups = await Startup.find({}).populate('founder', 'name email').sort({ createdAt: -1 });
    res.json(startups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/admin/startups/:id/feature', adminAuth, async (req, res) => {
  try {
    const startup = await Startup.findById(req.params.id);
    if (!startup) return res.status(404).json({ message: 'Not found' });
    startup.isFeatured = !startup.isFeatured;
    await startup.save();
    res.json(startup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/admin/users/:id', adminAuth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── Users ──
router.get('/users', async (req, res) => {
  try {
    const { role, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) filter.name = { $regex: search, $options: 'i' };
    const users = await User.find(filter).select('-password').limit(50);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/users/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    Object.assign(user, req.body);
    if (req.body.password) user.password = req.body.password;
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
