const express = require('express');
const pool = require('../db/pool');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

const PUBLIC_FIELDS = `
  id, slug, title_fa, title_en, category_fa, category_en, year,
  summary_fa, summary_en, description_fa, description_en,
  cover_image, accent_color, sort_order
`;

// GET /api/projects — لیست عمومی پروژه‌های منتشرشده
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT ${PUBLIC_FIELDS} FROM projects WHERE is_published = true ORDER BY sort_order ASC, id ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error('خطا در دریافت پروژه‌ها:', err);
    res.status(500).json({ error: 'خطای سرور در دریافت پروژه‌ها.' });
  }
});

// GET /api/projects/:slug — جزئیات یک پروژه
router.get('/:slug', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT ${PUBLIC_FIELDS} FROM projects WHERE slug = $1 AND is_published = true`,
      [req.params.slug]
    );
    if (!rows[0]) return res.status(404).json({ error: 'پروژه پیدا نشد.' });
    res.json(rows[0]);
  } catch (err) {
    console.error('خطا در دریافت پروژه:', err);
    res.status(500).json({ error: 'خطای سرور در دریافت پروژه.' });
  }
});

// GET /api/projects-admin/all — همه پروژه‌ها (شامل منتشرنشده‌ها) — فقط ادمین
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM projects ORDER BY sort_order ASC, id ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'خطای سرور در دریافت پروژه‌ها.' });
  }
});

// POST /api/projects — ساخت پروژه جدید — فقط ادمین
router.post('/', adminAuth, async (req, res) => {
  const p = req.body || {};
  if (!p.slug || !p.title_fa || !p.title_en) {
    return res.status(400).json({ error: 'slug، title_fa و title_en الزامی هستند.' });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO projects
        (slug, title_fa, title_en, category_fa, category_en, year, summary_fa, summary_en,
         description_fa, description_en, cover_image, accent_color, sort_order, is_published)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING *`,
      [
        p.slug, p.title_fa, p.title_en, p.category_fa || '', p.category_en || '', p.year || '',
        p.summary_fa || '', p.summary_en || '', p.description_fa || '', p.description_en || '',
        p.cover_image || '', p.accent_color || '#101010', p.sort_order || 0,
        p.is_published !== undefined ? p.is_published : true,
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'این slug قبلاً استفاده شده است.' });
    console.error('خطا در ساخت پروژه:', err);
    res.status(500).json({ error: 'خطای سرور در ساخت پروژه.' });
  }
});

// PUT /api/projects/:id — ویرایش پروژه — فقط ادمین
router.put('/:id', adminAuth, async (req, res) => {
  const p = req.body || {};
  try {
    const { rows } = await pool.query(
      `UPDATE projects SET
        title_fa=$1, title_en=$2, category_fa=$3, category_en=$4, year=$5,
        summary_fa=$6, summary_en=$7, description_fa=$8, description_en=$9,
        cover_image=$10, accent_color=$11, sort_order=$12, is_published=$13
       WHERE id=$14 RETURNING *`,
      [
        p.title_fa, p.title_en, p.category_fa || '', p.category_en || '', p.year || '',
        p.summary_fa || '', p.summary_en || '', p.description_fa || '', p.description_en || '',
        p.cover_image || '', p.accent_color || '#101010', p.sort_order || 0,
        p.is_published !== undefined ? p.is_published : true, req.params.id,
      ]
    );
    if (!rows[0]) return res.status(404).json({ error: 'پروژه پیدا نشد.' });
    res.json(rows[0]);
  } catch (err) {
    console.error('خطا در ویرایش پروژه:', err);
    res.status(500).json({ error: 'خطای سرور در ویرایش پروژه.' });
  }
});

// DELETE /api/projects/:id — فقط ادمین
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM projects WHERE id=$1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'پروژه پیدا نشد.' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'خطای سرور در حذف پروژه.' });
  }
});

module.exports = router;
