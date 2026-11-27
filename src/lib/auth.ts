import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { nextCookies } from 'better-auth/next-js'
import { hashPassword, verifyPassword } from 'better-auth/crypto'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import * as schema from '@/db/schema'

const siteUrl = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const auth = betterAuth({
  baseURL: siteUrl,
  // El límite de intentos vive en la base (tabla no requerida: memoria alcanza con una sola réplica).
  rateLimit: {
    window: 60,
    max: 100,
    customRules: { '/sign-in/email': { window: 300, max: 10 } },
  },
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  emailAndPassword: {
    enabled: true,
    // Sin registro público: las cuentas las crea un admin (alumnos) o scripts/crear-usuario.mts (admins).
    disableSignUp: true,
    // Los usuarios traídos de Supabase conservan su hash bcrypt ($2a$/$2b$/$2y$) y entran con la misma contraseña;
    // las contraseñas nuevas usan el hash por defecto de Better Auth (scrypt).
    password: {
      hash: hashPassword,
      verify: ({ hash, password }) =>
        /^\$2[aby]\$/.test(hash) ? bcrypt.compare(password, hash) : verifyPassword({ hash, password }),
    },
  },
  // Rol y bandera de contraseña temporal: solo los escribe el servidor (input:false).
  user: {
    additionalFields: {
      role: { type: 'string', defaultValue: 'admin', input: false },
      mustChangePassword: { type: 'boolean', defaultValue: false, input: false },
    },
  },
  plugins: [nextCookies()], // siempre el último plugin
})
