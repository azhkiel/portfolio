import { createClient } from '@/lib/supabase/server'
import Nav from '@/components/portfolio/Nav'
import Footer from '@/components/portfolio/Footer'
import ProjectCard from '@/components/portfolio/ProjectCard'

export const revalidate = 0

export const metadata = {
  title: 'Semua Proyek — Moch Azriel Maulana Racmadhani',
  description: 'Daftar lengkap proyek Moch Azriel Maulana Racmadhani',
}

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('sort_order', { ascending: true })

  const list = projects ?? []

  return (
    <div className="min-h-screen bg-white text-black" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Nav />
      <main className="max-w-6xl mx-auto px-4 pt-24 pb-20">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Semua Proyek</h1>
          <div className="w-20 h-1 bg-black mx-auto mb-4" />
          <p className="text-gray-600 max-w-2xl mx-auto">
            Kumpulan lengkap proyek yang telah saya kerjakan. Di beranda hanya 3 terbaru ditampilkan.
          </p>
          {list.length > 0 && (
            <p className="text-sm text-gray-400 mt-2">{list.length} proyek</p>
          )}
        </div>

        {list.length === 0 ? (
          <p className="text-center text-gray-400 py-12">Belum ada proyek yang ditambahkan.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {list.map((project, i) => (
              <ProjectCard
                key={project.id}
                project={project}
                delay={`${0.05 + (i % 6) * 0.07}s`}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
