"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { assetCategorySchema, assetTypeSchema } from "@/validations/asset";

export type CategoryActionState = { error: string | null };

/**
 * Menambah kategori/jenis barang baru. RLS (asset_categories_admin_write,
 * asset_types_admin_write) membatasi hanya ADMIN/SUPER_ADMIN yang benar-benar
 * bisa menulis — bila role lain mencoba, Supabase akan menolak di level DB
 * dan pesan berikut yang ditampilkan (bukan detail teknis).
 */
export async function createCategoryAction(
  _prevState: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  const parsed = assetCategorySchema.safeParse({
    code: formData.get("code"),
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const supabase = createClient();
  const { error } = await supabase.from("asset_categories").insert({
    code: parsed.data.code,
    name: parsed.data.name,
    description: parsed.data.description || null,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: `Kode kategori "${parsed.data.code}" sudah digunakan.` };
    }
    return { error: "Data tidak dapat disimpan. Pastikan Anda memiliki hak akses (Admin)." };
  }

  revalidatePath("/assets/categories");
  return { error: null };
}

export async function createTypeAction(
  _prevState: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  const parsed = assetTypeSchema.safeParse({
    category_id: formData.get("category_id"),
    code: formData.get("code"),
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const supabase = createClient();
  const { error } = await supabase.from("asset_types").insert({
    category_id: parsed.data.category_id,
    code: parsed.data.code,
    name: parsed.data.name,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: `Kode jenis barang "${parsed.data.code}" sudah digunakan pada kategori ini.` };
    }
    return { error: "Data tidak dapat disimpan. Pastikan Anda memiliki hak akses (Admin)." };
  }

  revalidatePath("/assets/categories");
  return { error: null };
}
