'use client'

import { useState } from 'react'
import { XIcon, PinIcon } from 'lucide-react'
import type { NoteItem } from './NoteCard'

type ColorOption = 'default' | 'muted' | 'dark'

const colorOptions: { value: ColorOption; label: string; cls: string }[] = [
  { value: 'default', label: 'Putih', cls: 'bg-white border-2 border-gray-300' },
  { value: 'muted', label: 'Abu', cls: 'bg-gray-100 border-2 border-gray-300' },
  { value: 'dark', label: 'Gelap', cls: 'bg-black border-2 border-black' },
]

interface Props {
  open: boolean
  editTarget: NoteItem | null
  onClose: () => void
  onSave: (data: { title: string; content: string; color: ColorOption; pinned: boolean }) => Promise<void>
  loading?: boolean
}

export default function NoteModal({ open, editTarget, onClose, onSave, loading }: Props) {
  const [title, setTitle] = useState(editTarget?.title ?? '')
  const [content, setContent] = useState(editTarget?.content ?? '')
  const [color, setColor] = useState<ColorOption>(editTarget?.color ?? 'default')
  const [pinned, setPinned] = useState(editTarget?.pinned ?? false)

  // Sync with editTarget when it changes
  useState(() => {
    setTitle(editTarget?.title ?? '')
    setContent(editTarget?.content ?? '')
    setColor(editTarget?.color ?? 'default')
    setPinned(editTarget?.pinned ?? false)
  })

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await onSave({ title: title.trim(), content: content.trim(), color, pinned })
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
            {editTarget ? 'Edit catatan' : 'Catatan baru'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
            <XIcon size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Judul (opsional)"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-black focus:outline-none"
          />

          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Tulis catatan..."
            rows={5}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-black focus:outline-none resize-none"
          />

          {/* Color picker */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">Warna:</span>
            {colorOptions.map(opt => (
              <button
                key={opt.value}
                type="button"
                title={opt.label}
                onClick={() => setColor(opt.value)}
                className={`w-6 h-6 rounded-full ${opt.cls} transition-transform ${color === opt.value ? 'scale-125' : ''}`}
              />
            ))}
          </div>

          {/* Pin toggle */}
          <button
            type="button"
            onClick={() => setPinned(p => !p)}
            className={`flex items-center gap-2 text-sm w-fit px-3 py-1.5 rounded-lg border transition-colors ${
              pinned ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-500 hover:border-black hover:text-black'
            }`}
          >
            <PinIcon size={13} />
            {pinned ? 'Di-pin' : 'Pin catatan'}
          </button>

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || (!title.trim() && !content.trim())}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
