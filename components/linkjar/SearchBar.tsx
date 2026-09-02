'use client'

import { SearchIcon, XIcon } from 'lucide-react'

interface Props {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

export default function SearchBar({ value, onChange, placeholder = 'Cari...' }: Props) {
  return (
    <div className="relative" style={{ fontFamily: 'Inter, sans-serif' }}>
      <SearchIcon
        size={16}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-9 py-2 rounded-lg border border-gray-200 text-sm focus:border-black focus:outline-none transition-colors bg-white"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded transition-colors"
          aria-label="Hapus pencarian"
        >
          <XIcon size={14} />
        </button>
      )}
    </div>
  )
}
