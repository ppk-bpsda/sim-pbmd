import { Boxes, Wallet, Wrench, Car } from "lucide-react";
import { KpiCard } from "@/components/ui/KpiCard";

/**
 * PENTING: Halaman ini adalah KERANGKA TAMPILAN Phase 1 saja.
 * Nilai KPI di bawah adalah PLACEHOLDER "—" (bukan angka dummy yang terlihat nyata),
 * sesuai aturan §47.13 pada Blueprint: dashboard tidak boleh berisi angka dummy yang
 * terlihat seolah data asli. Query nyata ke database (dan seluruh grafik) dibangun
 * pada Phase 10 setelah Phase 2 (schema), 5 (transaksi), dan 7 (anggaran) selesai.
 */
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Ringkasan pemeliharaan Barang Milik Daerah.
        </p>
      </div>

      <div className="rounded-md border border-dashed border-surface-border bg-white p-3 text-xs text-slate-500">
        Kerangka tampilan Phase 1. Data KPI, grafik, dan drill-down ke transaksi sumber
        akan aktif pada Phase 10 setelah modul transaksi &amp; anggaran tersedia.
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total BMD" value="—" icon={Boxes} />
        <KpiCard label="Total Transaksi Pemeliharaan" value="—" icon={Wrench} />
        <KpiCard label="Realisasi Anggaran" value="—" icon={Wallet} tone="success" />
        <KpiCard label="Total Kendaraan" value="—" icon={Car} />
      </div>

      <div className="rounded-card border border-surface-border bg-white p-6 shadow-card">
        <p className="text-sm font-medium text-slate-700">Realisasi Pemeliharaan per Bulan</p>
        <div className="mt-4 flex h-56 items-center justify-center rounded-md border border-dashed border-surface-border text-sm text-slate-400">
          Grafik akan tampil di sini (Phase 10)
        </div>
      </div>
    </div>
  );
}
