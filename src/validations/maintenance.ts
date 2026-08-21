import { z } from "zod";

const optionalUuid = z
  .string()
  .optional()
  .transform((v) => (v && v.trim() !== "" ? v : null))
  .refine((v) => v === null || z.string().uuid().safeParse(v).success, "Pilihan tidak valid");

export const maintenanceTransactionSchema = z.object({
  transaction_date: z.string().min(1, "Tanggal wajib diisi"),
  document_number: z.string().trim().max(100).optional().or(z.literal("")),
  asset_id: z.string().uuid("Aset wajib dipilih"),
  maintenance_type_id: z.string().uuid("Jenis pemeliharaan wajib dipilih"),
  description: z.string().trim().min(5, "Uraian pekerjaan minimal 5 karakter").max(1000),
  vendor_id: optionalUuid,
  invoice_number: z.string().trim().max(100).optional().or(z.literal("")),
  proof_number: z.string().trim().max(100).optional().or(z.literal("")),
  amount: z
    .string()
    .trim()
    .min(1, "Nilai pemeliharaan wajib diisi")
    .transform((v) => Number(v))
    .refine((v) => !Number.isNaN(v) && v >= 0, "Nilai tidak boleh negatif"),
  funding_source_id: optionalUuid,
  program_id: optionalUuid,
  activity_id: optionalUuid,
  subactivity_id: optionalUuid,
  budget_account_id: z.string().uuid("Rekening belanja wajib dipilih"),
  fiscal_year_id: z.string().uuid("Tahun anggaran wajib dipilih"),
  unit_id: z.string().uuid("Unit kerja tidak valid — pilih aset terlebih dahulu"),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type MaintenanceTransactionInput = z.infer<typeof maintenanceTransactionSchema>;

export const rejectReasonSchema = z.object({
  reason: z.string().trim().min(5, "Alasan penolakan wajib diisi (minimal 5 karakter)").max(500),
});
