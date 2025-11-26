const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * MEMBERSHIP PLANS (STATIC)
 * Prices in ETB
 */
const MEMBERSHIP_PLANS = [
  { id: 1, role: "clinic_owner", name: "Dental Clinic Owner Package", price: 500, duration_days: 30 },
  { id: 2, role: "dentist", name: "Dentist (DDM) Package", price: 300, duration_days: 30 },
  { id: 3, role: "assistant", name: "Dental Assistant Package", price: 200, duration_days: 30 },
  { id: 4, role: "dental_student", name: "Dental Student Package", price: 150, duration_days: 30 },
  { id: 5, role: "patient", name: "Patient Consultation Package", price: 100, duration_days: 30 }
];

/**
 * GET ALL MEMBERSHIP PLANS
 */
router.get('/plans', (req, res) => {
  return res.json({ plans: MEMBERSHIP_PLANS });
});

/**
 * APPLY MEMBERSHIP TO USER
 */
router.post('/subscribe', auth, async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user.id;

    const plan = MEMBERSHIP_PLANS.find(p => p.id === planId);
    if (!plan) return res.status(400).json({ error: "Invalid membership plan" });

    const expires_at = new Date();
    expires_at.setDate(expires_at.getDate() + plan.duration_days);

    await db.query(
      `INSERT INTO memberships (user_id, plan_id, role, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [userId, plan.id, plan.role, expires_at]
    );

    return res.json({
      message: "Membership activated successfully",
      expires_at
    });

  } catch (err) {
    console.error("Membership error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * CHECK USER MEMBERSHIP STATUS
 */
router.get('/status', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `SELECT m.plan_id, m.role, m.expires_at,
              p.name AS plan_name, p.price AS plan_price
       FROM memberships m
       JOIN membership_plans p ON p.id = m.plan_id
       WHERE m.user_id=$1
       ORDER BY m.expires_at DESC
       LIMIT 1`,
      [userId]
    );

    return res.json({ membership: result.rows[0] || null });

  } catch (err) {
    console.error("Status error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
