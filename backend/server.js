// backend/server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/link-saver';

// Middleware
app.use(cors());
app.use(express.json());

// Routes (adjust paths if your files are elsewhere)
let authRoutes;
let linksRoutes;
try {
  authRoutes = require('./routes/auth');   // ./routes/auth.js
} catch (e) {
  console.warn('Could not load ./routes/auth (check path).', e.message);
}
try {
  linksRoutes = require('./routes/links'); // ./routes/links.js
} catch (e) {
  console.warn('Could not load ./routes/links (check path).', e.message);
}

// Mount routes with helpful logging
if (authRoutes) {
  app.use('/api/auth', authRoutes);
  console.log('Mounted /api/auth');
} else {
  console.log('No auth routes found (skipped /api/auth)');
}

if (linksRoutes) {
  app.use('/api/links', linksRoutes);
  console.log('Mounted /api/links');
} else {
  console.log('No links routes found (skipped /api/links)');
}

// Simple health-check endpoint
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Connect to MongoDB then start server
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API base: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });

// Global error printing
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
