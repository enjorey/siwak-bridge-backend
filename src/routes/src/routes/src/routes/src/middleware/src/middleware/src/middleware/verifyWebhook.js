const express = require('express');
const crypto = require('crypto');
const db = require('../db');
const { WEBHOOK_SECRET } = require('../config');

const router = express.Router();

/**
 * FLUTTERWAVE WEBHOOK
 * Automatically activates membership after successful payment
 */
router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['verif-hash'];

    if (!signature || signature !== WEBHOOK_SECRET) {
      console.log("❌ Invalid webhook signature");
      return res.status(401).send("Invalid signature");
    }

    const event = JSON.parse(req.body.toString());

    console.log("Webhook received:", event);

    if (event.event === "charge.completed") {
      const data = event.data;

      const email = data.customer.email;
      const planId = data.meta?.planId;

      if (!email || !planId) {
        console.log("Webhook missing email/planId");
        return res.status(400).send("Missing data");
      }

      // Get user by email
      const user = await db.query(
        "SELECT id FROM users WHERE email=$1",
        [email]
      );

      if (user.rows.length === 0) {
        console.log("❌ User not found for webhook:", email);
        return res.status(404).send("User not found");
      }

      const userId = user.rows[0].id;

      // Determine membership expiration
      const expires_at = new Date();
      expires_at.setDate(expires_at.getDate() + 30); // default 30 days

      await db.query(
        `INSERT INTO memberships (user_id, plan_id, role, expires_at)
         VALUES ($1, $2, 'member', $3)`,
        [userId, planId, expires_at]
      );

      console.log("✅ Membership activated:", email, "Plan:", planId);

      return res.status(200).send("Webhook processed");
    }

    return res.status(200).send("Event ignored");

  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).send("Server error");
  }
});

module.exports = router;
