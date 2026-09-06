import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Lazy-initialized so `next build` doesn't crash if DATABASE_URL isn't set
// yet at build time (e.g. before the Neon integration has run). Do NOT wrap
// this in a Proxy — a plain lazy singleton is enough and avoids breaking
// libraries that introspect the client.
let _db: ReturnType<typeof createDb> | null = null;

function createDb() {
  const sql = neon(process.env.DATABASE_URL!);
  return drizzle(sql, { schema });
}

export function getDb() {
  if (!_db) _db = createDb();
  return _db;
}
