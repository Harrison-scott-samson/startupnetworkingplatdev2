const mongoose = require('mongoose');

const investorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  firmName: { type: String, default: '' },
  investmentFocus: [String],
  industries: [{
    type: String,
    enum: ['fintech', 'healthtech', 'edtech', 'ecommerce', 'saas', 'ai_ml', 'cleantech',
           'biotech', 'gaming', 'social', 'marketplace', 'enterprise', 'consumer', 'hardware',
           'cybersecurity', 'proptech', 'agritech', 'logistics', 'media', 'other']
  }],
  stagePreference: [{
    type: String,
    enum: ['pre_seed', 'seed', 'series_a', 'series_b', 'series_c', 'growth']
  }],
  ticketSize: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 }
  },
  location: { type: String, default: '' },
  geographicPreference: [String],
  portfolio: [{
    name: String,
    industry: String,
    status: String,
    investedAmount: Number
  }],
  totalInvestments: { type: Number, default: 0 },
  bio: { type: String, default: '' },
  interestedStartups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Startup' }],
  passedStartups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Startup' }]
}, { timestamps: true });

module.exports = mongoose.model('Investor', investorSchema);
