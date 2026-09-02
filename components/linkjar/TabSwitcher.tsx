'use client'

interface Props {
  active: 'links' | 'notes'
  onChange: (tab: 'links' | 'notes') => void
  linksCount: number
  notesCount: number
}

export default function TabSwitcher({ active, onChange, linksCount, notesCount }: Props) {
  return (
    <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit" style={{ fontFamily: 'Inter, sans-serif' }}>
      <button
        onClick={() => onChange('links')}
        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
          active === 'links'
            ? 'bg-black text-white shadow-sm'
            : 'text-gray-500 hover:text-black'
        }`}
      >
        Links
        <span className={`ml-1.5 text-xs ${active === 'links' ? 'text-white/70' : 'text-gray-400'}`}>
          {linksCount}
        </span>
      </button>
      <button
        onClick={() => onChange('notes')}
        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
          active === 'notes'
            ? 'bg-black text-white shadow-sm'
            : 'text-gray-500 hover:text-black'
        }`}
      >
        Notes
        <span className={`ml-1.5 text-xs ${active === 'notes' ? 'text-white/70' : 'text-gray-400'}`}>
          {notesCount}
        </span>
      </button>
    </div>
  )
}
