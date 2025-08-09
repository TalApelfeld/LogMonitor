import config from "config";
import { Pool } from "pg";
import bcrypt from "bcrypt";

interface PostgresConfig {
  PG_HOST: string;
  PG_PORT: number;
  PG_DBNAME: string;
  PG_USER: string;
  PG_PASSWORD: string;
  DATABASE_URL: string;
}

const postgresConfig = config.get<PostgresConfig>("postgres");

// Step 1: Connect to default "postgres" DB for admin tasks
const adminPool = new Pool({
  host: postgresConfig.PG_HOST,
  port: postgresConfig.PG_PORT,
  database: "postgres", // always exists
  user: postgresConfig.PG_USER,
  password: postgresConfig.PG_PASSWORD,
});

async function ensureDatabaseExists() {
  const dbName = postgresConfig.PG_DBNAME;
  const res = await adminPool.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [dbName]
  );
  if (res.rowCount === 0) {
    console.log(`Database "${dbName}" does not exist. Creating...`);
    await adminPool.query(`CREATE DATABASE ${dbName}`);
    console.log(`Database "${dbName}" created successfully ✅`);
  } else {
    console.log(`Database "${dbName}" already exists ✅`);
  }
}

// Step 2: Connect to the actual app DB
export const pg = new Pool({
  host: postgresConfig.PG_HOST,
  port: postgresConfig.PG_PORT,
  database: postgresConfig.PG_DBNAME,
  user: postgresConfig.PG_USER,
  password: postgresConfig.PG_PASSWORD,
});

export async function initTable() {
  await pg.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

  await pg.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT CHECK (role IN ('admin', 'user', 'viewer')) NOT NULL DEFAULT 'user',
      createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  console.log("✅ Users table is ready");

  // Seed default users if table is empty
  const { rows } = await pg.query(`SELECT COUNT(*)::int AS count FROM users`);
  if (rows[0].count === 0) {
    console.log("Seeding default users...");
    await pg.query(
      `INSERT INTO users (email, password, name, role, createdAt)
       VALUES
       ($1, $2, $3, $4, NOW()),
       ($5, $6, $7, $8, NOW())`,
      [
        "admin@logmonitor.com",
        bcrypt.hashSync("admin123", 10),
        "Admin User",
        "admin",
        "user@logmonitor.com",
        bcrypt.hashSync("user123", 10),
        "Regular User",
        "user",
      ]
    );
    console.log("✅ Default users seeded");
  }
}

export async function initPostgres() {
  await ensureDatabaseExists();
  await pg.query("SELECT 1"); // test connection
  console.log(`Connected to database "${postgresConfig.PG_DBNAME}"`);
}
