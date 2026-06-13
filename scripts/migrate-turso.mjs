#!/usr/bin/env node
// Turso へ Prisma マイグレーションを適用するスクリプト
// CI (GitHub Actions) および手動実行で使用する
import { createClient } from "@libsql/client";
import { readdir, readFile } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error("TURSO_DATABASE_URL is not set");
  process.exit(1);
}

const client = createClient({ url, authToken });

async function migrate() {
  // _prisma_migrations テーブルがなければ作成
  await client.execute(`
    CREATE TABLE IF NOT EXISTS _prisma_migrations (
      id                TEXT PRIMARY KEY,
      checksum          TEXT NOT NULL DEFAULT '',
      finished_at       DATETIME,
      migration_name    TEXT NOT NULL,
      logs              TEXT,
      rolled_back_at    DATETIME,
      started_at        DATETIME NOT NULL DEFAULT (datetime('now')),
      applied_steps_count INTEGER NOT NULL DEFAULT 0
    )
  `);

  // 適用済みマイグレーションを取得
  const { rows } = await client.execute(
    "SELECT migration_name FROM _prisma_migrations WHERE finished_at IS NOT NULL"
  );
  const applied = new Set(rows.map((r) => r.migration_name));

  // prisma/migrations/ 配下をソート順に取得
  const migrationsDir = join(__dirname, "..", "prisma", "migrations");
  const entries = await readdir(migrationsDir, { withFileTypes: true });
  const dirs = entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();

  let pendingCount = 0;
  for (const name of dirs) {
    if (applied.has(name)) {
      console.log(`  skip: ${name}`);
      continue;
    }

    const sqlPath = join(migrationsDir, name, "migration.sql");
    const sql = await readFile(sqlPath, "utf-8");

    console.log(`  apply: ${name}`);
    await client.executeMultiple(sql);
    await client.execute({
      sql: `INSERT INTO _prisma_migrations (id, migration_name, finished_at, applied_steps_count)
            VALUES (?, ?, datetime('now'), 1)`,
      args: [randomUUID(), name],
    });
    pendingCount++;
  }

  if (pendingCount === 0) {
    console.log("Already up to date.");
  } else {
    console.log(`Applied ${pendingCount} migration(s).`);
  }
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
