import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import AssistanceDashboard from './AssistanceDashboard'

export default async function DashboardAssistancePage() {
  await requireAdmin()
  const supabase = await createClient()
  const { data } = await supabase
    .from('testimonials')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  return <AssistanceDashboard initialTestimonials={data ?? []} />
}
