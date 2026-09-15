import Image from 'next/image'
import Link from 'next/link'
import { Camera, Layers, ArrowRight } from 'lucide-react'

export interface FeedPreviewImage {
  id: string
  image_url: string
  order_index: number
}

export interface FeedPreviewItem {
  id: string
  caption: string | null
  created_at: string
  feed_images: FeedPreviewImage[]
}

interface Props {
  feeds: FeedPreviewItem[]
}

function coverOf(feed: FeedPreviewItem): FeedPreviewImage | null {
  if (!feed.feed_images || feed.feed_images.length === 0) return null
  return [...feed.feed_images].sort((a, b) => a.order_index - b.order_index)[0]
}

export default function FeedPreview({ feeds }: Props) {
  return (
    <section id="feed" className="py-20 bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Jurnal Terbaru</h2>
          <div className="w-20 h-1 bg-black mx-auto mb-4" />
          <p className="text-gray-600 max-w-2xl mx-auto">
            Momen, desain, dan progres proyek terbaru yang saya bagikan.
          </p>
        </div>

        {feeds.length === 0 ? (
          <p className="text-center text-gray-400">Belum ada postingan di jurnal.</p>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {feeds.map(feed => {
                const cover = coverOf(feed)
                const photoCount = feed.feed_images?.length ?? 0
                return (
                  <Link
                    key={feed.id}
                    href="/feed"
                    className="group bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="relative aspect-square bg-gray-100 overflow-hidden">
                      {cover ? (
                        <Image
                          src={cover.image_url}
                          alt={feed.caption ?? 'Feed'}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                          <Camera className="w-10 h-10" />
                        </div>
                      )}
                      {photoCount > 1 && (
                        <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium bg-black/60 text-white backdrop-blur-sm">
                          <Layers className="w-3 h-3" />
                          {photoCount}
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      {feed.caption && (
                        <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">
                          {feed.caption}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(feed.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>

            <div className="text-center mt-10">
              <Link
                href="/feed"
                className="inline-flex items-center gap-2 border-2 border-black text-black px-8 py-3 rounded-lg hover:bg-black hover:text-white transition-colors font-medium"
              >
                Lihat Semua Feed
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
