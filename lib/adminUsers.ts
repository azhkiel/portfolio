// Helper SERVER-ONLY — jangan diimpor di Client Component.
// Menggabungkan tabel `profiles` dengan Supabase Auth (sumber kebenaran)
// karena baris profiles bisa tidak tercipta saat register (mis. email
// belum dikonfirmasi sehingga RLS insert gagal).

import { createClient as createServiceClient } from '@supabase/supabase-js'

export interface AdminUser {
  id: string
  username: string
  role: string
  created_at: string
}

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error('Konfigurasi server tidak lengkap')
  }
  return createServiceClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

function usernameFallback(email?: string | null, metadataUsername?: unknown): string {
  if (typeof metadataUsername === 'string' && metadataUsername.trim()) {
    return metadataUsername.trim().toLowerCase()
  }
  if (email && email.includes('@')) {
    return email.split('@')[0].toLowerCase()
  }
  return 'user'
}

/**
 * Ambil semua pengguna: Auth sebagai sumber kebenaran, diperkaya data
 * username/role dari `profiles` bila barisnya ada.
 */
export async function fetchAllUsers(): Promise<AdminUser[]> {
  const client = serviceClient()

  const [profilesRes, authRes] = await Promise.all([
    client
      .from('profiles')
      .select('id, username, role, created_at')
      .order('created_at', { ascending: false }),
    client.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ])

  if (profilesRes.error) {
    console.error('[adminUsers] gagal memuat profiles:', profilesRes.error.message)
  }
  if (authRes.error) {
    console.error('[adminUsers] gagal memuat auth users:', authRes.error.message)
  }

  const profilesById = new Map<string, { username: string; role: string; created_at: string }>()
  for (const p of profilesRes.data ?? []) {
    profilesById.set(p.id, {
      username: p.username,
      role: p.role,
      created_at: p.created_at,
    })
  }

  const merged: AdminUser[] = (authRes.data?.users ?? []).map(u => {
    const profile = profilesById.get(u.id)
    profilesById.delete(u.id)
    return {
      id: u.id,
      username: profile?.username ?? usernameFallback(u.email, u.user_metadata?.username),
      role: profile?.role ?? (typeof u.user_metadata?.role === 'string' ? u.user_metadata.role : 'user'),
      created_at: u.created_at,
    }
  })

  // Baris profiles yatim (auth user sudah dihapus tapi cascade belum jalan) tetap sertakan
  for (const [id, p] of profilesById) {
    merged.push({ id, username: p.username, role: p.role, created_at: p.created_at })
  }

  merged.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
  return merged
}
