const express = require('express');
const pool = require('../db/pool');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ارسال پیام تماس به ربات تلگرام (در صورت تنظیم‌بودن TELEGRAM_BOT_TOKEN و TELEGRAM_CHAT_ID)
// این تابع هرگز نباید باعث شکست ثبت پیام در دیتابیس شود؛ خطاهای آن فقط لاگ می‌شوند.
async function notifyTelegram({ name, email, budget, message, locale }) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const escape = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const text =
    `📩 <b>پیام جدید از سایت Artosphere</b>\n\n` +
    `👤 نام: ${escape(name)}\n` +
    `📧 ایمیل: ${escape(email)}\n` +
    `💰 بودجه: ${escape(budget) || '—'}\n` +
    `🌐 زبان فرم: ${locale === 'en' ? 'English' : 'فارسی'}\n\n` +
    `✉️ متن پیام:\n${escape(message)}`;

  try {
    const resp = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    });
    if (!resp.ok) {
      const body = await resp.text().catch(() => '');
      console.error('خطا در ارسال پیام به تلگرام:', resp.status, body);
    }
  } catch (err) {
    console.error('خطا در ارسال پیام به تلگرام:', err.message);
  }
}

// POST /api/contact — ارسال فرم تماس از سایت
router.post('/', async (req, res) => {
  const { name, email, budget, message, locale } = req.body || {};

  if (!name || !name.trim() || !email || !EMAIL_RE.test(email) || !message || !message.trim()) {
    return res.status(400).json({ error: 'نام، ایمیل معتبر و پیام الزامی هستند.' });
  }

  const clean = {
    name: name.trim(),
    email: email.trim(),
    budget: (budget || '').trim(),
    message: message.trim(),
    locale: locale === 'en' ? 'en' : 'fa',
  };

  try {
    const { rows } = await pool.query(
      `INSERT INTO messages (name, email, budget, message, locale)
       VALUES ($1,$2,$3,$4,$5) RETURNING id, created_at`,
      [clean.name, clean.email, clean.budget, clean.message, clean.locale]
    );
    res.status(201).json({ ok: true, id: rows[0].id });

    // پیام برای کاربر ثبت و پاسخ داده شد؛ ارسال به تلگرام در پس‌زمینه انجام می‌شود
    // تا کندی یا قطعی تلگرام روی تجربه کاربر تأثیری نگذارد.
    notifyTelegram(clean);
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
