// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

export type AssetCategoryOption = {
  id: string;
  code: string;
  name: string;
};

export type AssetTypeOption = {
  id: string;
  category_id: string;
  code: string;
  name: string;
};

export type UnitOption = {
  id: string;
  code: string;
  name: string;
};

export async function getAssetCategories(supabase: AnySupabase): Promise<AssetCategoryOption[]> {
  const { data } = await supabase
    .from("asset_categories")
    .select("id, code, name")
    .eq("is_active", true)
    .order("name", { ascending: true });
  return data ?? [];
}

export async function getAssetTypes(
  supabase: AnySupabase,
  categoryId?: string
): Promise<AssetTypeOption[]> {
  let query = supabase
    .from("asset_types")
    .select("id, category_id, code, name")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data } = await query;
  return data ?? [];
}

/**
 * Daftar unit kerja untuk dropdown form. Untuk role OPERATOR/VERIFIKATOR,
 * idealnya disaring ke unit miliknya saja (kenyamanan UI) — RLS tabel assets
 * tetap menjadi penegak utama di sisi database bila filter ini terlewat.
 */
export async function getUnits(
  supabase: AnySupabase,
  onlyUnitIds?: string[]
): Promise<UnitOption[]> {
  let query = supabase
    .from("units")
    .select("id, code, name")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (onlyUnitIds && onlyUnitIds.length > 0) {
    query = query.in("id", onlyUnitIds);
  }

  const { data } = await query;
  return data ?? [];
}
