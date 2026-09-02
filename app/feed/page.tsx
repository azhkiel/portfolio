import { createClient } from '@/lib/supabase/server'
import Nav from '@/components/portfolio/Nav'
import Footer from '@/components/portfolio/Footer'
import FeedCard from './FeedCard'
import { Camera, Sparkles } from 'lucide-react'

export const revalidate = 0

export default async function FeedPage() {
  const supabase = await createClient()
  
  const { data: feeds } = await supabase
    .from('feeds')
    .select('*, feed_images(*)')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#fafafa] text-black font-sans">
      <Nav />
      
      <main className="max-w-xl mx-auto pt-24 pb-20 px-4 sm:px-0">
        {/* Header Title */}
        <div className="flex items-center justify-between mb-8 px-1">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 bg-black text-white rounded-lg">
                <Camera className="w-4 h-4" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">Visual Journal</h1>
            </div>
            <p className="text-xs text-gray-500">Kumpulan momen, desain, dan progres proyek terbaru.</p>
          </div>
        </div>

        {/* Feed List */}
        <div className="space-y-8">
          {!feeds || feeds.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center text-gray-500 shadow-sm">
              <Sparkles className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              Belum ada postingan di jurnal visual ini.
            </div>
          ) : (
            feeds.map((feed) => (
              <FeedCard key={feed.id} feed={feed} />
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
