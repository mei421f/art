const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const migrate = require('./db/migrate');
const seed = require('./db/seed');

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const contactRoutes = require('./routes/contact');
const uploadRoutes = require('./routes/uploads');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'artosphere' }));

app.use('/api/admin', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/uploads', uploadRoutes);

// فرانت استاتیک
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
app.use(express.static(PUBLIC_DIR));

app.get('/admin', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'admin.html')));
app.get('/', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'index.html')));

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await migrate();
    if (process.env.AUTO_SEED !== 'false') {
      await seed();
    }
  } catch (err) {
    console.error('❌ خطا در راه‌اندازی دیتابیس (Neon):', err.message);
    console.error('   بررسی کنید DATABASE_URL به‌درستی تنظیم شده باشد.');
  }

  app.listen(PORT, () => {
    console.log(`✅ سرور Artosphere روی پورت ${PORT} در حال اجراست`);
  });
}

start();
