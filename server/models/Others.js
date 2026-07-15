const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  type: {
    type: String,
    enum: ['update', 'launch', 'funding', 'hiring', 'help', 'story', 'general'],
    default: 'general'
  },
  image: { type: String, default: '' },
  startup: { type: mongoose.Schema.Types.ObjectId, ref: 'Startup' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
  shares: { type: Number, default: 0 },
  tags: [String]
}, { timestamps: true });

postSchema.index({ createdAt: -1 });

// ── Message Schema ──
const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  read: { type: Boolean, default: false }
}, { timestamps: true });

messageSchema.index({ sender: 1, receiver: 1 });

// ── Connection Schema ──
const connectionSchema = new mongoose.Schema({
  userA: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userB: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// ── Mentor Profile Schema ──
const mentorProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expertise: [{
    type: String,
    enum: ['technology', 'fundraising', 'product', 'marketing', 'scaling', 'legal', 'design', 'growth']
  }],
  yearsExperience: { type: Number, default: 0 },
  company: { type: String, default: '' },
  title: { type: String, default: '' },
  hourlyRate: { type: Number, default: 0 },
  availability: {
    type: String,
    enum: ['available', 'limited', 'unavailable'],
    default: 'available'
  },
  sessions: [{
    startup: { type: mongoose.Schema.Types.ObjectId, ref: 'Startup' },
    date: Date,
    status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
    notes: String
  }],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalSessions: { type: Number, default: 0 }
}, { timestamps: true });

// ── Application Schema ──
const applicationSchema = new mongoose.Schema({
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startup: { type: mongoose.Schema.Types.ObjectId, ref: 'Startup', required: true },
  role: { type: String, required: true },
  message: { type: String, default: '' },
  skills: [String],
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  resume: { type: String, default: '' }
}, { timestamps: true });

// ── Challenge Schema ──
const challengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  deadline: { type: Date, required: true },
  submissions: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    title: String,
    description: String,
    votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    submittedAt: { type: Date, default: Date.now }
  }],
  isActive: { type: Boolean, default: true },
  prize: { type: String, default: '' }
}, { timestamps: true });

// ── AI Chat Message Schema ──
const aiChatMessageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true }
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);
const Message = mongoose.model('Message', messageSchema);
const AIChatMessage = mongoose.model('AIChatMessage', aiChatMessageSchema);
const Connection = mongoose.model('Connection', connectionSchema);
const MentorProfile = mongoose.model('MentorProfile', mentorProfileSchema);
const Application = mongoose.model('Application', applicationSchema);
const Challenge = mongoose.model('Challenge', challengeSchema);

module.exports = { Post, Message, AIChatMessage, Connection, MentorProfile, Application, Challenge };
