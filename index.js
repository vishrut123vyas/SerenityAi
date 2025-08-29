require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const config = require('../config');
const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

// Security and middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({ origin: config.server.frontendUrl, credentials: true }));
app.use(express.json({ limit: '1mb' }));

// Basic rate limiting
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', apiLimiter);

// Test DB connection
sequelize.authenticate()
  .then(() => console.log('✅ Database connected successfully'))
  .catch(err => console.error('❌ DB connection error:', err));

// Sync models (avoid auto-migrations in production unless explicitly enabled)
const shouldAlterSchemas = process.env.NODE_ENV !== 'production' || process.env.DB_SYNC === 'true';
sequelize.sync({ alter: shouldAlterSchemas })
  .then(() => console.log(`✅ Models synced successfully (alter=${shouldAlterSchemas})`))
  .catch(err => console.error('❌ Model sync error:', err));

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Mount routers
app.use('/api/auth', require('./auth'));
app.use('/api/assessment', require('./assessment'));
app.use('/api/healing', require('./healing'));
app.use('/api/chat', require('./chat'));
app.use('/api/waitlist', require('./waitlist'));

// Simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// 404 handler for API
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 SerenityAI Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
}); 