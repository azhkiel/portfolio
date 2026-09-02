'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ContactInfo {
  id?: string
  github: string
  email: string
  linkedin: string
  instagram: string
}

interface Props {
  open: boolean
  initialData: ContactInfo | null
  onClose: () => void
  onSaved: (data: ContactInfo) => void
}

export default function ContactFormModal({ open, initialData, onClose, onSaved }: Props) {
  const supabase = createClient()

  const [github, setGithub] = useState('')
  const [email, setEmail] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [instagram, setInstagram] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (initialData) {
      setGithub(initialData.github ?? '')
      setEmail(initialData.email ?? '')
      setLinkedin(initialData.linkedin ?? '')
      setInstagram(initialData.instagram ?? '')
    } else {
      setGithub('https://github.com/azhkiel')
      setEmail('azrielskm5@gmail.com')
      setLinkedin('https://www.linkedin.com/in/moch-azriel-maulana-racmadhani-32435528b')
      setInstagram('https://www.instagram.com/azhkiel/')
    }
    setError('')
  }, [initialData, open])

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      github: github.trim(),
      email: email.trim(),
      linkedin: linkedin.trim(),
      instagram: instagram.trim(),
    }

    let result
    if (initialData?.id) {
      const { data, error: err } = await supabase
        .from('contact_info')
        .update(payload)
        .eq('id', initialData.id)
        .select()
        .single()
      result = { data, error: err }
    } else {
      const { data, error: err } = await supabase
        .from('contact_info')
        .insert(payload)
        .select()
        .single()
      result = { data, error: err }
    }

    if (result.error) {
      setError('Gagal menyimpan kontak.')
      setSaving(false)
      return
    }

    onSaved(result.data as ContactInfo)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
         onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl"
           style={{ fontFamily: 'Inter, sans-serif' }}>
        <h2 className="text-xl font-bold text-gray-800 mb-5">Edit Informasi Kontak</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {[
            { label: 'GitHub URL', value: github, set: setGithub, placeholder: 'https://github.com/...' },
            { label: 'Email', value: email, set: setEmail, placeholder: 'email@domain.com' },
            { label: 'LinkedIn URL', value: linkedin, set: setLinkedin, placeholder: 'https://linkedin.com/in/...' },
            { label: 'Instagram URL', value: instagram, set: setInstagram, placeholder: 'https://instagram.com/...' },
          ].map(field => (
            <div key={field.label}>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{field.label}</label>
              <input
                type="text"
                value={field.value}
                onChange={e => field.set(e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none"
              />
            </div>
          ))}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors">
              Batal
            </button>
            <button type="submit" disabled={saving}
                    className="flex-1 py-2.5 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-60">
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
