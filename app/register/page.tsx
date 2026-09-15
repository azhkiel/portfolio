'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirm) { setError('Password tidak cocok.'); return }
    if (password.length < 6) { setError('Password minimal 6 karakter.'); return }
    if (username.trim().length < 3) { setError('Username minimal 3 karakter.'); return }

    setLoading(true)
    const supabase = createClient()

    // Cek username sudah dipakai belum
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username.trim().toLowerCase())
      .single()

    if (existing) {
      setError('Username sudah dipakai, coba yang lain.')
      setLoading(false)
      return
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username: username.trim().toLowerCase() },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      const usernameLower = username.trim().toLowerCase()

      if (data.session) {
        // Sudah ada session (email confirm nonaktif) → buat profiles sekarang.
        // RLS "profiles: insert saat register" butuh auth.uid() = id.
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          username: usernameLower,
          role: 'user',
        })

        if (profileError) {
          // Jangan diam: username duplikat & RLS perlu terlihat user/dev.
          if (profileError.code === '23505') {
            setError('Username sudah dipakai, coba yang lain.')
          } else {
            setError(`Pendaftaran berhasil tapi profil gagal dibuat: ${profileError.message}`)
          }
          setLoading(false)
          return
        }

        router.push('/links')
        router.refresh()
      } else {
        // Email confirm aktif → belum ada session, insert akan gagal RLS.
        // Profil dibuat otomatis saat login pertama. Minta user cek email.
        setLoading(false)
        setSuccess(`Akun dibuat! Cek email ${email} untuk konfirmasi, lalu login.`)
        return
      }
    }
  }

  return (
    <div
      className="min-h-screen bg-white flex items-center justify-center p-4"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <div className="border border-gray-200 rounded-xl w-full max-w-sm p-8 shadow-sm">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-gray-900">Buat akun</h1>
          <p className="text-gray-400 text-sm mt-1">Gratis, selamanya</p>
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="azriel123"
              required
              minLength={3}
              maxLength={30}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-black focus:outline-none transition-colors"
            />
          </div>

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
              placeholder="Min. 6 karakter"
              required
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-black focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Konfirmasi password</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Ulangi password"
              required
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-black focus:outline-none transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {success && (
            <p className="text-green-600 text-sm">{success}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Mendaftar...' : 'Daftar'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-black font-medium hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  )
}
