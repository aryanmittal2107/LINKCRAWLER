// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  username: { type: String, trim: true, unique: true, sparse: true },
  email: { type: String, trim: true, unique: true, sparse: true },
  passwordHash: { type: String, required: true }, // store bcrypt hash here
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
