import { z } from "zod";

// Angka dari <input> selalu string — helper untuk parse aman ke number | null.
const numericOptional = z
  .string()
  .optional()
  .transform((v) => (v && v.trim() !== "" ? Number(v) : null))
  .refine((v) => v === null || !Number.isNaN(v), "Harus berupa angka");

export const assetSchema = z.object({
  asset_code: z.string().trim().min(1, "Kode barang wajib diisi").max(50),
  register_number: z.string().trim().min(1, "Nomor register wajib diisi").max(50),
  name: z.string().trim().min(3, "Nama barang minimal 3 karakter").max(200),
  category_id: z.string().uuid("Kategori wajib dipilih"),
  type_id: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() !== "" ? v : null))
    .refine((v) => v === null || z.string().uuid().safeParse(v).success, "Jenis barang tidak valid"),
  brand: z.string().trim().max(100).optional().or(z.literal("")),
  model: z.string().trim().max(100).optional().or(z.literal("")),
  size_spec: z.string().trim().max(100).optional().or(z.literal("")),
  material: z.string().trim().max(100).optional().or(z.literal("")),
  acquisition_year: numericOptional.refine(
    (v) => v === null || (v >= 1900 && v <= 2100),
    "Tahun perolehan tidak valid"
  ),
  condition: z.enum(["BAIK", "RUSAK_RINGAN", "RUSAK_BERAT"]),
  quantity: z
    .string()
    .trim()
    .min(1, "Jumlah wajib diisi")
    .transform((v) => Number(v))
    .refine((v) => !Number.isNaN(v) && v > 0, "Jumlah harus lebih dari 0"),
  unit_of_measure: z.string().trim().max(30).optional().or(z.literal("")),
  acquisition_value: numericOptional.refine((v) => v === null || v >= 0, "Nilai tidak boleh negatif"),
  book_value: numericOptional.refine((v) => v === null || v >= 0, "Nilai tidak boleh negatif"),
  location: z.string().trim().max(200).optional().or(z.literal("")),
  holder_name: z.string().trim().max(150).optional().or(z.literal("")),
  unit_id: z.string().uuid("Unit kerja wajib dipilih"),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type AssetInput = z.infer<typeof assetSchema>;

export const assetCategorySchema = z.object({
  code: z.string().trim().min(1, "Kode wajib diisi").max(30).toUpperCase(),
  name: z.string().trim().min(3, "Nama wajib diisi").max(150),
  description: z.string().trim().max(500).optional().or(z.literal("")),
});

export const assetTypeSchema = z.object({
  category_id: z.string().uuid("Kategori wajib dipilih"),
  code: z.string().trim().min(1, "Kode wajib diisi").max(30).toUpperCase(),
  name: z.string().trim().min(3, "Nama wajib diisi").max(150),
});
