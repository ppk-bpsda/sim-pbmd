// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

export type VehicleListFilters = {
  search?: string;
  categoryId?: string;
  status?: string;
  unitId?: string;
  page?: number;
  pageSize?: number;
};

export type VehicleListRow = {
  id: string;
  plate_number: string;
  chassis_number: string | null;
  engine_number: string | null;
  status: string;
  vehicle_categories: { name: string } | null;
  assets: { name: string; asset_code: string; brand: string | null; model: string | null; unit_id: string; units: { name: string } | null } | null;
};

const DEFAULT_PAGE_SIZE = 20;

/**
 * Daftar kendaraan dengan pagination & filter server-side (§40). Join ke
 * `assets` untuk nama/unit karena data umum BMD tetap sumber tunggal di
 * sana (tidak diduplikasi ke tabel vehicles).
 */
export async function listVehicles(supabase: AnySupabase, filters: VehicleListFilters) {
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : DEFAULT_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("vehicles")
    .select(
      "id, plate_number, chassis_number, engine_number, status, vehicle_categories(name), assets!inner(name, asset_code, brand, model, unit_id, units(name))",
      { count: "exact" }
    )
    .order("plate_number", { ascending: true })
    .range(from, to);

  if (filters.search && filters.search.trim() !== "") {
    const term = filters.search.trim().replace(/[%_]/g, "");
    query = query.or(
      `plate_number.ilike.%${term}%,chassis_number.ilike.%${term}%,engine_number.ilike.%${term}%`
    );
  }
  if (filters.categoryId) query = query.eq("vehicle_category_id", filters.categoryId);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.unitId) query = query.eq("assets.unit_id", filters.unitId);

  const { data, count } = await query;

  return { rows: (data as VehicleListRow[]) ?? [], total: count ?? 0, page, pageSize };
}

const DETAIL_SELECT = `
  *,
  vehicle_categories(id, name),
  assets!inner(id, name, asset_code, register_number, brand, model, acquisition_year, condition, acquisition_value, location, holder_name, notes, unit_id, units(id, name))
`;

export async function getVehicleById(supabase: AnySupabase, id: string) {
  const { data } = await supabase.from("vehicles").select(DETAIL_SELECT).eq("id", id).maybeSingle();
  return data;
}

export async function isPlateNumberDuplicate(
  supabase: AnySupabase,
  plateNumber: string,
  excludeId?: string
): Promise<boolean> {
  let query = supabase
    .from("vehicles")
    .select("id", { count: "exact", head: true })
    .eq("plate_number", plateNumber);
  if (excludeId) query = query.neq("id", excludeId);
  const { count } = await query;
  return (count ?? 0) > 0;
}

// =============================================================
// Dokumen kendaraan (STNK/Pajak/KIR/BPKB) — §9, §35
// =============================================================

export type VehicleDocumentRow = {
  id: string;
  document_type: string;
  document_number: string | null;
  issued_date: string | null;
  expiry_date: string | null;
  reminder_days_before: number;
  notes: string | null;
};

export async function getVehicleDocuments(supabase: AnySupabase, vehicleId: string): Promise<VehicleDocumentRow[]> {
  const { data } = await supabase
    .from("vehicle_documents")
    .select("id, document_type, document_number, issued_date, expiry_date, reminder_days_before, notes")
    .eq("vehicle_id", vehicleId)
    .order("expiry_date", { ascending: true, nullsFirst: false });
  return data ?? [];
}

// =============================================================
// Rekap anggaran kendaraan (view vehicle_budget_summary) — permintaan
// eksplisit: Noka/Nosin/Nopol + jumlah pemeliharaan + jumlah BBM + realisasi.
// =============================================================

export type VehicleBudgetSummaryRow = {
  vehicle_id: string;
  vehicle_name: string;
  plate_number: string;
  chassis_number: string | null;
  engine_number: string | null;
  vehicle_status: string;
  vehicle_category_name: string | null;
  unit_name: string | null;
  fiscal_year: number;
  maintenance_count: number;
  maintenance_total: number;
  fuel_count: number;
  fuel_total: number;
  total_realization: number;
  monthly_fuel_allocation: number | null;
  annual_maintenance_allocation: number | null;
  annual_total_budget: number | null;
  remaining_budget: number | null;
  realization_percentage: number | null;
};

export type VehicleBudgetSummaryFilters = {
  fiscalYearId: string;
  categoryId?: string;
  unitId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
};

export async function getVehicleBudgetSummary(supabase: AnySupabase, filters: VehicleBudgetSummaryFilters) {
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : DEFAULT_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("vehicle_budget_summary")
    .select("*", { count: "exact" })
    .eq("fiscal_year_id", filters.fiscalYearId)
    .order("plate_number", { ascending: true })
    .range(from, to);

  if (filters.categoryId) query = query.eq("vehicle_category_id", filters.categoryId);
  if (filters.unitId) query = query.eq("unit_id", filters.unitId);
  if (filters.search && filters.search.trim() !== "") {
    const term = filters.search.trim().replace(/[%_]/g, "");
    query = query.or(`plate_number.ilike.%${term}%,chassis_number.ilike.%${term}%,engine_number.ilike.%${term}%`);
  }

  const { data, count } = await query;
  return { rows: (data as VehicleBudgetSummaryRow[]) ?? [], total: count ?? 0, page, pageSize };
}

/**
 * Ringkasan satu kendaraan untuk tahun anggaran tertentu — dipakai kartu
 * traceability di halaman detail kendaraan.
 */
export async function getVehicleBudgetSummaryOne(
  supabase: AnySupabase,
  vehicleId: string,
  fiscalYearId: string
): Promise<VehicleBudgetSummaryRow | null> {
  const { data } = await supabase
    .from("vehicle_budget_summary")
    .select("*")
    .eq("vehicle_id", vehicleId)
    .eq("fiscal_year_id", fiscalYearId)
    .maybeSingle();
  return data ?? null;
}

export async function searchVehiclesForPicker(supabase: AnySupabase, query: string) {
  if (!query || query.trim().length < 2) return [];
  const term = query.trim().replace(/[%_]/g, "");
  const { data } = await supabase
    .from("vehicles")
    .select("id, plate_number, chassis_number, assets!inner(name, unit_id, units(name))")
    .or(`plate_number.ilike.%${term}%,chassis_number.ilike.%${term}%,engine_number.ilike.%${term}%`)
    .limit(15);
  return data ?? [];
}
