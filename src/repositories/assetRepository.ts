// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

export type AssetListFilters = {
  search?: string;
  categoryId?: string;
  unitId?: string;
  condition?: string;
  page?: number;
  pageSize?: number;
};

export type AssetListRow = {
  id: string;
  asset_code: string;
  register_number: string;
  name: string;
  brand: string | null;
  model: string | null;
  condition: string;
  quantity: number;
  unit_of_measure: string | null;
  acquisition_year: number | null;
  acquisition_value: number | null;
  is_active: boolean;
  asset_categories: { name: string } | null;
  units: { name: string } | null;
};

export type AssetListResult = {
  rows: AssetListRow[];
  total: number;
  page: number;
  pageSize: number;
};

const DEFAULT_PAGE_SIZE = 20;

/**
 * Daftar aset dengan pagination & filter di sisi SERVER (§40: jangan ambil
 * seluruh tabel ke browser). RLS pada tabel `assets` yang membatasi baris
 * mana yang benar-benar boleh dilihat (per unit_id untuk OPERATOR/VERIFIKATOR);
 * fungsi ini hanya menambahkan filter opsional di atasnya.
 */
export async function listAssets(
  supabase: AnySupabase,
  filters: AssetListFilters
): Promise<AssetListResult> {
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : DEFAULT_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("assets")
    .select(
      "id, asset_code, register_number, name, brand, model, condition, quantity, unit_of_measure, acquisition_year, acquisition_value, is_active, asset_categories(name), units(name)",
      { count: "exact" }
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.search && filters.search.trim() !== "") {
    const term = filters.search.trim().replace(/[%_]/g, "");
    query = query.or(
      `name.ilike.%${term}%,asset_code.ilike.%${term}%,register_number.ilike.%${term}%`
    );
  }
  if (filters.categoryId) {
    query = query.eq("category_id", filters.categoryId);
  }
  if (filters.unitId) {
    query = query.eq("unit_id", filters.unitId);
  }
  if (filters.condition) {
    query = query.eq("condition", filters.condition);
  }

  const { data, count } = await query;

  return {
    rows: data ?? [],
    total: count ?? 0,
    page,
    pageSize,
  };
}

export async function getAssetById(supabase: AnySupabase, id: string) {
  const { data } = await supabase
    .from("assets")
    .select(
      "*, asset_categories(id, name), asset_types(id, name), units(id, name)"
    )
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  return data;
}

/**
 * Cek duplikasi kode barang + nomor register (§18) SEBELUM insert, supaya
 * pesan error yang ditampilkan ramah pengguna — bukan pesan constraint
 * database mentah (§39). Constraint UNIQUE di database tetap menjadi
 * penegak akhir bila terjadi race condition.
 */
export async function isAssetCodeRegisterDuplicate(
  supabase: AnySupabase,
  assetCode: string,
  registerNumber: string,
  excludeId?: string
): Promise<boolean> {
  let query = supabase
    .from("assets")
    .select("id", { count: "exact", head: true })
    .eq("asset_code", assetCode)
    .eq("register_number", registerNumber);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { count } = await query;
  return (count ?? 0) > 0;
}
