import { Bell, Search } from "lucide-react";

export function Topbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-surface-border bg-white px-4 md:px-6">
      <div className="flex flex-1 items-center gap-3">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Cari aset, kendaraan, transaksi..."
            className="w-full rounded-md border border-surface-border bg-surface-muted py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          aria-label="Notifikasi"
          className="relative rounded-full p-2 text-slate-500 hover:bg-surface-muted"
        >
          <Bell className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
            AD
          </div>
          <div className="hidden text-left leading-tight md:block">
            <p className="text-sm font-medium text-slate-700">Nama Pengguna</p>
            <p className="text-[11px] text-slate-400">Role — Unit Kerja</p>
          </div>
        </div>
      </div>
    </header>
  );
}
