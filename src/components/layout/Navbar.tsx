import { getSiteSettings } from '@/lib/site-settings'
import NavbarClient from './NavbarClient'

export default async function Navbar() {
  const settings = await getSiteSettings()
  return <NavbarClient whatsapp={settings.business.whatsapp} />
}
