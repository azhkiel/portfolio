'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Toast, { type ToastMessage } from '@/components/linkjar/Toast'

type Testimonial = {
  id: string
  name: string
  service: string | null
  rating: number | null
  message: string
  screenshot_url: string | null
  sort_order: number
  is_published: boolean
  created_at: string
}

export default function AssistanceDashboard({ initialTestimonials }: { initialTestimonials: Testimonial[] }) {
  const router = useRouter()
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const [items, setItems] = useState<Testimonial[]>(initialTestimonials)
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Testimonial | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // form state
  const [name, setName] = useState('')
  const [service, setService] = useState('')
  const [rating, setRating] = useState<number | ''>(5)
  const [message, setMessage] = useState('')
  const [sortOrder, setSortOrder] = useState(0)
  const [isPublished, setIsPublished] = useState(true)
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [error, setError] = useState('')

  function addToast(msg: string, type: ToastMessage['type'] = 'success') {
    setToasts(prev => [...prev, { id: Math.random().toString(36).slice(2), message: msg, type }])
  }

  function openAdd() {
    setEditTarget(null)
    setName('')
    setService('')
    setRating(5)
    setMessage('')
    setSortOrder(items.length)
    setIsPublished(true)
    setScreenshotFile(null)
    setScreenshotPreview(null)
    setError('')
    setModalOpen(true)
  }

  function openEdit(t: Testimonial) {
    setEditTarget(t)
    setName(t.name)
    setService(t.service ?? '')
    setRating(t.rating ?? 5)
    setMessage(t.message)
    setSortOrder(t.sort_order)
    setIsPublished(t.is_published)
    setScreenshotFile(null)
    setScreenshotPreview(t.screenshot_url)
    setError('')
    setModalOpen(true)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 5 * 1024 * 1024) {
      setError('Screenshot maksimal 5MB. Sensor nama/nomor sebelum upload.')
      return
    }
    setScreenshotFile(f)
    setScreenshotPreview(URL.createObjectURL(f))
    setError('')
  }

  async function uploadScreenshot(file: File): Promise<string | null> {
    const filename = `testimonials/${Date.now()}-${file.name.replace(/\s+/g, '-')}`
    const { data, error } = await supabase.storage.from('portfolio-images').upload(filename, file, {
      contentType: file.type,
      upsert: true,
    })
    if (error) return null
    const { data: urlData } = supabase.storage.from('portfolio-images').getPublicUrl(data.path)
    return urlData.publicUrl
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !message.trim()) {
      setError('Nama dan pesan wajib diisi.')
      return
    }
    setSaving(true)
    setError('')

    let screenshotUrl = editTarget?.screenshot_url ?? null
    if (screenshotFile) {
      const uploaded = await uploadScreenshot(screenshotFile)
      if (!uploaded) {
        setError('Gagal upload screenshot.')
        setSaving(false)
        return
      }
      if (editTarget?.screenshot_url?.includes('supabase')) {
        const path = editTarget.screenshot_url.split('/portfolio-images/')[1]
        if (path) await supabase.storage.from('portfolio-images').remove([path])
      }
      screenshotUrl = uploaded
    }

    const payload = {
      name: name.trim(),
      service: service.trim() || null,
      rating: rating === '' ? null : Number(rating),
      message: message.trim(),
      screenshot_url: screenshotUrl,
      sort_order: sortOrder,
      is_published: isPublished,
      updated_at: new Date().toISOString(),
    }

    if (editTarget) {
      const { data, error: err } = await supabase.from('testimonials').update(payload).eq('id', editTarget.id).select().single()
      if (err) {
        setError(err.message)
        setSaving(false)
        return
      }
      setItems(prev => prev.map(x => (x.id === editTarget.id ? (data as Testimonial) : x)))
      addToast('Testimoni diperbarui.')
    } else {
      const { data, error: err } = await supabase.from('testimonials').insert(payload).select().single()
      if (err) {
        setError(err.message)
        setSaving(false)
        return
      }
      setItems(prev => [...prev, data as Testimonial])
      addToast('Testimoni ditambahkan.')
    }
    setSaving(false)
    setModalOpen(false)
    setEditTarget(null)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    if (deleteTarget.screenshot_url?.includes('supabase')) {
      const path = deleteTarget.screenshot_url.split('/portfolio-images/')[1]
      if (path) await supabase.storage.from('portfolio-images').remove([path])
    }
    const { error } = await supabase.from('testimonials').delete().eq('id', deleteTarget.id)
    if (error) addToast('Gagal hapus.', 'error')
    else {
      setItems(prev => prev.filter(x => x.id !== deleteTarget.id))
      addToast('Testimoni dihapus.')
      setDeleteTarget(null)
    }
    setDeleting(false)
  }

  async function togglePublish(t: Testimonial) {
    const { data, error } = await supabase.from('testimonials').update({ is_published: !t.is_published }).eq('id', t.id).select().single()
    if (error) addToast(error.message, 'error')
    else {
      setItems(prev => prev.map(x => (x.id === t.id ? (data as Testimonial) : x)))
      addToast(!t.is_published ? 'Ditampilkan di /assistance.' : 'Disembunyikan.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Inter, sans-serif' }}>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Assistance — Testimonials</h1>
            <p className="text-xs text-gray-500">Kelola testimoni & screenshot chat untuk /assistance</p>
          </div>
          <div className="flex gap-2">
            <a href="/assistance" target="_blank" className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 hover:bg-gray-50">Lihat /assistance ↗</a>
            <a href="/dashboard/portfolio" className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 hover:bg-gray-50">← Portfolio</a>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold">Testimonials</h2>
              <p className="text-sm text-gray-500">{items.length} testimoni • yang is_published=true tampil di landing</p>
            </div>
            <button onClick={openAdd} className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800">+ Tambah Testimoni</button>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-xl">Belum ada testimoni. Tambah sekarang.</div>
          ) : (
            <div className="space-y-3">
              {items
                .slice()
                .sort((a, b) => a.sort_order - b.sort_order || new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map(t => (
                  <div key={t.id} className="flex gap-4 p-4 border border-gray-100 rounded-xl hover:border-gray-200">
                    {t.screenshot_url ? (
                      <img src={t.screenshot_url} alt={t.name} className="w-20 h-20 object-cover object-top rounded-lg border border-gray-200 flex-shrink-0" />
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center text-xs text-gray-400 flex-shrink-0">No img</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{t.name}</span>
                        {t.service && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{t.service}</span>}
                        {t.rating != null && <span className="text-xs bg-black text-white px-2 py-0.5 rounded-full">{t.rating}/5</span>}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${t.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{t.is_published ? 'Published' : 'Hidden'}</span>
                        <span className="text-xs text-gray-400">#{t.sort_order}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">&ldquo;{t.message}&rdquo;</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button onClick={() => togglePublish(t)} className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50">{t.is_published ? 'Hide' : 'Publish'}</button>
                      <button onClick={() => openEdit(t)} className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50">Edit</button>
                      <button onClick={() => setDeleteTarget(t)} className="px-3 py-1.5 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50">Hapus</button>
                    </div>
                  </div>
                ))}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-6 leading-relaxed">Tips privasi: sensor nama lengkap, foto profil, dan nomor WA di screenshot sebelum upload. Maksimal 5MB per gambar. Bucket: <code className="bg-gray-100 px-1 rounded">portfolio-images/testimonials/</code> (public).</p>
        </div>
      </main>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">{editTarget ? 'Edit Testimoni' : 'Tambah Testimoni'}</h2>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Screenshot Chat (opsional)</label>
                <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-gray-200 rounded-xl p-3 text-center cursor-pointer hover:border-gray-400">
                  {screenshotPreview ? <img src={screenshotPreview} alt="Preview" className="w-full h-48 object-cover object-top rounded-lg" /> : <div className="py-8 text-sm text-gray-400">Klik untuk upload screenshot (sensor dulu)</div>}
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Nama <span className="text-red-500">*</span></label>
                <input value={name} onChange={e => setName(e.target.value)} required placeholder="Rina — Mahasiswa TI" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Layanan</label>
                <input value={service} onChange={e => setService(e.target.value)} placeholder="Document & Word / SPSS / Laravel" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1">Rating (1-5)</label>
                  <input type="number" min={1} max={5} value={rating} onChange={e => setRating(e.target.value === '' ? '' : Number(e.target.value))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Urutan</label>
                  <input type="number" value={sortOrder} onChange={e => setSortOrder(Number(e.target.value))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Pesan <span className="text-red-500">*</span></label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={3} placeholder="Respon cepat, dokumen jadi rapi..." className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-gray-400 focus:outline-none resize-none" />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} /> Tampilkan di /assistance (is_published)
              </label>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl font-medium hover:bg-gray-50">Batal</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-black text-white rounded-xl font-medium hover:bg-gray-800 disabled:opacity-60">{saving ? 'Menyimpan...' : editTarget ? 'Simpan' : 'Tambah'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-center">
            <h3 className="font-bold">Hapus testimoni &quot;{deleteTarget.name}&quot;?</h3>
            <p className="text-sm text-gray-500 mt-2">Screenshot juga akan dihapus dari storage.</p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2 border border-gray-200 rounded-xl">Batal</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2 bg-red-500 text-white rounded-xl disabled:opacity-60">{deleting ? 'Menghapus...' : 'Hapus'}</button>
            </div>
          </div>
        </div>
      )}

      <Toast toasts={toasts} onRemove={id => setToasts(prev => prev.filter(t => t.id !== id))} />
    </div>
  )
}
