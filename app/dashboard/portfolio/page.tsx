import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { fetchAllUsers } from '@/lib/adminUsers'
import PortfolioDashboard from './PortfolioDashboard'

export default async function DashboardPortfolioPage() {
  await requireAdmin()
  const supabase = await createClient()

  const [projectsRes, contactRes] = await Promise.all([
    supabase.from('projects').select('*').order('sort_order', { ascending: true }),
    supabase.from('contact_info').select('*').single(),
  ])

  // Auth sebagai sumber kebenaran, diperkaya tabel profiles (bypass RLS via service role).
  // profiles bisa kosong untuk user lama karena insert saat register gagal diam-diam.
  let users: Awaited<ReturnType<typeof fetchAllUsers>> = []
  try {
    users = await fetchAllUsers()
  } catch (e) {
    console.error('[dashboard/portfolio] gagal memuat pengguna:', e instanceof Error ? e.message : e)
  }

  return (
    <PortfolioDashboard
      initialProjects={projectsRes.data ?? []}
      initialContact={contactRes.data}
      initialUsers={users}
    />
  )
}
