'use client'

export interface Project {
  id: string
  title: string
  description: string | null
  image_url: string | null
  tags: string[]
  link: string | null
  sort_order: number
}

interface Props {
  project: Project
  delay?: string
}

export default function ProjectCard({ project, delay = '0.1s' }: Props) {
  const hasLink = project.link && project.link.trim() !== '' && project.link !== '#'

  return (
    <div className="project-card bg-white rounded-xl p-6 shadow-lg hover:shadow-xl scale-in"
         style={{ animationDelay: delay, fontFamily: 'Inter, sans-serif' }}>
      {project.image_url && (
        <div className="mb-4 rounded-lg overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.image_url}
            alt={project.title}
            className="project-image"
            loading="lazy"
          />
        </div>
      )}
      <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
      <p className="text-gray-600 mb-4 line-clamp-3">{project.description}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {project.tags.map(tag => (
          <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
            {tag}
          </span>
        ))}
      </div>
      {hasLink ? (
        <button
          onClick={() => window.open(project.link!, '_blank')}
          className="w-full border border-black text-black py-2 rounded-lg hover:bg-black hover:text-white transition-colors">
          Lihat Detail
        </button>
      ) : (
        <button
          disabled
          className="w-full border border-gray-300 text-gray-400 py-2 rounded-lg cursor-not-allowed">
          Lihat Detail
        </button>
      )}
    </div>
  )
}
