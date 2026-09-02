'use client'

import { useState } from 'react'
import { uploadFeedAction } from './actions'
import Image from 'next/image'

export default function FeedForm() {
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [caption, setCaption] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      if (files.length + images.length > 5) {
        setError('Maksimal 5 gambar diperbolehkan.')
        return
      }
      setError('')
      setImages(prev => [...prev, ...files])
      
      const newPreviews = files.map(file => URL.createObjectURL(file))
      setPreviews(prev => [...prev, ...newPreviews])
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('caption', caption)
    images.forEach(img => formData.append('images', img))

    const res = await uploadFeedAction(formData)
    
    if (res?.error) {
      setError(res.error)
    } else {
      setImages([])
      setPreviews([])
      setCaption('')
      alert('Post berhasil diunggah!')
    }
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <h1 className="text-2xl font-bold mb-6 text-black">Buat Feed Baru</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Caption</label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-black focus:border-black transition-colors"
            rows={4}
            placeholder="Tulis caption Anda di sini..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gambar (Max 5) - Terpilih: {images.length}/5
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            disabled={images.length >= 5}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-black file:text-white
              hover:file:bg-gray-800 file:cursor-pointer transition-colors"
          />
        </div>

        {previews.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {previews.map((src, idx) => (
              <div key={idx} className="relative aspect-square group rounded-lg overflow-hidden border border-gray-200">
                <Image src={src} alt={`Preview ${idx}`} fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-medium"
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || images.length === 0}
          className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Mengunggah...' : 'Unggah Post'}
        </button>
      </form>
    </div>
  )
}
