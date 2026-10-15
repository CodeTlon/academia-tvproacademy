import { guardPage } from '@/lib/session'
import PanelShell from './PanelShell'

export default async function DashboardPanelLayout({ children }: { children: React.ReactNode }) {
  await guardPage('dashboard')
  return <PanelShell>{children}</PanelShell>
}
