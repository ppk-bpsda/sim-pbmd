"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { assetSchema } from "@/validations/asset";
import { isAssetCodeRegisterDuplicate } from "@/repositories/assetRepository";

export type AssetActionState = {
  error: string | null;
};

/**
 * Satu action untuk create & update: bila formData membawa "id", jadi UPDATE.
 * RLS (assets_insert / assets_update) tetap menjadi penegak akhir siapa yang
 * benar-benar boleh menulis ke unit_id tertentu — validasi di sini murni
 * agar pesan error ramah pengguna (§39), bukan pengganti RLS.
 */
export async function saveAssetAction(
  _prevState: AssetActionState,
  formData: FormData
): Promise<AssetActionState> {
  const id = formData.get("id")?.toString() || undefined;

  const raw = {
    asset_code: formData.get("asset_code"),
    register_number: formData.get("register_number"),
    name: formData.get("name"),
    category_id: formData.get("category_id"),
    type_id: formData.get("type_id"),
    brand: formData.get("brand"),
    model: formData.get("model"),
    size_spec: formData.get("size_spec"),
    material: formData.get("material"),
    acquisition_year: formData.get("acquisition_year"),
    condition: formData.get("condition"),
    quantity: formData.get("quantity"),
    unit_of_measure: formData.get("unit_of_measure"),
    acquisition_value: formData.get("acquisition_value"),
    book_value: formData.get("book_value"),
    location: formData.get("location"),
    holder_name: formData.get("holder_name"),
    unit_id: formData.get("unit_id"),
    notes: formData.get("notes"),
  };

  const parsed = assetSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const supabase = createClient();

  // §18: deteksi duplikasi kode barang + nomor register SEBELUM insert/update,
  // agar pesan error jelas (constraint UNIQUE di DB tetap jaring pengaman akhir).
  const duplicate = await isAssetCodeRegisterDuplicate(
    supabase,
    parsed.data.asset_code,
    parsed.data.register_number,
    id
  );
  if (duplicate) {
    return {
      error: `Kombinasi Kode Barang "${parsed.data.asset_code}" + Nomor Register "${parsed.data.register_number}" sudah terdaftar pada aset lain.`,
    };
  }

  const payload = {
    asset_code: parsed.data.asset_code,
    register_number: parsed.data.register_number,
    name: parsed.data.name,
    category_id: parsed.data.category_id,
    type_id: parsed.data.type_id,
    brand: parsed.data.brand || null,
    model: parsed.data.model || null,
    size_spec: parsed.data.size_spec || null,
    material: parsed.data.material || null,
    acquisition_year: parsed.data.acquisition_year,
    condition: parsed.data.condition,
    quantity: parsed.data.quantity,
    unit_of_measure: parsed.data.unit_of_measure || null,
    acquisition_value: parsed.data.acquisition_value,
    book_value: parsed.data.book_value,
    location: parsed.data.location || null,
    holder_name: parsed.data.holder_name || null,
    unit_id: parsed.data.unit_id,
    notes: parsed.data.notes || null,
  };

  let assetId = id;

  if (id) {
    const { error } = await supabase.from("assets").update(payload).eq("id", id);
    if (error) {
      return { error: "Data tidak dapat disimpan. Silakan periksa kembali data yang diinput." };
    }
  } else {
    const { data, error } = await supabase
      .from("assets")
      .insert(payload)
      .select("id")
      .single();
    if (error || !data) {
      return { error: "Data tidak dapat disimpan. Silakan periksa kembali data yang diinput." };
    }
    assetId = data.id;
  }

  revalidatePath("/assets");
  if (assetId) revalidatePath(`/assets/${assetId}`);
  redirect(`/assets/${assetId}`);
}

/**
 * Nonaktifkan aset (SOFT DELETE, §32) — data historis tidak pernah dihapus
 * permanen. Dipanggil lewat <form action={softDeleteAssetAction.bind(null, id)}>.
 */
export async function softDeleteAssetAction(id: string): Promise<void> {
  const supabase = createClient();
  await supabase
    .from("assets")
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq("id", id);

  revalidatePath("/assets");
  redirect("/assets");
}
