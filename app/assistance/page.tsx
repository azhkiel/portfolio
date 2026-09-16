'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import {
  Search, FileText, BarChart3, Code2, Cpu, BookOpen,
  FileCheck, Clock, ShieldCheck, MessageCircle, RefreshCw, Layers,
  Check, ArrowRight, ChevronDown, Star, Quote, Zap
} from 'lucide-react'

// ponytail: single file page, split to components only if /assistance grows beyond landing
const WA_NUMBER = '62895359205631'

type Testimonial = {
  id: string
  name: string
  service: string | null
  rating: number | null
  message: string
  screenshot_url: string | null
  created_at: string
}

const services = [
  {
    icon: Search,
    title: 'Academic Assistance',
    desc: 'Bantuan kebutuhan akademik dan penelitian.',
    items: ['Pencarian jurnal', 'Pencarian referensi & sitasi', 'Daftar pustaka', 'APA / IEEE / Vancouver', 'Review referensi', 'Proofreading & typo'],
    cta: 'Request Academic Assistance',
  },
  {
    icon: FileText,
    title: 'Document & Word',
    desc: 'Merapikan dokumen agar profesional dan konsisten.',
    items: ['Formatting Word', 'Daftar isi otomatis', 'Daftar gambar/tabel', 'Heading & styles', 'Margin & spacing', 'Format skripsi/laporan'],
    cta: 'Fix My Document',
  },
  {
    icon: BarChart3,
    title: 'Data & Statistics',
    desc: 'Pengolahan dan analisis data akademik & project.',
    items: ['Excel & SPSS', 'Data cleaning', 'Statistik deskriptif', 'Korelasi / ANOVA / Regresi', 'Visualisasi data', 'Interpretasi output'],
    cta: 'Process My Data',
  },
  {
    icon: Code2,
    title: 'Programming',
    desc: 'Bantuan pengembangan, debugging, dan deploy.',
    items: ['PHP / Laravel / JS / React', 'Python / Java', 'MySQL / PostgreSQL', 'REST API', 'Debugging & review', 'Deployment'],
    cta: 'Discuss My Project',
  },
  {
    icon: Cpu,
    title: 'IoT & Embedded',
    desc: 'Project mikrokontroler dan Internet of Things.',
    items: ['Arduino / ESP32 / ESP8266', 'Sensor & MQTT', 'IoT dashboard', 'Database IoT', 'Monitoring system', 'Dokumentasi'],
    cta: 'Discuss IoT Project',
  },
  {
    icon: BookOpen,
    title: 'Research & Reference',
    desc: 'Temukan referensi relevan dan kelola sitasi.',
    items: ['Search jurnal & paper', 'Referensi per topik', 'Citation assistance', 'Mendeley / Zotero', 'Google Scholar', 'DOI checking'],
    cta: 'Find References',
  },
]

const howItWorks = [
  { n: '01', title: 'Tell Me What You Need', desc: '"Saya perlu merapikan laporan 40 halaman." / "Butuh 10 jurnal ML." / "Laravel error saat deploy."', hint: 'Jelaskan tugas/project yang ingin dibantu' },
  { n: '02', title: 'Send Your Files', desc: 'Word, PDF, Excel, source code, screenshot error, dataset, requirement tugas.' },
  { n: '03', title: 'Get Your Quote', desc: 'Harga berdasarkan jenis, kesulitan, halaman/data, deadline, kompleksitas.' },
  { n: '04', title: 'Work Begins', desc: 'Setelah harga & requirement disepakati, pekerjaan dimulai.' },
  { n: '05', title: 'Review & Revision', desc: 'Cek hasil, revisi jika tidak sesuai brief awal sesuai kesepakatan.' },
]

const whyChoose = [
  { icon: Zap, title: 'Fast Response', desc: 'Respon cepat untuk konsultasi & estimasi.' },
  { icon: FileCheck, title: 'Transparent Pricing', desc: 'Harga sesuai kesulitan & kebutuhan.' },
  { icon: Layers, title: 'Multiple Skills', desc: 'Dokumen, data, jurnal, hingga programming.' },
  { icon: MessageCircle, title: 'Clear Communication', desc: 'Requirement dibahas dulu sebelum mulai.' },
  { icon: RefreshCw, title: 'Revision', desc: 'Revisi mengikuti kesepakatan awal.' },
  { icon: ShieldCheck, title: 'Confidentiality', desc: 'File & informasi dijaga kerahasiaannya.' },
]

