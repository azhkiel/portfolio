/**
 * Seed script — buat akun admin dummy di Supabase
 * Jalankan: node scripts/seed-admin.mjs
 *
 * Pastikan .env.local sudah diisi sebelum menjalankan ini.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// Baca .env.local manual (tidak pakai dotenv supaya zero-dependency)
const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '../.env.local')
const envContent = readFileSync(envPath, 'utf-8')

function parseEnv(content) {
  const env = {}
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim()
  }
  return env
}

const env = parseEnv(envContent)
const SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL']
const SERVICE_ROLE_KEY = env['SUPABASE_SERVICE_ROLE_KEY']

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY belum diisi di .env.local')
  process.exit(1)
}

// Gunakan service role untuk bypass RLS
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const ADMIN = {
  email: 'admin@azriel.dev',
  password: 'Admin1234!',
  username: 'azriel',
}

async function seedAdmin() {
  console.log('🌱 Membuat akun admin dummy...')

  // 1. Buat user di auth.users
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: ADMIN.email,
    password: ADMIN.password,
    email_confirm: true, // langsung confirm, tidak perlu cek email
  })

  if (authError) {
    if (authError.message.includes('already registered')) {
      console.log('ℹ️  User sudah ada, skip pembuatan auth user.')
    } else {
      console.error('❌ Gagal buat auth user:', authError.message)
      process.exit(1)
    }
  }

  const userId = authData?.user?.id

  if (userId) {
    // 2. Insert profile dengan role admin
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId,
      username: ADMIN.username,
      role: 'admin',
    })

    if (profileError) {
      console.error('❌ Gagal insert profile:', profileError.message)
      process.exit(1)
    }
  } else {
    // User sudah ada — pastikan role-nya admin
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('username', ADMIN.username)

    if (updateError) {
      console.error('❌ Gagal update role:', updateError.message)
    }
  }

  console.log('✅ Akun admin berhasil dibuat!')
  console.log('─────────────────────────────')
  console.log(`   Email    : ${ADMIN.email}`)
  console.log(`   Password : ${ADMIN.password}`)
  console.log(`   Username : ${ADMIN.username}`)
  console.log(`   Role     : admin`)
  console.log('─────────────────────────────')
  console.log('👉 Login di: http://localhost:3000/login')
  console.log('⚠️  Ganti password setelah pertama kali login di production!')
}

seedAdmin()
