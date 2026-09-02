'use client'

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  loading?: boolean
  itemType?: 'link' | 'note'
}

export default function DeleteModal({ open, onClose, onConfirm, loading, itemType = 'link' }: Props) {
  if (!open) return null

  const labels = {
    link: { title: 'Hapus link?', desc: 'Link ini akan dihapus permanen dan tidak bisa dikembalikan.' },
    note: { title: 'Hapus catatan?', desc: 'Catatan ini akan dihapus permanen dan tidak bisa dikembalikan.' },
  }

  const { title, desc } = labels[itemType]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-xl w-full max-w-sm p-6 shadow-md text-center"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-500 text-sm mb-6">{desc}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Menghapus...' : 'Hapus'}
          </button>
        </div>
      </div>
    </div>
  )
}
