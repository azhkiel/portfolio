'use client'

import { PinIcon, ArchiveIcon, Trash2Icon } from 'lucide-react'

export interface NoteItem {
  id: string
  user_id: string
  title: string | null
  content: string | null
  color: 'default' | 'muted' | 'dark'
  pinned: boolean
  archived: boolean
  created_at: string
  updated_at: string
}

interface Props {
  note: NoteItem
  onEdit: (note: NoteItem) => void
  onPin: (note: NoteItem) => void
  onArchive: (note: NoteItem) => void
  onDelete: (note: NoteItem) => void
}

const colorMap = {
  default: 'bg-white border border-gray-200',
  muted: 'bg-gray-50 border border-gray-200',
  dark: 'bg-black border border-black text-white',
}

export default function NoteCard({ note, onEdit, onPin, onArchive, onDelete }: Props) {
  const isDark = note.color === 'dark'

  return (
    <div
      className={`${colorMap[note.color]} rounded-lg p-4 cursor-pointer group relative break-inside-avoid mb-3 transition-shadow hover:shadow-md`}
      onClick={() => onEdit(note)}
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {note.title && (
        <p className={`font-semibold text-sm mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {note.title}
        </p>
      )}
      {note.content && (
        <p className={`text-sm leading-relaxed line-clamp-6 whitespace-pre-wrap ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {note.content}
        </p>
      )}

      {/* Actions — visible on hover */}
      <div
        className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onPin(note)}
          title={note.pinned ? 'Unpin' : 'Pin'}
          className={`p-1.5 rounded-md transition-colors ${
            isDark
              ? note.pinned ? 'text-white' : 'text-white/40 hover:text-white'
              : note.pinned ? 'text-black' : 'text-gray-300 hover:text-black'
          }`}
        >
          <PinIcon size={14} />
        </button>
        <button
          onClick={() => onArchive(note)}
          title={note.archived ? 'Unarchive' : 'Archive'}
          className={`p-1.5 rounded-md transition-colors ${
            isDark ? 'text-white/40 hover:text-white' : 'text-gray-300 hover:text-gray-600'
          }`}
        >
          <ArchiveIcon size={14} />
        </button>
        <button
          onClick={() => onDelete(note)}
          title="Hapus"
          className="p-1.5 rounded-md transition-colors text-gray-300 hover:text-red-500"
        >
          <Trash2Icon size={14} />
        </button>
      </div>
    </div>
  )
}