const pricing = [
  ['Word Formatting', 'Rp10.000'],
  ['Jurnal & Reference Search', 'Rp15.000'],
  ['Citation & Bibliography', 'Rp15.000'],
  ['Data Processing', 'Rp25.000'],
  ['SPSS Assistance', 'Rp30.000'],
  ['Programming', 'Rp50.000'],
  ['Website Project', 'Rp100.000'],
  ['IoT Project', 'Rp100.000'],
]

const faqs = [
  { q: 'Apakah bisa request selain programming?', a: 'Bisa. Tersedia document formatting, pencarian jurnal, sitasi, pengolahan data, hingga technical project IoT.' },
  { q: 'Apakah bisa deadline mendadak?', a: 'Bisa selama workload memungkinkan. Pekerjaan urgent dikenakan biaya express.' },
  { q: 'Bagaimana cara menentukan harga?', a: 'Berdasarkan jenis pekerjaan, kompleksitas, volume, deadline, dan requirement.' },
  { q: 'Apakah bisa revisi?', a: 'Bisa. Revisi mengikuti requirement yang disepakati di awal.' },
  { q: 'Apakah file saya aman?', a: 'Ya. File hanya dipakai untuk pekerjaan dan tidak dibagikan ke pihak lain.' },
  { q: 'Apakah bisa konsultasi dulu?', a: 'Tentu. Jelaskan kebutuhan dulu, baru dapat estimasi harga — belum perlu bayar.' },
]

