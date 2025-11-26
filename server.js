const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

require('dotenv').config();

const authRoutes = require('./src/routes/auth');
const membershipRoutes = require('./src/routes/memberships');
const paymentRoutes = require('./src/routes/payments');

const app = express();
const PORT = process.env.PORT || 4000;

// CORS and JSON
app.use(cors());
app.use(express.json());

// IMPORTANT: raw body for webhooks
app.use('/api/payments/webhook', bodyParser.raw({ type: '*/*' }));

// Normal JSON for all other routes
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/payments', paymentRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Siwak-Bridge Backend is running 🚀' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
