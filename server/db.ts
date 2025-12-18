import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL || process.env.DEV_DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/book_harbor";

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle(pool, { schema });


