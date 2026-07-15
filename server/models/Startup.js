const mongoose = require('mongoose');

const startupSchema = new mongoose.Schema({
  founder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  tagline: { type: String, default: '' },
  logo: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  problem: { type: String, default: '' },
  solution: { type: String, default: '' },
  description: { type: String, default: '' },
  industry: {
    type: String,
    enum: ['fintech', 'healthtech', 'edtech', 'ecommerce', 'saas', 'ai_ml', 'cleantech',
           'biotech', 'gaming', 'social', 'marketplace', 'enterprise', 'consumer', 'hardware',
           'cybersecurity', 'proptech', 'agritech', 'logistics', 'media', 'other'],
    default: 'other'
  },
  targetMarket: { type: String, default: '' },
  marketSize: {
    tam: { type: String, default: '' },
    sam: { type: String, default: '' },
    som: { type: String, default: '' }
  },
  fundingStage: {
    type: String,
    enum: ['pre_seed', 'seed', 'series_a', 'series_b', 'series_c', 'growth', 'bootstrapped'],
    default: 'pre_seed'
  },
  fundingRequired: { type: Number, default: 0 },
  fundingRaised: { type: Number, default: 0 },
  teamMembers: [{
    name: String,
    role: String,
    avatar: String,
    linkedIn: String
  }],
  techStack: [String],
  demoVideoUrl: { type: String, default: '' },
  pitchDeckUrl: { type: String, default: '' },
  websiteUrl: { type: String, default: '' },
  credibilityScore: { type: Number, default: 0, min: 0, max: 100 },
  successScore: { type: Number, default: 0, min: 0, max: 100 },
  riskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  growthPotential: { type: String, enum: ['low', 'medium', 'high', 'very_high'], default: 'medium' },
  metrics: {
    users: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    growth: { type: Number, default: 0 },
    engagement: { type: Number, default: 0 }
  },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isLaunched: { type: Boolean, default: false },
  launchDate: { type: Date },
  isApproved: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['active', 'inactive', 'acquired', 'closed'],
    default: 'active'
  },
  location: {
    city: { type: String, default: '' },
    country: { type: String, default: '' },
    coordinates: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 }
    }
  }
}, { timestamps: true });

startupSchema.index({ industry: 1, fundingStage: 1 });
startupSchema.index({ 'location.country': 1 });
startupSchema.index({ credibilityScore: -1 });

module.exports = mongoose.model('Startup', startupSchema);
