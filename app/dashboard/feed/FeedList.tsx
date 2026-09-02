'use client'

import { useState } from 'react'
import Image from 'next/image'
import { deleteFeedAction, updateFeedAction } from './actions'

export default function FeedList({ initialFeeds }: { initialFeeds: any[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editCaption, setEditCaption] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const startEdit = (feed: any) => {
    setEditingId(feed.id)
    setEditCaption(feed.caption || '')
  }

  const handleUpdate = async (id: string) => {
    setLoadingId(id)
    const res = await updateFeedAction(id, editCaption)
    if (res?.error) alert(res.error)
    else setEditingId(null)
    setLoadingId(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus post ini? Gambar di R2 juga akan dihapus permanen.')) return
    
    setLoadingId(id)
    const res = await deleteFeedAction(id)
    if (res?.error) alert(res.error)
    setLoadingId(null)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-black">Kelola Feed Anda</h2>
      </div>
      
      <div className="divide-y divide-gray-200">
        {!initialFeeds || initialFeeds.length === 0 ? (
          <div className="p-6 text-center text-gray-500">Belum ada post.</div>
        ) : (
          initialFeeds.map(feed => (
            <div key={feed.id} className="p-6 flex flex-col md:flex-row gap-6">
              
              {/* Gambar Pertama sbg Thumbnail */}
              <div className="w-full md:w-48 aspect-square relative rounded-lg overflow-hidden bg-gray-100 shrink-0">
                {feed.feed_images && feed.feed_images.length > 0 ? (
                  <Image 
                    src={feed.feed_images.sort((a: any, b: any) => a.order_index - b.order_index)[0].image_url} 
                    alt="Thumbnail" 
                    fill 
                    className="object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                )}
                {feed.feed_images && feed.feed_images.length > 1 && (
                  <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                    +{feed.feed_images.length - 1}
                  </div>
                )}
              </div>

              {/* Konten & Aksi */}
              <div className="flex-1 flex flex-col">
                <div className="text-sm text-gray-400 mb-2">
                  Dibuat pada: {new Date(feed.created_at).toLocaleString('id-ID')}
                </div>
                
                {editingId === feed.id ? (
                  <div className="flex-1 flex flex-col gap-3">
                    <textarea
                      value={editCaption}
                      onChange={e => setEditCaption(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-black focus:border-black"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleUpdate(feed.id)}
                        disabled={loadingId === feed.id}
                        className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50"
                      >
                        {loadingId === feed.id ? 'Menyimpan...' : 'Simpan'}
                      </button>
                      <button 
                        onClick={() => setEditingId(null)}
                        disabled={loadingId === feed.id}
                        className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col justify-between">
                    <p className="text-gray-800 text-sm whitespace-pre-wrap">
                      {feed.caption || <span className="italic text-gray-400">Tidak ada caption.</span>}
                    </p>
                    
                    <div className="flex gap-3 mt-4">
                      <button 
                        onClick={() => startEdit(feed)}
                        disabled={loadingId === feed.id}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50"
                      >
                        Edit Caption
                      </button>
                      <button 
                        onClick={() => handleDelete(feed.id)}
                        disabled={loadingId === feed.id}
                        className="text-sm font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
                      >
                        {loadingId === feed.id ? 'Menghapus...' : 'Hapus Post'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
