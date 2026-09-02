'use client'

import NoteCard, { type NoteItem } from './NoteCard'

interface Props {
  notes: NoteItem[]
  showArchived: boolean
  onEdit: (note: NoteItem) => void
  onPin: (note: NoteItem) => void
  onArchive: (note: NoteItem) => void
  onDelete: (note: NoteItem) => void
}

export default function NotesGrid({ notes, showArchived, onEdit, onPin, onArchive, onDelete }: Props) {
  const active = notes.filter(n => !n.archived)
  const archived = notes.filter(n => n.archived)
  const pinned = active.filter(n => n.pinned)
  const others = active.filter(n => !n.pinned)

  if (notes.length === 0) {
    return (
      <div className="text-center py-20" style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="w-12 h-12 border-2 border-dashed border-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
          <span className="text-gray-300 text-lg">✎</span>
        </div>
        <p className="text-gray-500 text-sm font-medium">Belum ada catatan.</p>
        <p className="text-gray-400 text-xs mt-1">Klik area di atas untuk tulis yang pertama.</p>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Pinned section */}
      {pinned.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Disematkan</p>
          <div className="columns-1 sm:columns-2 lg:columns-3">
            {pinned.map(n => (
              <NoteCard key={n.id} note={n} onEdit={onEdit} onPin={onPin} onArchive={onArchive} onDelete={onDelete} />
            ))}
          </div>
        </div>
      )}

      {/* Others section */}
      {others.length > 0 && (
        <div className="mb-6">
          {pinned.length > 0 && (
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Lainnya</p>
          )}
          <div className="columns-1 sm:columns-2 lg:columns-3">
            {others.map(n => (
              <NoteCard key={n.id} note={n} onEdit={onEdit} onPin={onPin} onArchive={onArchive} onDelete={onDelete} />
            ))}
          </div>
        </div>
      )}

      {/* Archived section */}
      {showArchived && archived.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Diarsipkan</p>
          <div className="columns-1 sm:columns-2 lg:columns-3">
            {archived.map(n => (
              <NoteCard key={n.id} note={n} onEdit={onEdit} onPin={onPin} onArchive={onArchive} onDelete={onDelete} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
