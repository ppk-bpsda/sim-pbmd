export const VEHICLE_STATUSES = [
  { value: "AKTIF", label: "Aktif" },
  { value: "TIDAK_AKTIF", label: "Tidak Aktif" },
  { value: "DALAM_PERBAIKAN", label: "Dalam Perbaikan" },
  { value: "DIHAPUS", label: "Dihapus" },
] as const;

export type VehicleStatus = (typeof VEHICLE_STATUSES)[number]["value"];

export const VEHICLE_STATUS_BADGE_CLASS: Record<VehicleStatus, string> = {
  AKTIF: "bg-status-successBg text-status-success",
  TIDAK_AKTIF: "bg-slate-100 text-slate-600",
  DALAM_PERBAIKAN: "bg-status-warningBg text-status-warning",
  DIHAPUS: "bg-status-dangerBg text-status-danger",
};

export function vehicleStatusLabel(value: string): string {
  return VEHICLE_STATUSES.find((s) => s.value === value)?.label ?? value;
}

export const VEHICLE_DOCUMENT_TYPES = [
  { value: "STNK", label: "STNK" },
  { value: "PAJAK", label: "Pajak Kendaraan" },
  { value: "KIR", label: "KIR" },
  { value: "BPKB", label: "BPKB" },
  { value: "LAINNYA", label: "Lainnya" },
] as const;

export function documentTypeLabel(value: string): string {
  return VEHICLE_DOCUMENT_TYPES.find((d) => d.value === value)?.label ?? value;
}

/**
 * Ambang batas "akan jatuh tempo" untuk pewarnaan di UI (§35). Nilai default
 * dipakai bila belum ada baris alert_settings terkait — nilai sesungguhnya
 * tetap CONFIGURABLE lewat tabel alert_settings, ini hanya fallback tampilan.
 */
export const DEFAULT_DUE_SOON_DAYS = 30;

export function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - new Date().setHours(0, 0, 0, 0);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
