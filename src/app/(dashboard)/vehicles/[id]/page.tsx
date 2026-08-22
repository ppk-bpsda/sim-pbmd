import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Trash2, Fuel } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  getVehicleById,
  getVehicleDocuments,
  getVehicleBudgetSummaryOne,
} from "@/repositories/vehicleRepository";
import { getMaintenanceHistoryForAsset } from "@/repositories/maintenanceRepository";
import { getFuelHistoryForVehicle } from "@/repositories/fuelRepository";
import { getFiscalYears } from "@/repositories/masterDataRepository";
import { retireVehicleAction } from "../actions";
import { VehicleDocuments } from "./VehicleDocuments";
import { VehicleBudgetPolicyForm } from "./VehicleBudgetPolicyForm";
import { VEHICLE_STATUS_BADGE_CLASS, vehicleStatusLabel, type VehicleStatus } from "@/constants/vehicle";
import { STATUS_BADGE_CLASS, STATUS_LABELS, type TransactionStatus } from "@/constants/maintenance";
import { formatCurrency, formatDate, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-surface-border py-2.5 text-sm last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-700">{value ?? "-"}</span>
    </div>
  );
}

export default async function VehicleDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [vehicle, documents, fiscalYears, maintenanceHistory, fuelHistory] = await Promise.all([
    getVehicleById(supabase, params.id),
    getVehicleDocuments(supabase, params.id),
    getFiscalYears(supabase),
    getMaintenanceHistoryForAsset(supabase, params.id),
    getFuelHistoryForVehicle(supabase, params.id),
  ]);

  if (!vehicle) {
    notFound();
  }

  const activeFiscalYear = fiscalYears.find((f) => f.is_active) ?? fiscalYears[0];
  const budgetSummary = activeFiscalYear
    ? await getVehicleBudgetSummaryOne(supabase, params.id, activeFiscalYear.id)
    : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs text-slate-400">
            Noka: {vehicle.chassis_number ?? "-"} — Nosin: {vehicle.engine_number ?? "-"}
          </p>
          <h1 className="text-lg font-semibold text-slate-800">
            {vehicle.plate_number} — {vehicle.assets.name}
          </h1>
          <span className={cn("mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-medium", VEHICLE_STATUS_BADGE_CLASS[vehicle.status as VehicleStatus])}>
            {vehicleStatusLabel(vehicle.status)}
          </span>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/fuel/new?vehicle=${vehicle.id}`}
            className="flex items-center gap-2 rounded-md border border-surface-border px-4 py-2 text-sm text-slate-600 hover:bg-surface-muted"
          >
            <Fuel className="h-4 w-4" />
            Catat BBM
          </Link>
          <Link
            href={`/vehicles/${vehicle.id}/edit`}
            className="flex items-center gap-2 rounded-md border border-surface-border px-4 py-2 text-sm text-slate-600 hover:bg-surface-muted"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
          <form action={retireVehicleAction.bind(null, vehicle.id)}>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-md border border-status-danger/30 px-4 py-2 text-sm text-status-danger hover:bg-status-dangerBg"
            >
              <Trash2 className="h-4 w-4" />
              Nonaktifkan
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-card border border-surface-border bg-white p-5 shadow-card">
            <h2 className="mb-2 text-sm font-semibold text-slate-700">Data Kendaraan</h2>
            <DetailRow label="Nomor Polisi (Nopol)" value={vehicle.plate_number} />
            <DetailRow label="Nomor Rangka (Noka)" value={vehicle.chassis_number} />
            <DetailRow label="Nomor Mesin (Nosin)" value={vehicle.engine_number} />
            <DetailRow label="Nomor BPKB" value={vehicle.bpkb_number} />
            <DetailRow label="Nomor STNK" value={vehicle.stnk_number} />
            <DetailRow label="Warna" value={vehicle.color} />
            <DetailRow label="Kategori" value={vehicle.vehicle_categories?.name} />
            <DetailRow label="Merk / Tipe" value={[vehicle.assets.brand, vehicle.assets.model].filter(Boolean).join(" / ") || "-"} />
            <DetailRow label="Tahun Perolehan" value={vehicle.assets.acquisition_year} />
            <DetailRow label="Unit Kerja" value={vehicle.assets.units?.name} />
            <DetailRow label="Pengguna / Pemegang" value={vehicle.assets.holder_name} />
          </div>

          <VehicleDocuments vehicleId={vehicle.id} documents={documents} />

          <div className="rounded-card border border-surface-border bg-white shadow-card">
            <h2 className="border-b border-surface-border px-5 py-3 text-sm font-semibold text-slate-700">
              Riwayat Pemeliharaan ({maintenanceHistory.length})
            </h2>
            {maintenanceHistory.length === 0 ? (
              <p className="px-5 py-6 text-center text-sm text-slate-400">Belum ada transaksi pemeliharaan.</p>
            ) : (
              <ul className="divide-y divide-surface-border">
                {maintenanceHistory.map((h) => (
                  <li key={h.id} className="px-5 py-3">
                    <Link href={`/maintenance/${h.id}`} className="block hover:bg-surface-muted/60">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-brand-700">{h.transaction_number}</p>
                        <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", STATUS_BADGE_CLASS[h.status as TransactionStatus])}>
                          {STATUS_LABELS[h.status as TransactionStatus]}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{h.maintenance_types?.name ?? "-"}</p>
                      <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                        <span>{formatDate(h.transaction_date)}</span>
                        <span className="font-medium text-slate-600">{formatCurrency(h.amount)}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-card border border-surface-border bg-white shadow-card">
            <h2 className="border-b border-surface-border px-5 py-3 text-sm font-semibold text-slate-700">
              Riwayat BBM ({fuelHistory.length})
            </h2>
            {fuelHistory.length === 0 ? (
              <p className="px-5 py-6 text-center text-sm text-slate-400">Belum ada transaksi BBM.</p>
            ) : (
              <ul className="divide-y divide-surface-border">
                {fuelHistory.map((f: { id: string; transaction_date: string; fuel_type: string; volume_liters: number; total_cost: number; provider_name: string | null }) => (
                  <li key={f.id} className="px-5 py-3">
                    <Link href={`/fuel/${f.id}/edit`} className="block hover:bg-surface-muted/60">
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="font-medium text-slate-700">{f.fuel_type} — {formatNumber(f.volume_liters)} L</span>
                        <span className="font-medium text-slate-600">{formatCurrency(f.total_cost)}</span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {formatDate(f.transaction_date)} — {f.provider_name ?? "-"}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-card border border-surface-border bg-white p-5 shadow-card">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">
              Rekap Anggaran {activeFiscalYear ? `Tahun ${activeFiscalYear.year}` : ""}
            </h2>
            {budgetSummary ? (
              <div className="space-y-1">
                <DetailRow label="Jumlah Pemeliharaan" value={`${budgetSummary.maintenance_count}x`} />
                <DetailRow label="Total Biaya Pemeliharaan" value={formatCurrency(budgetSummary.maintenance_total)} />
                <DetailRow label="Jumlah Pengisian BBM" value={`${budgetSummary.fuel_count}x`} />
                <DetailRow label="Total Biaya BBM" value={formatCurrency(budgetSummary.fuel_total)} />
                <DetailRow label="Total Realisasi" value={formatCurrency(budgetSummary.total_realization)} />
                <DetailRow label="Pagu Tahunan" value={budgetSummary.annual_total_budget !== null ? formatCurrency(budgetSummary.annual_total_budget) : "Belum diatur"} />
                {budgetSummary.annual_total_budget !== null && (
                  <>
                    <DetailRow label="Sisa Anggaran" value={formatCurrency(budgetSummary.remaining_budget)} />
                    <DetailRow label="% Realisasi" value={`${budgetSummary.realization_percentage ?? 0}%`} />
                  </>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400">Tahun anggaran belum tersedia.</p>
            )}
            <p className="mt-3 text-xs text-slate-400">
              Dihitung otomatis dari transaksi pemeliharaan (Disetujui/Diposting) + seluruh transaksi BBM (§54-55).
            </p>
          </div>

          <div className="rounded-card border border-surface-border bg-white p-5 shadow-card">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Atur Alokasi Anggaran</h2>
            <VehicleBudgetPolicyForm
              vehicleId={vehicle.id}
              fiscalYears={fiscalYears}
              currentFiscalYearId={activeFiscalYear?.id}
              currentMonthlyFuel={budgetSummary?.monthly_fuel_allocation}
              currentAnnualMaintenance={budgetSummary?.annual_maintenance_allocation}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
