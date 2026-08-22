import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getVehicleCategories, getFiscalYears } from "@/repositories/masterDataRepository";
import { BulkPolicyForm } from "./BulkPolicyForm";

export default async function VehiclePoliciesPage() {
  const supabase = createClient();
  const [categories, fiscalYears] = await Promise.all([getVehicleCategories(supabase), getFiscalYears(supabase)]);

  return (
    <div className="space-y-4">
      <div>
        <Link href="/vehicles" className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Kendaraan
        </Link>
        <h1 className="text-lg font-semibold text-slate-800">Kelola Alokasi Anggaran Kendaraan</h1>
        <p className="text-sm text-slate-500">
          Terapkan alokasi BBM &amp; pemeliharaan ke seluruh kendaraan dalam satu kategori sekaligus.
          Untuk kendaraan dengan kebijakan berbeda dari kategorinya (mis. Mobil Dinas Perorangan vs
          Penumpang yang jatah BBM-nya berbeda), atur satu per satu lewat halaman detail kendaraan
          masing-masing.
        </p>
      </div>

      {categories.length === 0 || fiscalYears.length === 0 ? (
        <div className="rounded-card border border-dashed border-surface-border bg-white p-8 text-center text-sm text-slate-400 shadow-card">
          Pastikan Master Kategori Kendaraan dan Tahun Anggaran sudah tersedia terlebih dahulu.
        </div>
      ) : (
        <div className="rounded-card border border-surface-border bg-white p-6 shadow-card">
          <BulkPolicyForm categories={categories} fiscalYears={fiscalYears} />
        </div>
      )}
    </div>
  );
}
