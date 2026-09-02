'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Project } from '@/components/portfolio/ProjectCard'
import ProjectFormModal from './ProjectFormModal'
import ContactFormModal from './ContactFormModal'
import Toast, { type ToastMessage } from '@/components/linkjar/Toast'

interface ContactInfo {
  id?: string
  github: string
  email: string
  linkedin: string
  instagram: string
}

interface UserProfile {
  id: string
  username: string
  role: string
  created_at: string
}

interface Props {
  initialProjects: Project[]
  initialContact: ContactInfo | null
  initialUsers: UserProfile[]
}

type Tab = 'projects' | 'contact' | 'users'

export default function PortfolioDashboard({ initialProjects, initialContact, initialUsers }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [activeTab, setActiveTab] = useState<Tab>('projects')
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [contact, setContact] = useState<ContactInfo | null>(initialContact)
  const [users, setUsers] = useState<UserProfile[]>(initialUsers)

  const [projectModal, setProjectModal] = useState(false)
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [contactModal, setContactModal] = useState(false)
  const [deleteProjectTarget, setDeleteProjectTarget] = useState<Project | null>(null)
  const [deleteUserTarget, setDeleteUserTarget] = useState<UserProfile | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  function addToast(message: string, type: ToastMessage['type'] = 'success') {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { id, message, type }])
  }
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  async function handleDeleteProject() {
    if (!deleteProjectTarget) return
    setDeleting(true)
    if (deleteProjectTarget.image_url && deleteProjectTarget.image_url.includes('supabase')) {
      const path = deleteProjectTarget.image_url.split('/portfolio-images/')[1]
      if (path) await supabase.storage.from('portfolio-images').remove([path])
    }
    const { error } = await supabase.from('projects').delete().eq('id', deleteProjectTarget.id)
    if (error) addToast('Gagal menghapus proyek.', 'error')
    else {
      setProjects(prev => prev.filter(p => p.id !== deleteProjectTarget.id))
      addToast('Proyek dihapus.')
      setDeleteProjectTarget(null)
    }
    setDeleting(false)
  }

  async function handleDeleteUser() {
    if (!deleteUserTarget) return
    setDeleting(true)

    // Hapus via API route (butuh service role)
    const res = await fetch('/api/admin/delete-user', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: deleteUserTarget.id }),
    })

    if (!res.ok) {
      addToast('Gagal menghapus pengguna.', 'error')
    } else {
      setUsers(prev => prev.filter(u => u.id !== deleteUserTarget.id))
      addToast(`Pengguna @${deleteUserTarget.username} dihapus.`, 'warning')
      setDeleteUserTarget(null)
    }
    setDeleting(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'projects', label: 'Proyek', count: projects.length },
    { key: 'contact', label: 'Kontak' },
    { key: 'users', label: 'Pengguna', count: users.filter(u => u.role === 'user').length },
  ]

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Dashboard Admin</h1>
            <p className="text-xs text-gray-500">Portfolio Manager</p>
          </div>
          <div className="flex gap-2">
            <a href="/" target="_blank"
               className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors">
              Lihat Portfolio ↗
            </a>
            <button onClick={handleLogout}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors">
              Keluar
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-1 pb-0">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors
                  ${activeTab === tab.key
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs
                    ${activeTab === tab.key ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* ── TAB: PROYEK ── */}
        {activeTab === 'projects' && (
          <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold">Proyek Portfolio</h2>
                <p className="text-sm text-gray-500">{projects.length} proyek</p>
              </div>
              <button onClick={() => { setEditProject(null); setProjectModal(true) }}
                      className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors font-medium">
                + Tambah Proyek
              </button>
            </div>

            {projects.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-2">📂</div>
                <p>Belum ada proyek. Tambah sekarang!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {projects.map(project => (
                  <div key={project.id}
                       className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                    {project.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={project.image_url} alt={project.title}
                           className="w-16 h-12 object-cover rounded-lg flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{project.title}</p>
                      <p className="text-sm text-gray-500 truncate">{project.description}</p>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {project.tags.map(t => (
                          <span key={t} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{t}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => { setEditProject(project); setProjectModal(true) }}
                              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        Edit
                      </button>
                      <button onClick={() => setDeleteProjectTarget(project)}
                              className="px-3 py-1.5 text-sm border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── TAB: KONTAK ── */}
        {activeTab === 'contact' && (
          <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Informasi Kontak</h2>
              <button onClick={() => setContactModal(true)}
                      className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors font-medium">
                Edit Kontak
              </button>
            </div>
            {contact ? (
              <div className="space-y-3">
                {[
                  { label: 'GitHub', value: contact.github, href: contact.github },
                  { label: 'Email', value: contact.email, href: `mailto:${contact.email}` },
                  { label: 'LinkedIn', value: contact.linkedin, href: contact.linkedin },
                  { label: 'Instagram', value: contact.instagram, href: contact.instagram },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-semibold text-gray-500 w-20 flex-shrink-0">{item.label}</span>
                    <a href={item.href} target="_blank" rel="noopener noreferrer"
                       className="text-sm text-black hover:underline truncate">
                      {item.value}
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-2">📋</div>
                <p>Belum ada data kontak. Klik Edit untuk mengisi.</p>
              </div>
            )}
          </section>
        )}

        {/* ── TAB: PENGGUNA ── */}
        {activeTab === 'users' && (
          <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold">Pengguna LinkJar</h2>
                <p className="text-sm text-gray-500">
                  {users.filter(u => u.role === 'user').length} user terdaftar
                </p>
              </div>
            </div>

            {users.filter(u => u.role === 'user').length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-2">👥</div>
                <p>Belum ada pengguna yang mendaftar.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-4 font-semibold text-gray-500">Username</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-500">Role</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-500">Terdaftar</th>
                      <th className="py-3 px-4" />
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter(u => u.role === 'user').map(user => (
                      <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-medium">@{user.username}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 bg-sky-100 text-sky-700 rounded-full text-xs font-medium">
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500">
                          {new Date(user.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setDeleteUserTarget(user)}
                            className="px-3 py-1.5 text-xs border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                            Hapus Akun
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </main>

      {/* ── Delete Project Confirm ── */}
      {deleteProjectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-center">
            <div className="text-4xl mb-3">🗑️</div>
            <h3 className="text-lg font-bold mb-2">Hapus &quot;{deleteProjectTarget.title}&quot;?</h3>
            <p className="text-gray-500 text-sm mb-5">Proyek dan gambarnya akan dihapus permanen.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteProjectTarget(null)}
                      className="flex-1 py-2 border border-gray-200 rounded-xl font-medium hover:bg-gray-50">
                Batal
              </button>
              <button onClick={handleDeleteProject} disabled={deleting}
                      className="flex-1 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 disabled:opacity-60">
                {deleting ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete User Confirm ── */}
      {deleteUserTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl text-center">
            <div className="text-4xl mb-3">👤</div>
            <h3 className="text-lg font-bold mb-2">Hapus @{deleteUserTarget.username}?</h3>
            <p className="text-gray-500 text-sm mb-5">
              Akun dan semua link milik pengguna ini akan dihapus permanen.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteUserTarget(null)}
                      className="flex-1 py-2 border border-gray-200 rounded-xl font-medium hover:bg-gray-50">
                Batal
              </button>
              <button onClick={handleDeleteUser} disabled={deleting}
                      className="flex-1 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 disabled:opacity-60">
                {deleting ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ProjectFormModal
        open={projectModal}
        editTarget={editProject}
        onClose={() => { setProjectModal(false); setEditProject(null) }}
        onSaved={(project, isEdit) => {
          if (isEdit) {
            setProjects(prev => prev.map(p => p.id === project.id ? project : p))
            addToast('Proyek berhasil diperbarui!')
          } else {
            setProjects(prev => [...prev, project])
            addToast('Proyek berhasil ditambah!')
          }
          setProjectModal(false)
          setEditProject(null)
        }}
      />

      <ContactFormModal
        open={contactModal}
        initialData={contact}
        onClose={() => setContactModal(false)}
        onSaved={(data) => {
          setContact(data)
          addToast('Kontak berhasil disimpan!')
          setContactModal(false)
        }}
      />

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
