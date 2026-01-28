export function Footer() {
  return (
    <footer className="fixed bottom-0 w-full py-4 text-center text-sm text-black bg-white border-t border-black">
      <div className="max-w-7xl mx-auto px-6">
        © {new Date().getFullYear()} Agentic Light Sentinel
      </div>
    </footer>
  );
}
