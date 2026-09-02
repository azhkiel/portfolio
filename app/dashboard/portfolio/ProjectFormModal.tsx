'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Project } from '@/components/portfolio/ProjectCard'

interface Props {
  open: boolean
  editTarget: Project | null
  onClose: () => void
  onSaved: (project: Project, isEdit: boolean) => void
}

export default function ProjectFormModal({ open, editTarget, onClose, onSaved }: Props) {
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [link, setLink] = useState('')
  const [tags, setTags] = useState('')
  const [sortOrder, setSortOrder] = useState(0)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (editTarget) {
      setTitle(editTarget.title)
      setDescription(editTarget.description ?? '')
      setLink(editTarget.link ?? '')
      setTags(editTarget.tags.join(', '))
      setSortOrder(editTarget.sort_order)
      setImagePreview(editTarget.image_url)
    } else {
      setTitle('')
      setDescription('')
      setLink('')
      setTags('')
      setSortOrder(0)
      setImagePreview(null)
    }
    setImageFile(null)
    setError('')
  }, [editTarget, open])

  if (!open) return null

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function uploadImage(file: File): Promise<string | null> {
    // Compress/resize di client sederhana via canvas
    return new Promise((resolve) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = async () => {
        const maxW = 1200
        const scale = img.width > maxW ? maxW / img.width : 1
        const canvas = document.createElement('canvas')
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        canvas.toBlob(async (blob) => {
          if (!blob) { resolve(null); return }
          const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`
          const { data, error } = await supabase.storage
            .from('portfolio-images')
            .upload(filename, blob, { contentType: 'image/jpeg', upsert: true })
          if (error) { resolve(null); return }
          const { data: urlData } = supabase.storage.from('portfolio-images').getPublicUrl(data.path)
          resolve(urlData.publicUrl)
        }, 'image/jpeg', 0.85)
        URL.revokeObjectURL(url)
      }
      img.src = url
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    let imageUrl = editTarget?.image_url ?? null

    if (imageFile) {
      const uploaded = await uploadImage(imageFile)
      if (!uploaded) { setError('Gagal upload gambar.'); setSaving(false); return }
      // Hapus gambar lama
      if (editTarget?.image_url && editTarget.image_url.includes('supabase')) {
        const path = editTarget.image_url.split('/portfolio-images/')[1]
        if (path) await supabase.storage.from('portfolio-images').remove([path])
      }
      imageUrl = uploaded
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      image_url: imageUrl,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      link: link.trim() || null,
      sort_order: sortOrder,
      updated_at: new Date().toISOString(),
    }

    if (editTarget) {
      const { data, error: err } = await supabase
        .from('projects')
        .update(payload)
        .eq('id', editTarget.id)
        .select()
        .single()
      if (err) { setError('Gagal menyimpan.'); setSaving(false); return }
      onSaved(data as Project, true)
    } else {
      const { data, error: err } = await supabase
        .from('projects')
        .insert(payload)
        .select()
        .single()
      if (err) { setError('Gagal menambah proyek.'); setSaving(false); return }
      onSaved(data as Project, false)
    }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
         onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
           style={{ fontFamily: 'Inter, sans-serif' }}>
        <h2 className="text-xl font-bold text-gray-800 mb-5">
          {editTarget ? 'Edit Proyek' : 'Tambah Proyek Baru'}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Gambar Proyek</label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
                 onClick={() => fileRef.current?.click()}>
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg mx-auto" />
              ) : (
                <div className="py-6 text-gray-400">
                  <div className="text-3xl mb-1">📷</div>
                  <p className="text-sm">Klik untuk upload gambar</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Judul <span className="text-red-500">*</span></label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
                   placeholder="Nama proyek"
                   className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                      placeholder="Deskripsi singkat proyek"
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none resize-none" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Tags</label>
            <input type="text" value={tags} onChange={e => setTags(e.target.value)}
                   placeholder="Laravel, React, Tailwind (pisahkan dengan koma)"
                   className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Link Proyek</label>
            <input type="url" value={link} onChange={e => setLink(e.target.value)}
                   placeholder="https://github.com/..."
                   className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Urutan Tampil</label>
            <input type="number" value={sortOrder} onChange={e => setSortOrder(Number(e.target.value))}
                   min={0}
                   className="w-32 px-3 py-2.5 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none" />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors">
              Batal
            </button>
            <button type="submit" disabled={saving}
                    className="flex-1 py-2.5 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
              {saving ? 'Menyimpan...' : editTarget ? 'Simpan' : 'Tambah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
