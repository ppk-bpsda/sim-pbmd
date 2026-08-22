import { z } from "zod";

export const budgetSchema = z.object({
  fiscal_year_id: z.string().uuid("Tahun anggaran wajib dipilih"),
  budget_account_id: z.string().uuid("Rekening belanja wajib dipilih"),
  unit_id: z.string().uuid("Unit kerja wajib dipilih"),
  ceiling_amount: z
    .string()
    .trim()
    .min(1, "Pagu wajib diisi")
    .transform((v) => Number(v))
    .refine((v) => !Number.isNaN(v) && v >= 0, "Pagu tidak boleh negatif"),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export const budgetAccountSchema = z.object({
  code: z.string().trim().min(1, "Kode rekening wajib diisi").max(30),
  name: z.string().trim().min(3, "Nama rekening wajib diisi").max(200),
});

export const fiscalYearSchema = z.object({
  year: z
    .string()
    .trim()
    .min(4, "Tahun wajib diisi")
    .transform((v) => Number(v))
    .refine((v) => !Number.isNaN(v) && v >= 2000 && v <= 2100, "Tahun tidak valid"),
});

export const programSchema = z.object({
  code: z.string().trim().min(1, "Kode program wajib diisi").max(30),
  name: z.string().trim().min(3, "Nama program wajib diisi").max(200),
});

export const activitySchema = z.object({
  program_id: z.string().uuid("Program induk wajib dipilih"),
  code: z.string().trim().min(1, "Kode kegiatan wajib diisi").max(30),
  name: z.string().trim().min(3, "Nama kegiatan wajib diisi").max(200),
});

export const subactivitySchema = z.object({
  activity_id: z.string().uuid("Kegiatan induk wajib dipilih"),
  code: z.string().trim().min(1, "Kode sub kegiatan wajib diisi").max(30),
  name: z.string().trim().min(3, "Nama sub kegiatan wajib diisi").max(200),
});
