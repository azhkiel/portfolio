import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Moch Azriel Maulana Racmadhani',
  description: 'Portfolio & LinkJar — Moch Azriel Maulana Racmadhani',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className="bg-white text-black">
        {children}
      </body>
    </html>
  )
}
