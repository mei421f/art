const bcrypt = require('bcryptjs');
const pool = require('./pool');
const migrate = require('./migrate');

const PROJECTS = [
  {
    slug: 'rova',
    title_fa: 'روا — برندینگ عطر',
    title_en: 'ROVA — Perfume Branding',
    category_fa: 'برندینگ / بسته‌بندی',
    category_en: 'Branding / Packaging',
    year: '2024',
    summary_fa: 'هویت بصری و بسته‌بندی برای یک برند عطر مینیمال.',
    summary_en: 'Visual identity and packaging for a minimal perfume brand.',
    description_fa:
      'روا داستان یک عطر ساکت است؛ برندینگی که به‌جای فریاد زدن، زمزمه می‌کند. سیستم بصری روی تایپوگرافی سنجیده، پالت خنثی و ساختار بسته‌بندی مینیمال بنا شده تا تجربه‌ای لمسی و لوکس بسازد.',
    description_en:
      'ROVA tells the story of a quiet fragrance — branding that whispers instead of shouts. The visual system rests on considered typography, a neutral palette and minimal packaging structure to create a tactile, luxury experience.',
    cover_image: '/assets/images/rova-cover.svg',
    accent_color: '#8a7a63',
    sort_order: 1,
  },
  {
    slug: 'kova',
    title_fa: 'کووا — برندینگ مکمل ورزشی',
    title_en: 'KOVA — Sports Nutrition Branding',
    category_fa: 'برندینگ / هویت بصری',
    category_en: 'Branding / Identity',
    year: '2024',
    summary_fa: 'هویت بصری پرانرژی برای برند مکمل‌های ورزشی کووا.',
    summary_en: 'A high-energy visual identity for the KOVA sports nutrition brand.',
    description_fa:
      'کووا برای بدن‌هایی طراحی شده که همیشه در حرکت‌اند. سیستم بصری از تایپوگرافی حجیم و کنتراست بالا برای انتقال قدرت و انرژی استفاده می‌کند، در حالی‌که در سطح محصول منظم و قابل‌اعتماد باقی می‌ماند.',
    description_en:
      'KOVA is designed for bodies that never stop moving. The visual system leans on bold typography and high contrast to communicate power and energy, while staying disciplined and trustworthy at the product level.',
    cover_image: '/assets/images/kova-cover.svg',
    accent_color: '#c4432c',
    sort_order: 2,
  },
];

async function seed() {
  await migrate();

  for (const p of PROJECTS) {
    await pool.query(
      `INSERT INTO projects
        (slug, title_fa, title_en, category_fa, category_en, year, summary_fa, summary_en, description_fa, description_en, cover_image, accent_color, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       ON CONFLICT (slug) DO NOTHING`,
      [
        p.slug, p.title_fa, p.title_en, p.category_fa, p.category_en, p.year,
        p.summary_fa, p.summary_en, p.description_fa, p.description_en,
        p.cover_image, p.accent_color, p.sort_order,
      ]
    );
  }
  console.log('✅ پروژه‌های نمونه (ROVA / KOVA) بررسی شدند.');

  const username = process.env.ADMIN_USERNAME || 'kourosh';
  const password = process.env.ADMIN_PASSWORD || 'change-me-please';
  const hash = await bcrypt.hash(password, 10);

  await pool.query(
    `INSERT INTO admins (username, password_hash)
     VALUES ($1, $2)
     ON CONFLICT (username) DO NOTHING`,
    [username, hash]
  );
  console.log(`✅ ادمین "${username}" بررسی شد (در صورت نبود، ساخته شد).`);
}

if (require.main === module) {
  seed()
    .then(() => {
      console.log('🌱 seed کامل شد.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ خطا در seed:', err);
      process.exit(1);
    });
}

module.exports = seed;