export default function AssistancePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [form, setForm] = useState({ name: '', service: 'Academic Assistance', deadline: '', desc: '' })
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [lightbox, setLightbox] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('testimonials')
      .select('*')
      .eq('is_published', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setTestimonials(data as Testimonial[])
      })
  }, [])

  function submitToWA(e: React.FormEvent) {
    e.preventDefault()
    const msg = `Halo, saya ingin melakukan konsultasi.\n\nNama: ${form.name}\nLayanan: ${form.service}\nDeadline: ${form.deadline || '-'}\nDeskripsi: ${form.desc}\n\nSaya ingin mendapatkan estimasi harga untuk pekerjaan tersebut.`
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div className="min-h-screen bg-white text-black" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-[64px]">
          <Link href="/assistance" className="font-bold tracking-tight">EL Assistance</Link>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <button onClick={() => scrollTo('home')} className="hover:text-black text-gray-600">Home</button>
            <button onClick={() => scrollTo('services')} className="hover:text-black text-gray-600">Services</button>
            <button onClick={() => scrollTo('portfolio')} className="hover:text-black text-gray-600">Portfolio</button>
            <button onClick={() => scrollTo('how')} className="hover:text-black text-gray-600">How It Works</button>
            <button onClick={() => scrollTo('testimonials')} className="hover:text-black text-gray-600">Testimonials</button>
            <button onClick={() => scrollTo('faq')} className="hover:text-black text-gray-600">FAQ</button>
            <button onClick={() => scrollTo('contact')} className="hover:text-black text-gray-600">Contact</button>
            <Link href="/" className="text-xs text-gray-400 hover:text-black border border-gray-200 rounded-full px-3 py-1">Portfolio →</Link>
          </div>
          <button onClick={() => scrollTo('order')} className="bg-black text-white text-sm px-5 py-2 rounded-full hover:bg-gray-900">Order Now</button>
        </div>
      </nav>

      {/* Hero */}
      <section id="home" className="pt-28 pb-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-2 text-[11px] tracking-widest font-semibold border border-gray-200 rounded-full px-3 py-1 bg-white">ACADEMIC • DOCUMENT • DATA • TECHNICAL</span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mt-6 leading-[1.05]">Your Tasks.<br />My Expertise.</h1>
          <p className="text-gray-600 max-w-2xl mx-auto mt-4">Academic, document, data, and technical assistance untuk membantu menyelesaikan kebutuhanmu dengan lebih cepat, rapi, dan terstruktur.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <button onClick={() => scrollTo('order')} className="bg-black text-white px-7 py-3 rounded-full font-medium hover:bg-gray-900">Order Assistance →</button>
            <button onClick={() => scrollTo('services')} className="border border-gray-300 px-7 py-3 rounded-full font-medium hover:bg-gray-50">View Services</button>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-8 text-xs">
            {['Fast Response', 'Professional Service', 'Affordable Price'].map(b => (
              <span key={b} className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5"><Check className="w-3.5 h-3.5" />{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold">Services</h2>
            <p className="text-gray-600 mt-2">Pilih kategori sesuai kebutuhanmu — konsultasi dulu, harga menyesuaikan.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(s => (
              <div key={s.title} className="border border-gray-200 rounded-2xl p-6 bg-white hover:shadow-lg transition-shadow flex flex-col">
                <s.icon className="w-6 h-6" />
                <h3 className="font-semibold mt-3">{s.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{s.desc}</p>
                <ul className="mt-4 space-y-1.5 text-sm text-gray-700 flex-1">
                  {s.items.map(it => <li key={it} className="flex gap-2"><span className="text-gray-300">•</span>{it}</li>)}
                </ul>
                <button onClick={() => scrollTo('order')} className="mt-6 w-full border border-black rounded-full py-2.5 text-sm font-medium hover:bg-black hover:text-white transition-colors">{s.cta}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center">How It Works</h2>
          <p className="text-center text-gray-600 mt-2">Alur sederhana: brief → estimasi → deal → work → delivery</p>
          <div className="grid md:grid-cols-5 gap-4 mt-10">
            {howItWorks.map(s => (
              <div key={s.n} className="bg-white border border-gray-200 rounded-2xl p-5">
                <div className="text-xs font-bold tracking-widest text-gray-400">{s.n}</div>
                <h3 className="font-semibold mt-1 text-sm leading-tight">{s.title}</h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-500 mt-6">Order Form → WhatsApp → Brief → Estimasi Harga → Deal → Payment → Work → Delivery</p>
        </div>
      </section>

      {/* Portfolio teaser */}
      <section id="portfolio" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-3xl font-bold">Portfolio</h2>
              <p className="text-gray-600 mt-2">Bukti kemampuan, bukan hanya hasil akhir.</p>
            </div>
            <Link href="/" className="text-sm border border-gray-200 rounded-full px-4 py-2 hover:bg-gray-50">Lihat portfolio lengkap →</Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {[
              { cat: 'Web Development', title: 'Laravel Village Website', desc: 'Website informasi & potensi desa dengan Laravel + MySQL.' },
              { cat: 'Data', title: 'SPSS Data Analysis', desc: 'Pengolahan dataset & analisis statistik dengan SPSS.' },
              { cat: 'Document', title: 'Academic Report Formatting', desc: 'Perapihan heading, TOC otomatis, numbering, & formatting.' },
            ].map(p => (
              <div key={p.title} className="border border-gray-200 rounded-2xl p-6">
                <span className="text-[11px] tracking-widest font-semibold bg-gray-100 rounded-full px-2 py-1">{p.cat}</span>
                <h3 className="font-semibold mt-3">{p.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-6 flex-wrap text-xs">
            {['All', 'Web Development', 'Programming', 'Data', 'Academic', 'Document', 'IoT'].map(c => (
              <span key={c} className="border border-gray-200 rounded-full px-3 py-1 bg-gray-50">{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Me */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center">Why Choose Me</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {whyChoose.map(f => (
              <div key={f.title} className="bg-white border border-gray-200 rounded-2xl p-6">
                <f.icon className="w-5 h-5" />
                <h3 className="font-semibold mt-3">{f.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing + Urgent */}
      <section id="pricing" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center">Pricing</h2>
          <p className="text-center text-gray-600 mt-2">Starting from — price depends on complexity, quantity, and deadline.</p>
          <div className="grid lg:grid-cols-3 gap-6 mt-10">
            <div className="lg:col-span-2 border border-gray-200 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-2 bg-black text-white text-sm font-medium px-5 py-3">
                <span>Service</span><span className="text-right">Starting Price</span>
              </div>
              {pricing.map(([s, p]) => (
                <div key={s} className="grid grid-cols-2 text-sm px-5 py-3 border-t border-gray-100">
                  <span className="text-gray-700">{s}</span><span className="text-right font-medium">{p}</span>
                </div>
              ))}
              <div className="px-5 py-3 bg-gray-50 text-xs text-gray-500">Harga final menyesuaikan brief. Konsultasi dulu gratis.</div>
            </div>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-2xl p-6">
                <h3 className="font-semibold flex items-center gap-2"><Clock className="w-4 h-4" /> Regular</h3>
                <p className="text-2xl font-bold mt-2">1–3 Days</p>
                <p className="text-sm text-gray-600">Pengerjaan antrean normal.</p>
              </div>
              <div className="border-2 border-black rounded-2xl p-6 bg-gray-50">
                <h3 className="font-semibold flex items-center gap-2"><Zap className="w-4 h-4" /> Express</h3>
                <p className="text-2xl font-bold mt-2">&lt; 24 Hours</p>
                <p className="text-sm text-gray-600">Prioritas untuk deadline dekat. Biaya tambahan berlaku.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials + Screenshots */}
      <section id="testimonials" className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold">Testimonials</h2>
            <p className="text-gray-600 mt-2">Kepuasan customer — screenshot chat disensor untuk privasi.</p>
          </div>
          {testimonials.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl bg-white">
              <Quote className="w-8 h-8 mx-auto text-gray-300" />
              <p className="text-sm text-gray-500 mt-3">Belum ada testimoni. Tambahkan dari Dashboard → Assistance.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map(t => (
                <div key={t.id} className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm">{t.name}</p>
                      {t.service && <p className="text-xs text-gray-500">{t.service}</p>}
                    </div>
                    {t.rating != null && (
                      <span className="inline-flex items-center gap-1 text-xs bg-black text-white rounded-full px-2 py-1">
                        <Star className="w-3 h-3 fill-white" /> {t.rating}/5
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mt-3 leading-relaxed flex-1">&ldquo;{t.message}&rdquo;</p>
                  {t.screenshot_url ? (
                    <button onClick={() => setLightbox(t.screenshot_url!)} className="mt-4 block rounded-xl overflow-hidden border border-gray-200 hover:opacity-90 transition-opacity">
                      <img src={t.screenshot_url} alt={`Screenshot ${t.name}`} className="w-full h-44 object-cover object-top" />
                    </button>
                  ) : (
                    <div className="mt-4 h-24 flex items-center justify-center rounded-xl bg-gray-50 border border-dashed border-gray-200 text-xs text-gray-400">
                      Tanpa screenshot
                    </div>
                  )}
                  <p className="text-[11px] text-gray-400 mt-3">{new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center">FAQ</h2>
          <div className="mt-8 space-y-3">
            {faqs.map((f, i) => (
              <div key={f.q} className="bg-white border border-gray-200 rounded-2xl">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left">
                  <span className="font-medium text-sm pr-4">{f.q}</span>
                  <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && <div className="px-5 pb-5 text-sm text-gray-600">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-black text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold">Stuck With Your Task or Project?</h2>
          <p className="text-white/70 mt-3">Jangan biarkan tugas berhenti karena satu masalah. Jelaskan kebutuhanmu dan dapatkan estimasi.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <button onClick={() => scrollTo('order')} className="bg-white text-black px-7 py-3 rounded-full font-medium">Start a Project</button>
            <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer" className="border border-white/20 px-7 py-3 rounded-full font-medium hover:bg-white/10">Chat on WhatsApp</a>
          </div>
        </div>
      </section>

      {/* Order Form + Contact */}
      <section id="order" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-10">
          <div>
            <h2 className="text-2xl font-bold">Request a Quote</h2>
            <p className="text-sm text-gray-600 mt-2">Isi form, otomatis terarah ke WhatsApp dengan pesan siap kirim. Alur: Form → WA → Brief → Estimasi → Deal → Payment → Work → Delivery.</p>
            <form onSubmit={submitToWA} className="mt-6 space-y-4">
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your Name" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black" />
              <select value={form.service} onChange={e => setForm({ ...form, service: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black bg-white">
                {['Academic Assistance', 'Document & Word', 'Journal & Reference', 'Data & Statistics', 'Programming', 'Web Development', 'IoT', 'Other'].map(o => <option key={o}>{o}</option>)}
              </select>
              <input type="datetime-local" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black" />
              <textarea required value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} placeholder="Describe what you need..." rows={4} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black resize-none" />
              <div className="text-xs text-gray-500 flex items-center gap-2"><FileText className="w-3.5 h-3.5" /> File (Word/PDF/Excel/code) kirim via WhatsApp setelah konsultasi.</div>
              <button type="submit" className="w-full bg-black text-white rounded-full py-3 font-medium hover:bg-gray-900 flex items-center justify-center gap-2">Request a Quote <ArrowRight className="w-4 h-4" /></button>
            </form>
            <p className="text-[11px] text-gray-500 mt-3 leading-relaxed">Batasan: layanan untuk bantuan, konsultasi, formatting, research assistance, debugging, & pengembangan project. Tidak mengerjakan ujian berlangsung, pemalsuan data/sitasi, plagiarisme, atau jaminan nilai.</p>
          </div>
          <div id="contact" className="space-y-6">
            <div className="border border-gray-200 rounded-2xl p-6 bg-gray-50">
              <h3 className="font-semibold">Contact</h3>
              <p className="text-sm text-gray-600 mt-2">Konsultasi dulu sebelum estimasi harga. Fast response via WhatsApp.</p>
              <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer" className="inline-flex mt-4 bg-black text-white px-5 py-2.5 rounded-full text-sm">Chat on WhatsApp</a>
              <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white border border-gray-200 rounded-xl p-4"><div className="text-xs text-gray-500">Positioning</div><div className="font-medium mt-1">One-stop assistance for students & digital projects</div></div>
                <div className="bg-white border border-gray-200 rounded-xl p-4"><div className="text-xs text-gray-500">Core</div><div className="font-medium mt-1">ACADEMIC • DOCUMENT • DATA • TECHNICAL</div></div>
              </div>
            </div>
            <div className="border border-gray-200 rounded-2xl p-6">
              <h3 className="font-semibold">Layanan ditujukan untuk</h3>
              <ul className="text-sm text-gray-600 mt-3 space-y-1.5">
                <li>• Mahasiswa, pelajar, organisasi mahasiswa, UMKM</li>
                <li>• Butuh bantuan dokumen, data, jurnal, & programming</li>
              </ul>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                {['From Stuck to Done.', 'Your Academic & Technical Partner.', 'Get Help. Get It Done.'].map(t => (
                  <span key={t} className="border border-gray-200 rounded-full px-3 py-1 bg-white">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-10 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-8 text-sm">
            <div>
              <div className="font-bold">EL Assistance</div>
              <div className="text-xs tracking-widest text-gray-500 mt-1">Academic • Document • Data • Technical</div>
              <p className="text-gray-600 mt-3 leading-relaxed">Helping you get things done,<br />one project at a time.</p>
            </div>
            <div className="flex gap-8">
              <div>
                <div className="font-semibold">Explore</div>
                <div className="mt-3 space-y-2 text-gray-600">
                  <button onClick={() => scrollTo('services')} className="block hover:text-black">Services</button>
                  <button onClick={() => scrollTo('portfolio')} className="block hover:text-black">Portfolio</button>
                  <button onClick={() => scrollTo('faq')} className="block hover:text-black">FAQ</button>
                  <button onClick={() => scrollTo('contact')} className="block hover:text-black">Contact</button>
                </div>
              </div>
              <div>
                <div className="font-semibold">Portfolio site</div>
                <div className="mt-3 space-y-2 text-gray-600">
                  <Link href="/" className="block hover:text-black">Home Portfolio</Link>
                  <Link href="/projects" className="block hover:text-black">Projects</Link>
                  <Link href="/feed" className="block hover:text-black">Feed</Link>
                </div>
              </div>
            </div>
            <div className="text-gray-500">
              <div>© 2026 EL Assistance</div>
            </div>
          </div>
        </div>
      </footer>

      {lightbox && (
        <div onClick={() => setLightbox(null)} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <img src={lightbox} alt="Screenshot" className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl object-contain bg-white" />
        </div>
      )}
    </div>
  )
}
