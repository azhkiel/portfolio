'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Nav() {
  const [open, setOpen] = useState(false)

  const links = [
    { href: '#home', label: 'Beranda' },
    { href: '#about', label: 'Tentang' },
    { href: '#projects', label: 'Proyek' },
    { href: '#skills', label: 'Skills' },
    { href: '#contact', label: 'Kontak' },
  ]

  return (
    <nav className="fixed w-full top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200"
         style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="text-xl font-bold text-gradient">Azriel Website Portfolio</div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            {links.map(l => (
              <a key={l.href} href={l.href}
                 className="hover:text-gray-600 transition-colors font-medium">
                {l.label}
              </a>
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
                <a key={l.href} href={l.href}
                   onClick={() => setOpen(false)}
                   className="hover:text-gray-600 transition-colors font-medium">
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
