const express = require('express');
const Investor = require('../models/Investor');
const Startup = require('../models/Startup');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all investors (with filters)
router.get('/', async (req, res) => {
  try {
    const { industry, stage, location, search } = req.query;
    const filter = {};
    if (industry) filter.industries = industry;
    if (stage) filter.stagePreference = stage;
    if (location) filter.location = { $regex: location, $options: 'i' };

    const investors = await Investor.find(filter).populate('user', 'name avatar bio location');
    
    if (search) {
      const filtered = investors.filter(i =>
        i.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        i.firmName?.toLowerCase().includes(search.toLowerCase())
      );
      return res.json(filtered);
    }
    res.json(investors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create/update investor profile
router.post('/', auth, async (req, res) => {
  try {
    let investor = await Investor.findOne({ user: req.user._id });
    if (investor) {
      Object.assign(investor, req.body);
      await investor.save();
    } else {
      investor = await Investor.create({ ...req.body, user: req.user._id });
    }
    res.json(investor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get investor by ID
router.get('/:id', async (req, res) => {
  try {
    const investor = await Investor.findById(req.params.id).populate('user', 'name avatar bio location');
    if (!investor) return res.status(404).json({ message: 'Investor not found' });
    res.json(investor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Investor matching engine
router.get('/match/:startupId', auth, async (req, res) => {
  try {
    const startup = await Startup.findById(req.params.startupId);
    if (!startup) return res.status(404).json({ message: 'Startup not found' });

    const investors = await Investor.find({}).populate('user', 'name avatar bio location');

    const matches = investors.map(investor => {
      let score = 0;
      // Industry match
      if (investor.industries.includes(startup.industry)) score += 30;
      // Stage match
      if (investor.stagePreference.includes(startup.fundingStage)) score += 25;
      // Location match
      if (investor.geographicPreference.some(g =>
        g.toLowerCase() === startup.location?.country?.toLowerCase()
      )) score += 15;
      // Ticket size match
      if (startup.fundingRequired >= investor.ticketSize.min &&
          startup.fundingRequired <= investor.ticketSize.max) score += 20;
      // Active investor bonus
      if (investor.portfolio.length > 0) score += 10;
      return { investor, compatibilityScore: Math.min(score, 100) };
    });

    matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    res.json(matches.filter(m => m.compatibilityScore > 0));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Swipe interest
router.post('/swipe', auth, async (req, res) => {
  try {
    const { startupId, direction } = req.body;
    const investor = await Investor.findOne({ user: req.user._id });
    if (!investor) return res.status(404).json({ message: 'Investor profile not found' });
    if (direction === 'right') {
      if (!investor.interestedStartups.includes(startupId)) {
        investor.interestedStartups.push(startupId);
      }
    } else {
      if (!investor.passedStartups.includes(startupId)) {
        investor.passedStartups.push(startupId);
      }
    }
    await investor.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
