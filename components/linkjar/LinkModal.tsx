'use client'

import { useState, useEffect } from 'react'
import { XIcon } from 'lucide-react'
import type { LinkItem } from './LinkCard'

interface Props {
  open: boolean
  editTarget: LinkItem | null
  onClose: () => void
  onSave: (data: { link: string; caption: string }) => Promise<void>
  loading?: boolean
}

export default function LinkModal({ open, editTarget, onClose, onSave, loading }: Props) {
  const [link, setLink] = useState('')
  const [caption, setCaption] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (editTarget) {
      setLink(editTarget.link)
      setCaption(editTarget.caption ?? '')
    } else {
      setLink('')
      setCaption('')
    }
    setError('')
  }, [editTarget, open])

  if (!open) return null

  function isValidUrl(url: string) {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValidUrl(link)) {
      setError('URL tidak valid. Contoh: https://example.com')
      return
    }
    setError('')
    await onSave({ link: link.trim(), caption: caption.trim() })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-xl w-full max-w-md p-6 shadow-md"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">
            {editTarget ? 'Edit Link' : 'Tambah Link Baru'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black transition-colors"
          >
            <XIcon size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              URL Link <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://example.com"
              required
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-black focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Caption <span className="text-gray-400 font-normal text-xs">(opsional)</span>
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Nama atau deskripsi link"
              maxLength={100}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-black focus:outline-none transition-colors"
            />
          </div>

          {error && <p className="text-red-600 text-xs font-medium">{error}</p>}

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Menyimpan...' : editTarget ? 'Simpan' : 'Tambah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
