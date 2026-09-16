import Link from 'next/link'
import Nav from '@/components/portfolio/Nav'
import Hero from '@/components/portfolio/Hero'
import About from '@/components/portfolio/About'
import SkillsMarquee from '@/components/portfolio/SkillsMarquee'
import Contact, { type ContactInfo } from '@/components/portfolio/Contact'
import Footer from '@/components/portfolio/Footer'
import ProjectCard, { type Project } from '@/components/portfolio/ProjectCard'
import FeedPreview, { type FeedPreviewItem } from '@/components/portfolio/FeedPreview'
import AssistanceTeaser from '@/components/portfolio/AssistanceTeaser'

interface Props {
  projects: Project[]
  contact: ContactInfo | null
  feeds: FeedPreviewItem[]
}

const delays = ['0.1s', '0.2s', '0.3s', '0.4s', '0.5s', '0.6s']

export default function PortfolioPage({ projects, contact, feeds }: Props) {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <About />

        {/* Projects Section */}
        <section id="projects" className="py-20 bg-gray-50" style={{ fontFamily: 'Inter, sans-serif' }}>
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Proyek Saya</h2>
              <div className="w-20 h-1 bg-black mx-auto mb-4" />
              <p className="text-gray-600 max-w-2xl mx-auto">
                Berikut adalah beberapa proyek yang telah saya kerjakan menggunakan berbagai
                teknologi dan stack yang saya kuasai.
              </p>
            </div>

            {projects.length === 0 ? (
              <p className="text-center text-gray-400">Belum ada proyek yang ditambahkan.</p>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {projects.slice(0, 3).map((project, i) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      delay={delays[i % delays.length]}
                    />
                  ))}
                </div>
                {projects.length > 3 && (
                  <div className="text-center mt-10">
                    <Link
                      href="/projects"
                      className="inline-flex items-center gap-2 border border-black bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-black hover:text-white transition-colors"
                    >
                      Lihat Semua Proyek ({projects.length}) →
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        <FeedPreview feeds={feeds} />
        <AssistanceTeaser />
        <SkillsMarquee />
        <Contact contact={contact ?? undefined} />
      </main>
      <Footer />
    </>
  )
}
