'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import SnakeGame from '@/components/SnakeGame'
import PortfolioPage from '@/components/portfolio/PortfolioPage'
import type { Project } from '@/components/portfolio/ProjectCard'
import type { ContactInfo } from '@/components/portfolio/Contact'
import type { FeedPreviewItem } from '@/components/portfolio/FeedPreview'

interface Props {
  projects: Project[]
  contact: ContactInfo | null
  feeds: FeedPreviewItem[]
}

export default function HomeClient({ projects, contact, feeds }: Props) {
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
        <PortfolioPage projects={projects} contact={contact} feeds={feeds} />
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
                {/* Custom Logo */}
                <Image src="/vector.png" alt="Logo" width={26} height={26} className="rounded-full" />
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
