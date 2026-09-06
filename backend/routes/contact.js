const express = require('express');
const pool = require('../db/pool');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/contact — ارسال فرم تماس از سایت
router.post('/', async (req, res) => {
  const { name, email, budget, message, locale } = req.body || {};

  if (!name || !name.trim() || !email || !EMAIL_RE.test(email) || !message || !message.trim()) {
    return res.status(400).json({ error: 'نام، ایمیل معتبر و پیام الزامی هستند.' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO messages (name, email, budget, message, locale)
       VALUES ($1,$2,$3,$4,$5) RETURNING id, created_at`,
      [name.trim(), email.trim(), (budget || '').trim(), message.trim(), locale === 'en' ? 'en' : 'fa']
    );
    res.status(201).json({ ok: true, id: rows[0].id });
  } catch (err) {
    console.error('خطا در ثبت پیام:', err);
    res.status(500).json({ error: 'خطای سرور در ارسال پیام. لطفاً دوباره تلاش کنید.' });
  }
});

// GET /api/contact — لیست پیام‌ها — فقط ادمین
router.get('/', adminAuth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM messages ORDER BY created_at DESC LIMIT 200');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'خطای سرور در دریافت پیام‌ها.' });
  }
});

// PUT /api/contact/:id/read — علامت‌گذاری خوانده‌شده — فقط ادمین
router.put('/:id/read', adminAuth, async (req, res) => {
  try {
    await pool.query('UPDATE messages SET is_read = true WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'خطای سرور.' });
  }
});

module.exports = router;
