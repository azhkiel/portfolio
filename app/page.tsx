import { createClient } from '@/lib/supabase/server'
import HomeClient from './HomeClient'

async function getProjects() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('projects')
    .select('*')
    .order('sort_order', { ascending: true })
  return data ?? []
}

async function getContact() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('contact_info')
    .select('*')
    .single()
  return data
}

export default async function HomePage() {
  const [projects, contact] = await Promise.all([getProjects(), getContact()])

  return <HomeClient projects={projects} contact={contact} />
}
