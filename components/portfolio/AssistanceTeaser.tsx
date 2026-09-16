import Link from 'next/link'
import { Search, FileText, BarChart3, Code2, Cpu, BookOpen, ArrowRight } from 'lucide-react'

const items = [
  { icon: Search, title: 'Academic', desc: 'Jurnal • Sitasi • Daftar pustaka • APA/IEEE' },
  { icon: FileText, title: 'Document & Word', desc: 'Formatting • TOC otomatis • Skripsi/laporan' },
  { icon: BarChart3, title: 'Data & Statistics', desc: 'Excel • SPSS • Regresi • Visualisasi' },
  { icon: Code2, title: 'Programming', desc: 'Laravel • React • Debugging • Deploy' },
  { icon: Cpu, title: 'IoT & Embedded', desc: 'Arduino • ESP32 • MQTT • Dashboard' },
  { icon: BookOpen, title: 'Research', desc: 'Mendeley • Zotero • DOI • Scholar' },
]

export default function AssistanceTeaser() {
  return (
    <section id="assistance" className="py-20 bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-flex text-[11px] tracking-widest font-semibold border border-gray-200 rounded-full px-3 py-1 bg-gray-50">ACADEMIC • DOCUMENT • DATA • TECHNICAL</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-4">Academic & Technical Assistance</h2>
          <div className="w-20 h-1 bg-black mx-auto mt-4 mb-4" />
          <p className="text-gray-600 max-w-2xl mx-auto">
            Bantuan akademik, dokumen, data, dan project teknologi — cepat, rapi, terstruktur. Konsultasi dulu, harga menyesuaikan kompleksitas & deadline.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="border border-gray-200 rounded-2xl p-5 bg-white hover:shadow-md transition-shadow">
              <Icon className="w-5 h-5" />
              <h3 className="font-semibold mt-3 text-sm">{title}</h3>
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
          <Link href="/assistance" className="inline-flex items-center justify-center gap-2 bg-black text-white px-7 py-3 rounded-full font-medium hover:bg-gray-900 transition-colors">
            Lihat Layanan & Harga <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/assistance#order" className="inline-flex items-center justify-center border border-gray-300 px-7 py-3 rounded-full font-medium hover:bg-gray-50 transition-colors">
            Konsultasi via WhatsApp
          </Link>
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">Mulai Rp10.000 • Regular 1–3 hari • Express &lt;24 jam</p>
      </div>
    </section>
  )
}
