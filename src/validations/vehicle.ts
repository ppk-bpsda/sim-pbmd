import { z } from "zod";

const numericOptional = z
  .string()
  .optional()
  .transform((v) => (v && v.trim() !== "" ? Number(v) : null))
  .refine((v) => v === null || !Number.isNaN(v), "Harus berupa angka");

/**
 * Form kendaraan menggabungkan kolom tabel `assets` (data BMD umum) dan
 * `vehicles` (data spesifik kendaraan: Noka/Nosin/Nopol, dst) — keduanya
 * disimpan lewat satu Server Action yang menulis ke dua tabel sekaligus
 * (relasi 1:1 shared primary key, §31 database design).
 */
export const vehicleSchema = z.object({
  // --- data aset (tabel assets) ---
  asset_code: z.string().trim().min(1, "Kode barang wajib diisi").max(50),
  register_number: z.string().trim().min(1, "Nomor register wajib diisi").max(50),
  name: z.string().trim().min(3, "Nama kendaraan minimal 3 karakter").max(200),
  brand: z.string().trim().max(100).optional().or(z.literal("")),
  model: z.string().trim().max(100).optional().or(z.literal("")),
  acquisition_year: numericOptional.refine(
    (v) => v === null || (v >= 1900 && v <= 2100),
    "Tahun perolehan tidak valid"
  ),
  condition: z.enum(["BAIK", "RUSAK_RINGAN", "RUSAK_BERAT"]),
  acquisition_value: numericOptional.refine((v) => v === null || v >= 0, "Nilai tidak boleh negatif"),
  location: z.string().trim().max(200).optional().or(z.literal("")),
  holder_name: z.string().trim().max(150).optional().or(z.literal("")),
  unit_id: z.string().uuid("Unit kerja wajib dipilih"),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),

  // --- data kendaraan (tabel vehicles) ---
  vehicle_category_id: z.string().uuid("Kategori kendaraan wajib dipilih"),
  plate_number: z.string().trim().min(1, "Nomor polisi wajib diisi").max(20),
  chassis_number: z.string().trim().max(50).optional().or(z.literal("")),
  engine_number: z.string().trim().max(50).optional().or(z.literal("")),
  bpkb_number: z.string().trim().max(50).optional().or(z.literal("")),
  stnk_number: z.string().trim().max(50).optional().or(z.literal("")),
  color: z.string().trim().max(50).optional().or(z.literal("")),
  status: z.enum(["AKTIF", "TIDAK_AKTIF", "DALAM_PERBAIKAN", "DIHAPUS"]),
});

export type VehicleInput = z.infer<typeof vehicleSchema>;

export const vehicleDocumentSchema = z.object({
  document_type: z.enum(["STNK", "PAJAK", "KIR", "BPKB", "LAINNYA"]),
  document_number: z.string().trim().max(100).optional().or(z.literal("")),
  issued_date: z.string().optional().or(z.literal("")),
  expiry_date: z.string().optional().or(z.literal("")),
  reminder_days_before: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.trim() !== "" ? Number(v) : 30))
    .refine((v) => !Number.isNaN(v) && v >= 0, "Harus berupa angka"),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export const vehicleBudgetPolicySchema = z.object({
  fiscal_year_id: z.string().uuid("Tahun anggaran wajib dipilih"),
  monthly_fuel_allocation: z
    .string()
    .trim()
    .min(1, "Jatah BBM per bulan wajib diisi")
    .transform((v) => Number(v))
    .refine((v) => !Number.isNaN(v) && v >= 0, "Nilai tidak boleh negatif"),
  annual_maintenance_allocation: z
    .string()
    .trim()
    .min(1, "Alokasi pemeliharaan tahunan wajib diisi")
    .transform((v) => Number(v))
    .refine((v) => !Number.isNaN(v) && v >= 0, "Nilai tidak boleh negatif"),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export const bulkVehicleBudgetPolicySchema = vehicleBudgetPolicySchema.extend({
  vehicle_category_id: z.string().uuid("Kategori kendaraan wajib dipilih"),
});
