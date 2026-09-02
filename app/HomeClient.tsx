'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SnakeGame from '@/components/SnakeGame'
import PortfolioPage from '@/components/portfolio/PortfolioPage'
import type { Project } from '@/components/portfolio/ProjectCard'
import type { ContactInfo } from '@/components/portfolio/Contact'

interface Props {
  projects: Project[]
  contact: ContactInfo | null
}

export default function HomeClient({ projects, contact }: Props) {
  const [showPortfolio, setShowPortfolio] = useState(false)

  function handleEnterPortfolio() {
    setShowPortfolio(true)
  }

  return (
    <>
      {/* Portfolio always in DOM for SEO — hidden visually until revealed */}
      <div
        aria-hidden={!showPortfolio}
        style={{ display: showPortfolio ? 'block' : 'none' }}
      >
        <PortfolioPage projects={projects} contact={contact} />
      </div>

      <AnimatePresence>
        {!showPortfolio && (
          <motion.div
            key="gate"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="fixed inset-0 z-50 bg-white flex items-center justify-center"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <div className="border border-gray-200 rounded-xl p-6 sm:p-8 flex flex-col items-center gap-5 shadow-sm max-w-sm w-full mx-4 bg-white">
              {/* Header */}
              <div className="flex items-center gap-3">
                {/* Next.js logo */}
                <svg width="26" height="26" viewBox="0 0 180 180" fill="none" aria-hidden="true">
                  <mask id="mask0" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width="180" height="180">
                    <circle cx="90" cy="90" r="90" fill="black" />
                  </mask>
                  <g mask="url(#mask0)">
                    <circle cx="90" cy="90" r="90" fill="black" />
                    <path d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.52Z" fill="url(#paint0_linear)" />
                    <rect x="115" y="54" width="12" height="72" fill="url(#paint1_linear)" />
                  </g>
                  <defs>
                    <linearGradient id="paint0_linear" x1="109" y1="116.5" x2="144.5" y2="160.5" gradientUnits="userSpaceOnUse">
                      <stop stopColor="white" />
                      <stop offset="1" stopColor="white" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="paint1_linear" x1="121" y1="54" x2="120.799" y2="106.875" gradientUnits="userSpaceOnUse">
                      <stop stopColor="white" />
                      <stop offset="1" stopColor="white" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="text-base font-semibold tracking-tight text-black">Azriel</span>
              </div>

              {/* Copy */}
              <div className="text-center">
                <p className="text-base font-semibold text-black">Play to enter.</p>
                <p className="text-xs text-gray-400 mt-1">Mainkan snake tanpa batas atau langsung masuk portfolio.</p>
              </div>

              {/* Canvas Game Infinity */}
              <SnakeGame onEnterPortfolio={handleEnterPortfolio} />

              {/* Action bar */}
              <div className="flex items-center justify-between w-full pt-1">
                <span className="text-[11px] text-gray-400">
                  WASD / Arrow Keys
                </span>
                <button
                  onClick={handleEnterPortfolio}
                  className="text-xs font-medium text-black border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Masuk Portfolio →
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
