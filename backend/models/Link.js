// backend/models/Link.js
const mongoose = require('mongoose');

const LinkSchema = new mongoose.Schema({
  // owner of the link (required)
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  title: { type: String, required: true },
  url: { type: String, required: true },
  notes: { type: String },
  tags: { type: [String], default: [] },
  visits: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Link', LinkSchema);
