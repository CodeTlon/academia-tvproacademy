import { createSupabaseServerClient } from '@/lib/supabase-server'
import NavbarClient from './NavbarClient'

export default async function Navbar() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isStudent = user?.user_metadata?.role === 'student'
  const panelHref = user ? (isStudent ? '/portal' : '/dashboard') : null
  const panelLabel = user ? (isStudent ? 'Mi portal' : 'Mi dashboard') : null
  return <NavbarClient panelHref={panelHref} panelLabel={panelLabel} />
}
