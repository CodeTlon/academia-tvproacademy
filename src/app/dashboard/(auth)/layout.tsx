import Image from 'next/image'

export default function DashboardAuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    /* Cubre cualquier layout público con z-index alto */
    <div className="fixed inset-0 z-[100] lg:grid lg:grid-cols-2">
      <div className="hidden lg:block relative h-screen">
        <Image src="/images/hero.webp" alt="" fill priority sizes="50vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent" />
      </div>

      <div className="flex items-center justify-center h-screen bg-zinc-50 p-6 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
