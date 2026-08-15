import { createSupabaseServerClient } from '@/lib/supabase-server'
import NavbarClient from './NavbarClient'

export default async function Navbar() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  const panelHref = user ? (user.user_metadata?.role === 'student' ? '/portal' : '/dashboard') : null
  return <NavbarClient panelHref={panelHref} />
}
