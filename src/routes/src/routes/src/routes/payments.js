const express = require('express');
const axios = require('axios');
const auth = require('../middleware/auth');
const { FLW_SECRET, APP_URL, FLW_BASE } = require('../config');

const router = express.Router();

/**
 * CREATE PAYMENT LINK
 */
router.post('/create', auth, async (req, res) => {
  try {
    const { amount, email, name, planId } = req.body;

    if (!amount || !email || !name || !planId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const payload = {
      tx_ref: `SIWAK-${Date.now()}`,
      amount,
      currency: "ETB",
      redirect_url: `${APP_URL}/payments/verify`,
      customer: { email, name },
      meta: { planId }
    };

    const response = await axios.post(
      `${FLW_BASE}/payments`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${FLW_SECRET}`,
          "Content-Type": "application/json"
        }
      }
    );

    return res.json({
      link: response.data?.data?.link,
      tx_ref: payload.tx_ref
    });

  } catch (err) {
    console.error("Payment error:", err.response?.data || err);
    return res.status(500).json({ error: "Payment initiation failed" });
  }
});

/**
 * VERIFY PAYMENT AFTER REDIRECT
 */
router.get('/verify', async (req, res) => {
  try {
    const { transaction_id } = req.query;

    const response = await axios.get(
      `${FLW_BASE}/transactions/${transaction_id}/verify`,
      {
        headers: { Authorization: `Bearer ${FLW_SECRET}` }
      }
    );

    const status = response.data?.data?.status;

    if (status === "successful") {
      return res.send("Payment successful! Membership will be activated shortly.");
    }

    return res.send("Payment failed or cancelled.");

  } catch (err) {
    console.error("Verify error:", err.response?.data || err);
    return res.send("Verification error.");
  }
});

module.exports = router;
