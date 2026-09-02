import Image from 'next/image'

export default function About() {
  return (
    <section id="about" className="py-20 bg-white" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Tentang Saya</h2>
          <div className="w-20 h-1 bg-black mx-auto" />
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="slide-up">
            <div className="w-64 h-64 mx-auto bg-gradient-to-br from-gray-100 to-gray-300 rounded-2xl overflow-hidden flex items-center justify-center">
              <Image
                src="/images/azriel.jpg"
                alt="Foto Azriel"
                width={256}
                height={256}
                className="w-64 h-64 object-cover"
                priority
              />
            </div>
          </div>

          <div className="fade-in" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-2xl font-semibold mb-4">Halo! Saya Azriel</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Saya adalah mahasiswa S1 Sistem Informasi yang passionate dalam dunia teknologi
              dan pengembangan perangkat lunak. Dengan pengalaman dalam berbagai bahasa
              pemrograman dan teknologi modern, saya selalu siap menghadapi tantangan baru
              dalam dunia digital.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
