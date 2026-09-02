'use client'

export default function Hero() {
  return (
    <section id="home"
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white"
      style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="fade-in" style={{ animationDelay: '0.2s' }}>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-gradient">
            Moch Azriel Maulana Racmadhani
          </h1>
        </div>
        <div className="slide-up" style={{ animationDelay: '0.4s' }}>
          <p className="text-xl md:text-2xl text-gray-600 mb-2">Mahasiswa S1 Sistem Informasi</p>
          <p className="text-lg text-gray-500 mb-8">Full Stack Developer &amp; Tech Enthusiast</p>
        </div>
        <div className="scale-in" style={{ animationDelay: '0.6s' }}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.open('https://1drv.ms/w/c/7f8d5b410a14f141/Ee4YcIEwwCxHu25hg4TpzPUByCvyX3-7fSHBBNokzG6QeA?e=8sQoCD')}
              className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium">
              Lihat CV
            </button>
            <a href="#contact"
               className="border-2 border-black text-black px-8 py-3 rounded-lg hover:bg-black hover:text-white transition-colors font-medium">
              Hubungi Saya
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
