// Alta de un admin del dashboard (no hay registro público). Uso:
//   npx tsx --env-file=.env.development.local scripts/crear-usuario.mts <email> <nombre> [admin|user]
// Imprime una contraseña temporal una sola vez; el usuario debe cambiarla con "Olvidé mi contraseña".
import { randomBytes } from 'node:crypto'
import { auth } from '../src/lib/auth'

const [email, name, role = 'admin'] = process.argv.slice(2)
if (!email || !name) {
  console.error('Uso: crear-usuario.mts <email> <nombre> [admin|user]')
  process.exit(1)
}

const ctx = await auth.$context
const existente = await ctx.internalAdapter.findUserByEmail(email.toLowerCase(), { includeAccounts: false })
if (existente) {
  console.error(`Ya existe un usuario con ${email}`)
  process.exit(1)
}

const password = randomBytes(18).toString('base64url')
const user = await ctx.internalAdapter.createUser({ email: email.toLowerCase(), name, emailVerified: true, role }, { method: 'email-password' })
await ctx.internalAdapter.linkAccount({
  userId: user.id,
  providerId: 'credential',
  accountId: user.id,
  password: await ctx.password.hash(password),
})
console.log(`Usuario creado: ${email} (${role})\nContraseña temporal: ${password}`)
process.exit(0)
