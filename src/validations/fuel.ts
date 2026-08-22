import { z } from "zod";

export const fuelTransactionSchema = z.object({
  transaction_date: z.string().min(1, "Tanggal wajib diisi"),
  vehicle_id: z.string().uuid("Kendaraan wajib dipilih"),
  fuel_type: z.string().trim().min(1, "Jenis BBM wajib diisi").max(50),
  volume_liters: z
    .string()
    .trim()
    .min(1, "Volume wajib diisi")
    .transform((v) => Number(v))
    .refine((v) => !Number.isNaN(v) && v > 0, "Volume harus lebih dari 0"),
  price_per_liter: z
    .string()
    .trim()
    .min(1, "Harga per liter wajib diisi")
    .transform((v) => Number(v))
    .refine((v) => !Number.isNaN(v) && v >= 0, "Harga tidak boleh negatif"),
  odometer_km: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() !== "" ? Number(v) : null))
    .refine((v) => v === null || v >= 0, "Odometer tidak boleh negatif"),
  provider_name: z.string().trim().max(150).optional().or(z.literal("")),
  proof_number: z.string().trim().max(100).optional().or(z.literal("")),
  unit_id: z.string().uuid("Unit kerja tidak valid — pilih kendaraan terlebih dahulu"),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export type FuelTransactionInput = z.infer<typeof fuelTransactionSchema>;
