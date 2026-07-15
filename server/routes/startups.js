const express = require('express');
const Startup = require('../models/Startup');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all startups (with filters)
router.get('/', async (req, res) => {
  try {
    const { industry, stage, search, featured, launched, sort } = req.query;
    const filter = {};
    if (industry) filter.industry = industry;
    if (stage) filter.fundingStage = stage;
    if (featured === 'true') filter.isFeatured = true;
    if (launched === 'true') filter.isLaunched = true;
    if (search) filter.name = { $regex: search, $options: 'i' };

    let sortObj = { createdAt: -1 };
    if (sort === 'upvotes') sortObj = { upvotes: -1 };
    if (sort === 'score') sortObj = { credibilityScore: -1 };

    const startups = await Startup.find(filter)
      .populate('founder', 'name avatar role')
      .sort(sortObj)
      .limit(50);
    res.json(startups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single startup
router.get('/:id', async (req, res) => {
  try {
    const startup = await Startup.findById(req.params.id)
      .populate('founder', 'name avatar role bio location');
    if (!startup) return res.status(404).json({ message: 'Startup not found' });
    res.json(startup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create startup
router.post('/', auth, async (req, res) => {
  try {
    const startup = await Startup.create({ ...req.body, founder: req.user._id });
    // Calculate credibility score
    let score = 10;
    if (startup.problem) score += 10;
    if (startup.solution) score += 10;
    if (startup.teamMembers?.length > 0) score += 15;
    if (startup.techStack?.length > 0) score += 10;
    if (startup.pitchDeckUrl) score += 15;
    if (startup.demoVideoUrl) score += 10;
    if (startup.websiteUrl) score += 10;
    if (startup.metrics?.users > 0) score += 10;
    startup.credibilityScore = Math.min(score, 100);
    await startup.save();
    res.status(201).json(startup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update startup
router.put('/:id', auth, async (req, res) => {
  try {
    const startup = await Startup.findById(req.params.id);
    if (!startup) return res.status(404).json({ message: 'Startup not found' });
    if (startup.founder.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    Object.assign(startup, req.body);
    await startup.save();
    res.json(startup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upvote startup
router.post('/:id/upvote', auth, async (req, res) => {
  try {
    const startup = await Startup.findById(req.params.id);
    if (!startup) return res.status(404).json({ message: 'Startup not found' });
    const idx = startup.upvotes.indexOf(req.user._id);
    if (idx > -1) { startup.upvotes.splice(idx, 1); }
    else { startup.upvotes.push(req.user._id); }
    await startup.save();
    res.json({ upvotes: startup.upvotes.length, upvoted: idx === -1 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Launch startup (Product Hunt style)
router.post('/:id/launch', auth, async (req, res) => {
  try {
    const startup = await Startup.findById(req.params.id);
    if (!startup) return res.status(404).json({ message: 'Startup not found' });
    startup.isLaunched = true;
    startup.launchDate = new Date();
    await startup.save();
    res.json(startup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get trending (most upvoted launched startups)
router.get('/discover/trending', async (req, res) => {
  try {
    const startups = await Startup.find({ isLaunched: true })
      .populate('founder', 'name avatar')
      .sort({ upvotes: -1 })
      .limit(20);
    res.json(startups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
