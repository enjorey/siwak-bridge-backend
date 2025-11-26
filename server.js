const express = require('express');
const cors = require('cors');
const { PORT } = require('./src/config');
const authRoutes = require('./src/routes/auth');
const membershipRoutes = require('./src/routes/memberships');
const paymentRoutes = require('./src/routes/payments');
const webhookRoutes = require('./src/routes/webhook');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Webhook (raw body)
app.use('/webhook', webhookRoutes);

// API routes
app.use('/auth', authRoutes);
app.use('/memberships', membershipRoutes);
app.use('/payments', paymentRoutes);

// Root
app.get('/', (req, res) => {
  res.send('Siwak-Bridge Backend API is running...');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
