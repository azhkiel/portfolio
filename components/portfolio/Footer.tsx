export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-8"
            style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="max-w-6xl mx-auto px-4 text-center">
        <div className="border-t border-gray-200 pt-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Moch Azriel Maulana Racmadhani.
          </p>
        </div>
      </div>
    </footer>
  )
}
