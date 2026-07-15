const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String },
  avatar: { type: String, default: '' },
  role: {
    type: String,
    enum: ['founder', 'investor', 'mentor', 'developer', 'early_adopter', 'admin'],
    required: true
  },
  bio: { type: String, default: '' },
  location: { type: String, default: '' },
  skills: [String],
  linkedIn: { type: String, default: '' },
  twitter: { type: String, default: '' },
  website: { type: String, default: '' },
  badges: [{
    name: String,
    icon: String,
    earnedAt: { type: Date, default: Date.now }
  }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  googleId: { type: String },
  isVerified: { type: Boolean, default: false },
  onboarded: { type: Boolean, default: false },
  lastActive: { type: Date, default: Date.now }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
