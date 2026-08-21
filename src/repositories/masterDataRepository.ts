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

// =============================================================
// Master data untuk form Transaksi Pemeliharaan (Phase 5)
// =============================================================

export type SimpleOption = { id: string; code: string; name: string };

export async function getMaintenanceTypes(supabase: AnySupabase): Promise<SimpleOption[]> {
  const { data } = await supabase
    .from("maintenance_types")
    .select("id, code, name")
    .eq("is_active", true)
    .order("name", { ascending: true });
  return data ?? [];
}

export async function getVendors(supabase: AnySupabase): Promise<SimpleOption[]> {
  const { data } = await supabase
    .from("vendors")
    .select("id, name")
    .eq("is_active", true)
    .order("name", { ascending: true });
  return (data ?? []).map((v: { id: string; name: string }) => ({ id: v.id, code: "", name: v.name }));
}

export async function getFundingSources(supabase: AnySupabase): Promise<SimpleOption[]> {
  const { data } = await supabase
    .from("funding_sources")
    .select("id, code, name")
    .eq("is_active", true)
    .order("name", { ascending: true });
  return data ?? [];
}

export async function getBudgetAccounts(supabase: AnySupabase): Promise<SimpleOption[]> {
  const { data } = await supabase
    .from("budget_accounts")
    .select("id, code, name")
    .eq("is_active", true)
    .order("code", { ascending: true });
  return data ?? [];
}

export type FiscalYearOption = { id: string; year: number; is_active: boolean; is_locked: boolean };

export async function getFiscalYears(supabase: AnySupabase): Promise<FiscalYearOption[]> {
  const { data } = await supabase
    .from("fiscal_years")
    .select("id, year, is_active, is_locked")
    .order("year", { ascending: false });
  return data ?? [];
}

export async function getPrograms(supabase: AnySupabase): Promise<SimpleOption[]> {
  const { data } = await supabase
    .from("programs")
    .select("id, code, name")
    .eq("is_active", true)
    .order("name", { ascending: true });
  return data ?? [];
}

export type ActivityOption = SimpleOption & { program_id: string };

export async function getActivities(supabase: AnySupabase): Promise<ActivityOption[]> {
  const { data } = await supabase
    .from("activities")
    .select("id, program_id, code, name")
    .eq("is_active", true)
    .order("name", { ascending: true });
  return data ?? [];
}

export type SubactivityOption = SimpleOption & { activity_id: string };

export async function getSubactivities(supabase: AnySupabase): Promise<SubactivityOption[]> {
  const { data } = await supabase
    .from("subactivities")
    .select("id, activity_id, code, name")
    .eq("is_active", true)
    .order("name", { ascending: true });
  return data ?? [];
}
