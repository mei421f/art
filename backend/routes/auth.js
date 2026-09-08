const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../db/pool');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'نام کاربری و رمز عبور الزامی است.' });
  }

  try {
    const { rows } = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);
    const admin = rows[0];
    if (!admin) return res.status(401).json({ error: 'نام کاربری یا رمز عبور اشتباه است.' });

    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) return res.status(401).json({ error: 'نام کاربری یا رمز عبور اشتباه است.' });

    const token = jwt.sign(
      { sub: admin.id, username: admin.username },
      process.env.JWT_SECRET || 'dev-secret-change-me',
      { expiresIn: '12h' }
    );

    res.json({ token, username: admin.username });
  } catch (err) {
    console.error('خطا در ورود:', err);
    res.status(500).json({ error: 'خطای سرور در فرآیند ورود.' });
  }
});

// GET /api/admin/status — وضعیت اتصالات جانبی پنل (مثل تلگرام) — فقط ادمین
router.get('/status', adminAuth, (req, res) => {
  res.json({
    telegramConfigured: !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
  });
});

module.exports = router;
