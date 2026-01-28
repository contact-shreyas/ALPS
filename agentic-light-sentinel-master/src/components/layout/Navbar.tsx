export function Navbar() {
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-black shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="font-bold text-black tracking-tight text-lg">Agentic Light Sentinel</a>
        <nav className="space-x-6">
          <a href="/dashboard" className="text-black hover:text-gray-600 transition-colors font-medium">Dashboard</a>
          <a href="/api/alerts" target="_blank" rel="noreferrer" className="text-black hover:text-gray-600 transition-colors font-medium">Alerts JSON</a>
        </nav>
      </div>
    </header>
  );
}
