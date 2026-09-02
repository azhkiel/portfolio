import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LinksDashboard from './LinksDashboard'

export default async function LinksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  const [{ data: links }, { data: notes }] = await Promise.all([
    supabase.from('links').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('notes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
  ])

  return (
    <LinksDashboard
      initialLinks={links ?? []}
      initialNotes={notes ?? []}
      username={profile?.username ?? user.email ?? 'Pengguna'}
      userId={user.id}
    />
  )
}
