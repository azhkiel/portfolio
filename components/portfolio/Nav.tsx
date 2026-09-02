'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Nav() {
  const [open, setOpen] = useState(false)

  const links = [
    { href: '/#home', label: 'Beranda' },
    { href: '/#about', label: 'Tentang' },
    { href: '/#projects', label: 'Proyek' },
    { href: '/#skills', label: 'Skills' },
    { href: '/#contact', label: 'Kontak' },
    { href: '/feed', label: 'Feed' },
  ]

  return (
    <nav className="fixed w-full top-0 z-50 bg-white/60 backdrop-blur-2xl border-b border-white/50 shadow-[0_4px_30px_rgba(0,0,0,0.03)] transition-all duration-300"
         style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image src="/vector.png" alt="Logo" width={32} height={32} className="rounded-full shadow-sm" />
            <div className="text-xl font-bold text-gradient">Azriel Website Portfolio</div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            {links.map(l => (
              <Link key={l.href} href={l.href}
                 className="relative text-gray-600 hover:text-black transition-colors font-medium group py-1">
                {l.label}
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-black transition-all duration-300 ease-out group-hover:w-full"></span>
              </Link>
            ))}
          </div>

          {/* Mobile Toggle */}
          <button onClick={() => setOpen(!open)} className="md:hidden focus:outline-none"
                  aria-label="Toggle menu">
            <div className="w-6 h-6 flex flex-col justify-center items-center gap-1">
              <span className={`w-5 h-0.5 bg-black transition-all ${open ? 'rotate-45 translate-y-1.5' : ''}`} />
              <span className={`w-5 h-0.5 bg-black transition-all ${open ? 'opacity-0' : ''}`} />
              <span className={`w-5 h-0.5 bg-black transition-all ${open ? '-rotate-45 -translate-y-1.5' : ''}`} />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              {links.map(l => (
                <Link key={l.href} href={l.href}
                   onClick={() => setOpen(false)}
                   className="block px-4 py-2 text-gray-700 hover:text-black hover:bg-gray-50/50 rounded-lg transition-colors font-medium">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
