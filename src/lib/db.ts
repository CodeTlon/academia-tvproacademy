import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from '@/db/schema'

// Singleton: en serverless (Vercel) evita abrir un pool por invocación.
// Placeholder para que el build de CI funcione sin credenciales reales:
// las consultas solo ocurren en runtime, nunca a nivel de módulo.
const globalForDb = globalThis as unknown as { pool?: Pool }

const pool =
  globalForDb.pool ??
  new Pool({
    connectionString:
      process.env.DATABASE_URL ?? 'postgres://placeholder:placeholder@localhost:5432/placeholder',
    max: 3, // pool chico para serverless
  })
if (process.env.NODE_ENV !== 'production') globalForDb.pool = pool

export const db = drizzle({ client: pool, schema })
