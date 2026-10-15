import { getUser, homeFor, isStudent } from '@/lib/session'
import NavbarClient from './NavbarClient'

export default async function Navbar() {
  const user = await getUser()
  const panelHref = user ? homeFor(user) : null
  const panelLabel = user ? (isStudent(user) ? 'Mi portal' : 'Mi dashboard') : null
  return <NavbarClient panelHref={panelHref} panelLabel={panelLabel} />
}
