import { createClient } from '@/lib/supabase/server'
import FeedForm from './FeedForm'
import FeedList from './FeedList'

export const revalidate = 0

export default async function DashboardFeedPage() {
  const supabase = await createClient()
  
  // Ambil semua feeds untuk dikelola
  const { data: feeds } = await supabase
    .from('feeds')
    .select('*, feed_images(*)')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8 mt-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-black mb-2">Feed Dashboard</h1>
        <p className="text-gray-500 text-sm">Kelola postingan ala Instagram Anda di sini. Unggah foto baru atau hapus yang lama.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <FeedForm />
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <FeedList initialFeeds={feeds || []} />
        </div>
      </div>
    </div>
  )
}
