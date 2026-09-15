import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchAllUsers } from '@/lib/adminUsers'

export async function GET() {
  // Verifikasi caller adalah admin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const users = await fetchAllUsers()
    return NextResponse.json({ users })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Gagal memuat pengguna' },
      { status: 500 },
    )
  }
}
