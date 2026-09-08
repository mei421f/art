const express = require('express');
const crypto = require('crypto');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const pool = require('../db/pool');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// --- Cloudinary (ذخیره‌سازی دائمی فایل‌ها) ---
// Railway (و مشابه آن) روی پلن رایگان دیسک دائمی ندارند: هر بار که سرویس
// ری‌استارت/دیپلوی می‌شود، دیسک از صفر ساخته می‌شود و هر فایلی که مستقیم
// روی دیسک سرور ذخیره شده بود (public/uploads) پاک می‌شود. برای همین فایل‌ها
// اینجا به Cloudinary (پلن رایگان: ۲۵ کردیت در ماه، کافی برای عکس/ویدیوهای
// پروژه‌ها) آپلود می‌شوند و فقط لینک دائمی آن‌ها در دیتابیس ذخیره می‌شود.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED = {
  'image/jpeg': { ext: '.jpg', type: 'image' },
  'image/png': { ext: '.png', type: 'image' },
  'image/webp': { ext: '.webp', type: 'image' },
  'image/gif': { ext: '.gif', type: 'image' },
  'image/svg+xml': { ext: '.svg', type: 'image' },
  'video/mp4': { ext: '.mp4', type: 'video' },
  'video/webm': { ext: '.webm', type: 'video' },
  'video/quicktime': { ext: '.mov', type: 'video' },
};

// فایل در حافظه نگه داشته می‌شود (نه روی دیسک) و از همان‌جا به Cloudinary استریم می‌شود
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // ۱۰۰ مگابایت (برای ویدیو)
  fileFilter: (req, file, cb) => {
    if (!ALLOWED[file.mimetype]) {
      return cb(new Error('فرمت فایل مجاز نیست. فقط عکس (jpg/png/webp/gif/svg) یا ویدیو (mp4/webm/mov).'));
    }
    cb(null, true);
  },
});

function uploadBufferToCloudinary(buffer, resourceType, publicId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: resourceType, public_id: publicId, folder: 'artosphere' },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

// POST /api/uploads — آپلود یک فایل عکس یا ویدیو — فقط ادمین
router.post('/', adminAuth, (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'خطا در آپلود فایل.' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'هیچ فایلی ارسال نشد.' });
    }
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({
        error: 'تنظیمات Cloudinary کامل نیست. مقادیر CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY و CLOUDINARY_API_SECRET را در متغیرهای محیطی سرور تنظیم کنید.',
      });
    }

    const meta = ALLOWED[req.file.mimetype];
    const publicId = crypto.randomUUID();

    try {
      const result = await uploadBufferToCloudinary(req.file.buffer, meta.type === 'video' ? 'video' : 'image', publicId);
      const url = result.secure_url;

      try {
        const { rows } = await pool.query(
          `INSERT INTO media (filename, url, media_type, mime_type, size_bytes, public_id)
           VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
          [req.file.originalname, url, meta.type, req.file.mimetype, req.file.size, result.public_id]
        );
        res.status(201).json(rows[0]);
      } catch (dbErr) {
        console.error('خطا در ثبت فایل در دیتابیس:', dbErr);
        // فایل با موفقیت روی Cloudinary آپلود شده؛ حتی اگر ثبت در جدول media شکست بخورد، لینک را برگردان
        res.status(201).json({
          filename: req.file.originalname,
          url,
          media_type: meta.type,
          mime_type: req.file.mimetype,
          size_bytes: req.file.size,
          public_id: result.public_id,
        });
      }
    } catch (uploadErr) {
      console.error('خطا در آپلود فایل به Cloudinary:', uploadErr);
      res.status(502).json({ error: 'آپلود فایل به سرویس ذخیره‌سازی ناموفق بود. دوباره امتحان کنید.' });
    }
  });
});

// GET /api/uploads — کتابخانه رسانه (فایل‌های آپلودشده قبلی) — فقط ادمین
router.get('/', adminAuth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM media ORDER BY created_at DESC LIMIT 200');
    res.json(rows);
  } catch (err) {
    console.error('خطا در دریافت کتابخانه رسانه:', err);
    res.status(500).json({ error: 'خطای سرور در دریافت فایل‌ها.' });
  }
});

// DELETE /api/uploads/:id — حذف یک فایل از کتابخانه رسانه — فقط ادمین
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM media WHERE id=$1', [req.params.id]);
    const file = rows[0];
    if (!file) return res.status(404).json({ error: 'فایل پیدا نشد.' });

    if (file.public_id) {
      try {
        await cloudinary.uploader.destroy(file.public_id, {
          resource_type: file.media_type === 'video' ? 'video' : 'image',
        });
      } catch (cloudErr) {
        console.error('خطا در حذف فایل از Cloudinary:', cloudErr); // ادامه می‌دهیم تا رکورد دیتابیس هم پاک شود
      }
    }

    await pool.query('DELETE FROM media WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('خطا در حذف فایل:', err);
    res.status(500).json({ error: 'خطای سرور در حذف فایل.' });
  }
});

module.exports = router;
