'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Layers, Sparkles, Calendar, ArrowRight } from 'lucide-react'

interface FeedImage {
  id: string
  image_url: string
  order_index: number
}

interface FeedItem {
  id: string
  caption: string
  created_at: string
  feed_images: FeedImage[]
}

export default function FeedCard({ feed }: { feed: FeedItem }) {
  const sortedImages = feed.feed_images?.sort((a, b) => a.order_index - b.order_index) || []
  const [cards, setCards] = useState(sortedImages)
  const [activePhotoIndex, setActivePhotoIndex] = useState(0)

  const handleNextCard = () => {
    if (cards.length <= 1) return
    setCards(prev => {
      const copy = [...prev]
      const first = copy.shift()
      if (first) copy.push(first)
      return copy
    })
    setActivePhotoIndex(prev => (prev + 1) % sortedImages.length)
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="bg-white rounded-3xl border border-gray-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.04)] p-6 transition-all duration-300 hover:border-gray-300"
    >
      {/* Header Info */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm flex items-center justify-center font-bold text-gray-800 text-sm">
            <Image src="/vector.png" alt="Azriel" width={40} height={40} className="object-cover w-full h-full" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-gray-900 tracking-tight">Moch Azriel</h3>
            <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-0.5">
              <Calendar className="w-3 h-3 text-gray-400" />
              <span>
                {new Date(feed.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>

        {cards.length > 1 && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
            <Layers className="w-3.5 h-3.5 text-gray-500" />
            {cards.length} Foto (Klik/Tap)
          </span>
        )}
      </div>

      {/* Stacked Cards Area */}
      {cards.length > 0 && (
        <div 
          onClick={handleNextCard}
          className={`relative w-full aspect-square my-2 flex items-center justify-center cursor-pointer select-none group ${
            cards.length > 1 ? 'pb-4' : ''
          }`}
        >
          <div className="relative w-full h-full">
            {cards.slice(0, 3).map((img, index) => {
              // Calculate stack offset and rotation for depth effect
              const isTop = index === 0
              const rotation = isTop ? 0 : index === 1 ? -4 : 4
              const scale = 1 - index * 0.05
              const translateY = index * 8
              const zIndex = cards.length - index

              return (
                <motion.div
                  key={img.id}
                  layout
                  initial={false}
                  animate={{
                    rotate: rotation,
                    scale: scale,
                    y: translateY,
                    zIndex: zIndex,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 20,
                  }}
                  className="absolute inset-0 rounded-2xl overflow-hidden border border-gray-200 shadow-md bg-gray-50 origin-bottom"
                >
                  <Image
                    src={img.image_url}
                    alt="Stack photo"
                    fill
                    className="object-cover pointer-events-none"
                    priority={isTop}
                  />

                  {/* Hint overlay on top card if multiple */}
                  {isTop && cards.length > 1 && (
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-white/90 text-black text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 backdrop-blur-md">
                        Geser / Klik Tumpukan <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Caption & Details */}
      {feed.caption && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {feed.caption}
          </p>
        </div>
      )}
    </motion.article>
  )
}
