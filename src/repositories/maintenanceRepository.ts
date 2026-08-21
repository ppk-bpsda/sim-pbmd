// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

export type MaintenanceListFilters = {
  search?: string;
  status?: string;
  unitId?: string;
  fiscalYearId?: string;
  maintenanceTypeId?: string;
  page?: number;
  pageSize?: number;
};

const DEFAULT_PAGE_SIZE = 20;

const LIST_SELECT =
  "id, transaction_number, transaction_date, description, amount, status, " +
  "assets(id, name, asset_code), maintenance_types(name), units(name), fiscal_years(year)";

export type MaintenanceListRow = {
  id: string;
  transaction_number: string;
  transaction_date: string;
  description: string;
  amount: number;
  status: string;
  assets: { id: string; name: string; asset_code: string } | null;
  maintenance_types: { name: string } | null;
  units: { name: string } | null;
  fiscal_years: { year: number } | null;
};

export type MaintenanceListResult = {
  rows: MaintenanceListRow[];
  total: number;
  page: number;
  pageSize: number;
};

export async function listMaintenanceTransactions(
  supabase: AnySupabase,
  filters: MaintenanceListFilters
): Promise<MaintenanceListResult> {
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : DEFAULT_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("maintenance_transactions")
    .select(LIST_SELECT, { count: "exact" })
    .is("deleted_at", null)
    .order("transaction_date", { ascending: false })
    .range(from, to);

  if (filters.search && filters.search.trim() !== "") {
    const term = filters.search.trim().replace(/[%_]/g, "");
    query = query.or(
      `transaction_number.ilike.%${term}%,proof_number.ilike.%${term}%,description.ilike.%${term}%`
    );
  }
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.unitId) query = query.eq("unit_id", filters.unitId);
  if (filters.fiscalYearId) query = query.eq("fiscal_year_id", filters.fiscalYearId);
  if (filters.maintenanceTypeId) query = query.eq("maintenance_type_id", filters.maintenanceTypeId);

  const { data, count } = await query;

  return { rows: data ?? [], total: count ?? 0, page, pageSize };
}

const DETAIL_SELECT = `
  *,
  assets(id, name, asset_code, register_number, unit_id),
  maintenance_types(id, name),
  vendors(id, name),
  funding_sources(id, name),
  programs(id, name),
  activities(id, name),
  subactivities(id, name),
  budget_accounts(id, code, name),
  fiscal_years(id, year),
  units(id, name)
`;

export async function getMaintenanceTransactionById(supabase: AnySupabase, id: string) {
  const { data } = await supabase
    .from("maintenance_transactions")
    .select(DETAIL_SELECT)
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  return data;
}

export type StatusHistoryRow = {
  id: string;
  from_status: string | null;
  to_status: string;
  reason: string | null;
  changed_at: string;
  profiles: { full_name: string } | null;
};

export async function getStatusHistory(supabase: AnySupabase, transactionId: string): Promise<StatusHistoryRow[]> {
  const { data } = await supabase
    .from("status_history")
    .select("id, from_status, to_status, reason, changed_at, profiles:changed_by(full_name)")
    .eq("transaction_id", transactionId)
    .order("changed_at", { ascending: true });
  return data ?? [];
}

// =============================================================
// TRACEABILITY (§54-55) — dipakai halaman detail aset (Phase 4)
// =============================================================

/**
 * Total biaya pemeliharaan sebuah aset, dihitung HANYA dari transaksi
 * berstatus APPROVED/POSTED (§6, §11) — bukan seluruh transaksi termasuk
 * yang masih draft, agar konsisten dengan definisi "realisasi" di modul
 * anggaran.
 */
export async function getTotalMaintenanceCostForAsset(
  supabase: AnySupabase,
  assetId: string
): Promise<number> {
  const { data } = await supabase
    .from("maintenance_transactions")
    .select("amount")
    .eq("asset_id", assetId)
    .in("status", ["APPROVED", "POSTED"])
    .is("deleted_at", null);

  return (data ?? []).reduce((sum: number, row: { amount: number }) => sum + Number(row.amount), 0);
}

export type AssetMaintenanceHistoryRow = {
  id: string;
  transaction_number: string;
  transaction_date: string;
  description: string;
  amount: number;
  status: string;
  maintenance_types: { name: string } | null;
};

export async function getMaintenanceHistoryForAsset(
  supabase: AnySupabase,
  assetId: string,
  limit = 10
): Promise<AssetMaintenanceHistoryRow[]> {
  const { data } = await supabase
    .from("maintenance_transactions")
    .select("id, transaction_number, transaction_date, description, amount, status, maintenance_types(name)")
    .eq("asset_id", assetId)
    .is("deleted_at", null)
    .order("transaction_date", { ascending: false })
    .limit(limit);

  return data ?? [];
}

/**
 * Pencarian aset ringan untuk komponen AssetPicker (type-ahead) di form
 * transaksi. Dibatasi `limit` agar tidak menarik seluruh tabel ke browser
 * (§40) — cocok untuk skala puluhan ribu aset (§41).
 */
export async function searchAssetsForPicker(supabase: AnySupabase, query: string) {
  if (!query || query.trim().length < 2) return [];
  const term = query.trim().replace(/[%_]/g, "");
  const { data } = await supabase
    .from("assets")
    .select("id, asset_code, register_number, name, unit_id, units(name)")
    .is("deleted_at", null)
    .or(`name.ilike.%${term}%,asset_code.ilike.%${term}%,register_number.ilike.%${term}%`)
    .limit(15);
  return data ?? [];
}
