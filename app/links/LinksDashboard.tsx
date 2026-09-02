'use client'

import { useState, useCallback, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import LinkCard, { type LinkItem } from '@/components/linkjar/LinkCard'
import LinkModal from '@/components/linkjar/LinkModal'
import DeleteModal from '@/components/linkjar/DeleteModal'
import SearchBar from '@/components/linkjar/SearchBar'
import Toast, { type ToastMessage } from '@/components/linkjar/Toast'
import TabSwitcher from '@/components/linkjar/TabSwitcher'
import NoteCard, { type NoteItem } from '@/components/linkjar/NoteCard'
import NoteModal from '@/components/linkjar/NoteModal'
import NotesGrid from '@/components/linkjar/NotesGrid'
import { PlusIcon, ArchiveIcon } from 'lucide-react'

interface Props {
  initialLinks: LinkItem[]
  initialNotes: NoteItem[]
  username: string
  userId: string
}

type ActiveTab = 'links' | 'notes'

export default function LinksDashboard({ initialLinks, initialNotes, username, userId }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [tab, setTab] = useState<ActiveTab>('links')
  const [links, setLinks] = useState<LinkItem[]>(initialLinks)
  const [notes, setNotes] = useState<NoteItem[]>(initialNotes)
  const [search, setSearch] = useState('')

  // Links modal state
  const [linkModalOpen, setLinkModalOpen] = useState(false)
  const [editLink, setEditLink] = useState<LinkItem | null>(null)
  const [deleteLink, setDeleteLink] = useState<LinkItem | null>(null)
  const [savingLink, setSavingLink] = useState(false)
  const [deletingLink, setDeletingLink] = useState(false)

  // Notes modal state
  const [noteModalOpen, setNoteModalOpen] = useState(false)
  const [editNote, setEditNote] = useState<NoteItem | null>(null)
  const [deleteNote, setDeleteNote] = useState<NoteItem | null>(null)
  const [savingNote, setSavingNote] = useState(false)
  const [deletingNote, setDeletingNote] = useState(false)
  const [showArchived, setShowArchived] = useState(false)

  // Quick-add expand state
  const [quickAdd, setQuickAdd] = useState(false)
  const quickAddRef = useRef<HTMLDivElement>(null)

  const [toasts, setToasts] = useState<ToastMessage[]>([])

  function addToast(message: string, type: ToastMessage['type'] = 'success') {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, type }])
  }
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  // Filtered data
  const filteredLinks = useMemo(() => {
    if (!search.trim()) return links
    const q = search.toLowerCase()
    return links.filter(l =>
      l.link.toLowerCase().includes(q) || (l.caption ?? '').toLowerCase().includes(q)
    )
  }, [links, search])

  const filteredNotes = useMemo(() => {
    if (!search.trim()) return notes
    const q = search.toLowerCase()
    return notes.filter(n =>
      (n.title ?? '').toLowerCase().includes(q) || (n.content ?? '').toLowerCase().includes(q)
    )
  }, [notes, search])

  // ── Links actions ──────────────────────────────────────
  async function handleSaveLink({ link, caption }: { link: string; caption: string }) {
    setSavingLink(true)
    if (editLink) {
      const { data, error } = await supabase
        .from('links').update({ link, caption: caption || null })
        .eq('id', editLink.id).select().single()
      if (error) addToast('Gagal menyimpan.', 'error')
      else {
        setLinks(prev => prev.map(l => l.id === editLink.id ? data : l))
        addToast('Link diperbarui.')
        setLinkModalOpen(false); setEditLink(null)
      }
    } else {
      const { data, error } = await supabase
        .from('links').insert({ link, caption: caption || null, user_id: userId })
        .select().single()
      if (error) addToast('Gagal menambah link.', 'error')
      else {
        setLinks(prev => [data, ...prev])
        addToast('Link ditambahkan.')
        setLinkModalOpen(false)
      }
    }
    setSavingLink(false)
  }

  async function handleDeleteLink() {
    if (!deleteLink) return
    setDeletingLink(true)
    const { error } = await supabase.from('links').delete().eq('id', deleteLink.id)
    if (error) addToast('Gagal menghapus.', 'error')
    else {
      setLinks(prev => prev.filter(l => l.id !== deleteLink.id))
      addToast('Link dihapus.', 'warning')
      setDeleteLink(null)
    }
    setDeletingLink(false)
  }

  // ── Notes actions ──────────────────────────────────────
  async function handleSaveNote({ title, content, color, pinned }: {
    title: string; content: string; color: 'default' | 'muted' | 'dark'; pinned: boolean
  }) {
    setSavingNote(true)
    if (editNote) {
      const { data, error } = await supabase
        .from('notes')
        .update({ title: title || null, content: content || null, color, pinned, updated_at: new Date().toISOString() })
        .eq('id', editNote.id).select().single()
      if (error) addToast('Gagal menyimpan catatan.', 'error')
      else {
        setNotes(prev => prev.map(n => n.id === editNote.id ? data : n))
        addToast('Catatan disimpan.')
        setNoteModalOpen(false); setEditNote(null)
      }
    } else {
      const { data, error } = await supabase
        .from('notes')
        .insert({ title: title || null, content: content || null, color, pinned, user_id: userId })
        .select().single()
      if (error) addToast('Gagal menambah catatan.', 'error')
      else {
        setNotes(prev => [data, ...prev])
        addToast('Catatan ditambahkan.')
        setNoteModalOpen(false); setQuickAdd(false)
      }
    }
    setSavingNote(false)
  }

  async function handlePinNote(note: NoteItem) {
    const { data, error } = await supabase
      .from('notes').update({ pinned: !note.pinned }).eq('id', note.id).select().single()
    if (!error && data) setNotes(prev => prev.map(n => n.id === note.id ? data : n))
  }

  async function handleArchiveNote(note: NoteItem) {
    const { data, error } = await supabase
      .from('notes').update({ archived: !note.archived }).eq('id', note.id).select().single()
    if (!error && data) {
      setNotes(prev => prev.map(n => n.id === note.id ? data : n))
      addToast(note.archived ? 'Catatan dipulihkan.' : 'Catatan diarsipkan.')
    }
  }

  async function handleDeleteNote() {
    if (!deleteNote) return
    setDeletingNote(true)
    const { error } = await supabase.from('notes').delete().eq('id', deleteNote.id)
    if (error) addToast('Gagal menghapus catatan.', 'error')
    else {
      setNotes(prev => prev.filter(n => n.id !== deleteNote.id))
      addToast('Catatan dihapus.', 'warning')
      setDeleteNote(null)
    }
    setDeletingNote(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <header className="border-b border-gray-100 sticky top-0 z-40 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-gray-900">LinkJar</h1>
            <p className="text-xs text-gray-400">@{username}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-black transition-colors px-3 py-1.5 rounded-lg border border-transparent hover:border-gray-200"
          >
            Keluar
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 pb-24">
        {/* Tabs + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <TabSwitcher
            active={tab}
            onChange={(t) => { setTab(t); setSearch('') }}
            linksCount={links.length}
            notesCount={notes.filter(n => !n.archived).length}
          />
          <div className="flex-1">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder={tab === 'links' ? 'Cari link...' : 'Cari catatan...'}
            />
          </div>
        </div>

        {/* ── LINKS TAB ── */}
        {tab === 'links' && (
          <>
            {filteredLinks.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-sm">{search ? 'Tidak ada link yang cocok.' : 'Belum ada link tersimpan.'}</p>
                {!search && <p className="text-gray-400 text-xs mt-1">Tekan tombol + di bawah untuk menambah.</p>}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredLinks.map(link => (
                  <LinkCard
                    key={link.id}
                    link={link}
                    onEdit={(l) => { setEditLink(l); setLinkModalOpen(true) }}
                    onDelete={(l) => setDeleteLink(l)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── NOTES TAB ── */}
        {tab === 'notes' && (
          <>
            {/* Quick-add area */}
            {!quickAdd ? (
              <div
                onClick={() => setQuickAdd(true)}
                className="border border-gray-200 rounded-lg px-4 py-3 mb-6 cursor-text text-sm text-gray-400 hover:border-gray-400 transition-colors"
              >
                Tulis catatan...
              </div>
            ) : (
              <div className="border border-black rounded-xl p-4 mb-6">
                <NoteModal
                  open={true}
                  editTarget={null}
                  onClose={() => setQuickAdd(false)}
                  onSave={handleSaveNote}
                  loading={savingNote}
                />
              </div>
            )}

            {/* Archive toggle */}
            <div className="flex items-center justify-between mb-4">
              <span />
              <button
                onClick={() => setShowArchived(s => !s)}
                className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${showArchived ? 'text-black' : 'text-gray-400 hover:text-black'}`}
              >
                <ArchiveIcon size={13} />
                {showArchived ? 'Sembunyikan arsip' : 'Tampilkan arsip'}
              </button>
            </div>

            <NotesGrid
              notes={filteredNotes}
              showArchived={showArchived}
              onEdit={(n) => { setEditNote(n); setNoteModalOpen(true) }}
              onPin={handlePinNote}
              onArchive={handleArchiveNote}
              onDelete={(n) => setDeleteNote(n)}
            />
          </>
        )}
      </main>

      {/* Floating add button — only on links tab */}
      {tab === 'links' && (
        <button
          onClick={() => { setEditLink(null); setLinkModalOpen(true) }}
          className="fixed bottom-6 right-6 w-12 h-12 bg-black text-white rounded-full shadow-md flex items-center justify-center z-40 hover:bg-gray-800 transition-colors"
          aria-label="Tambah link"
        >
          <PlusIcon size={20} />
        </button>
      )}
      {tab === 'notes' && !quickAdd && (
        <button
          onClick={() => { setEditNote(null); setNoteModalOpen(true) }}
          className="fixed bottom-6 right-6 w-12 h-12 bg-black text-white rounded-full shadow-md flex items-center justify-center z-40 hover:bg-gray-800 transition-colors"
          aria-label="Tambah catatan"
        >
          <PlusIcon size={20} />
        </button>
      )}

      {/* Modals */}
      <LinkModal
        open={linkModalOpen}
        editTarget={editLink}
        onClose={() => { setLinkModalOpen(false); setEditLink(null) }}
        onSave={handleSaveLink}
        loading={savingLink}
      />
      <DeleteModal
        open={!!deleteLink}
        onClose={() => setDeleteLink(null)}
        onConfirm={handleDeleteLink}
        loading={deletingLink}
        itemType="link"
      />
      <NoteModal
        open={noteModalOpen}
        editTarget={editNote}
        onClose={() => { setNoteModalOpen(false); setEditNote(null) }}
        onSave={handleSaveNote}
        loading={savingNote}
      />
      <DeleteModal
        open={!!deleteNote}
        onClose={() => setDeleteNote(null)}
        onConfirm={handleDeleteNote}
        loading={deletingNote}
        itemType="note"
      />

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
