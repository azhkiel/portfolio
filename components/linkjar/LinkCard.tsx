'use client'

import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'
import { PencilIcon, Trash2Icon, GlobeIcon } from 'lucide-react'

export interface LinkItem {
  id: string
  link: string
  caption: string | null
  created_at: string
}

interface Props {
  link: LinkItem
  onEdit: (link: LinkItem) => void
  onDelete: (link: LinkItem) => void
}

function getDomain(url: string) {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

function getFavicon(url: string) {
  try {
    const { protocol, hostname } = new URL(url)
    return `https://www.google.com/s2/favicons?domain=${protocol}//${hostname}&sz=32`
  } catch {
    return null
  }
}

export default function LinkCard({ link, onEdit, onDelete }: Props) {
  const domain = getDomain(link.link)
  const favicon = getFavicon(link.link)
  const timeAgo = formatDistanceToNow(new Date(link.created_at), { addSuffix: true, locale: id })

  return (
    <div
      className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 flex items-start gap-3.5 group hover:border-gray-300 transition-colors"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* Favicon */}
      <div className="flex-shrink-0 w-9 h-9 rounded-md bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden">
        {favicon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={favicon} alt={domain} width={18} height={18} className="w-4.5 h-4.5 object-contain" />
        ) : (
          <GlobeIcon size={16} className="text-gray-400" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <a
          href={link.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-900 font-medium text-sm hover:underline truncate block"
        >
          {link.caption || link.link}
        </a>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">
            {domain}
          </span>
          <span className="text-gray-400 text-xs">{timeAgo}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          onClick={() => onEdit(link)}
          className="p-1.5 rounded-md text-gray-400 hover:text-black hover:bg-gray-100 transition-colors"
          aria-label="Edit"
          title="Edit"
        >
          <PencilIcon size={14} />
        </button>
        <button
          onClick={() => onDelete(link)}
          className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          aria-label="Hapus"
          title="Hapus"
        >
          <Trash2Icon size={14} />
        </button>
      </div>
    </div>
  )
}
