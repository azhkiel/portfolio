'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Email atau password salah.')
      setLoading(false)
      return
    }

    // Cek role lalu redirect
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (!profile) {
      // Self-healing: user ada di Auth tapi baris profiles belum tercipta
      // (mis. register saat email-confirm aktif). Buat sekarang, session sudah ada
      // sehingga RLS "insert saat register" lolos.
      const fallbackUsername =
        (typeof data.user.user_metadata?.username === 'string' &&
          data.user.user_metadata.username.trim()) ||
        (data.user.email?.split('@')[0] ?? 'user')
      const { error: insertError } = await supabase.from('profiles').insert({
        id: data.user.id,
        username: fallbackUsername.toLowerCase(),
        role: 'user',
      })
      if (insertError && insertError.code !== '23505') {
        setError(`Login berhasil tapi profil gagal dibuat: ${insertError.message}`)
        setLoading(false)
        return
      }
    }

    const destination = profile?.role === 'admin' ? '/dashboard/portfolio' : '/links'
    router.push(destination)
    router.refresh()
  }

  return (
    <div
      className="min-h-screen bg-white flex items-center justify-center p-4"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <div className="border border-gray-200 rounded-xl w-full max-w-sm p-8 shadow-sm">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-gray-900">Masuk</h1>
          <p className="text-gray-400 text-sm mt-1">Masuk ke akun LinkJar kamu</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="kamu@email.com"
              required
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-black focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-black focus:outline-none transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Masuk...' : 'Masuk'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Belum punya akun?{' '}
          <Link href="/register" className="text-black font-medium hover:underline">
            Daftar
          </Link>
        </p>
      </div>
    </div>
  )
}
