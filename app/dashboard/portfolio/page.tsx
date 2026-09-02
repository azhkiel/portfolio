import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import PortfolioDashboard from './PortfolioDashboard'

export default async function DashboardPortfolioPage() {
  await requireAdmin()
  const supabase = await createClient()

  const [projectsRes, contactRes] = await Promise.all([
    supabase.from('projects').select('*').order('sort_order', { ascending: true }),
    supabase.from('contact_info').select('*').single(),
  ])

  // Fetch semua user LinkJar menggunakan service role (bypass RLS)
  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  const { data: users } = await serviceClient
    .from('profiles')
    .select('id, username, role, created_at')
    .order('created_at', { ascending: false })

  return (
    <PortfolioDashboard
      initialProjects={projectsRes.data ?? []}
      initialContact={contactRes.data}
      initialUsers={users ?? []}
    />
  )
}
