export default function SiteFooter() {
  return (
    <footer className="border-t border-[#E5E7EB] bg-white py-8 text-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 md:flex-row md:items-center md:justify-between md:px-8">
        <p>
          <span className="font-bold text-acac-navy">AFIT</span>
          <span className="mx-1.5 text-acac-muted">×</span>
          <span className="font-bold text-acac-navy">Cowrywise</span>
        </p>
        <p className="text-acac-muted">© 2026 AFIT Cowrywise Ambassadors Competition</p>
        <span className="text-[11px] text-[#9CA3AF]">Player 001</span>
      </div>
    </footer>
  );
}
