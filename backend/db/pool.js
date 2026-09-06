// اتصال به دیتابیس Postgres روی Neon.tech
// Neon یک سرویس رایگان Postgres سرورلس است. کافیست از پنل Neon یک پروژه
// بسازید و مقدار "Connection string" را در متغیر محیطی DATABASE_URL روی
// Railway (یا فایل .env در حالت لوکال) قرار دهید.
//
// نمونه مقدار DATABASE_URL:
// postgresql://user:password@ep-xxxx-xxxx.eu-central-1.aws.neon.tech/neondb?sslmode=require

const { Pool } = require('pg');
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  console.warn(
    '⚠️  متغیر DATABASE_URL تنظیم نشده است. لطفاً Connection String پروژه Neon را در .env قرار دهید.'
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Neon نیازمند اتصال SSL است.
  ssl: { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('❌ خطای غیرمنتظره در Postgres pool:', err.message);
});

module.exports = pool;
