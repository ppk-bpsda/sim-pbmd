// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

export type FuelListFilters = {
  vehicleId?: string;
  unitId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
};

export type FuelListRow = {
  id: string;
  transaction_date: string;
  fuel_type: string;
  volume_liters: number;
  price_per_liter: number;
  total_cost: number;
  odometer_km: number | null;
  provider_name: string | null;
  vehicles: { plate_number: string; assets: { name: string } | null } | null;
  units: { name: string } | null;
};

const DEFAULT_PAGE_SIZE = 20;

export async function listFuelTransactions(supabase: AnySupabase, filters: FuelListFilters) {
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : DEFAULT_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("fuel_transactions")
    .select(
      "id, transaction_date, fuel_type, volume_liters, price_per_liter, total_cost, odometer_km, provider_name, vehicles(plate_number, assets(name)), units(name)",
      { count: "exact" }
    )
    .is("deleted_at", null)
    .order("transaction_date", { ascending: false })
    .range(from, to);

  if (filters.vehicleId) query = query.eq("vehicle_id", filters.vehicleId);
  if (filters.unitId) query = query.eq("unit_id", filters.unitId);
  if (filters.dateFrom) query = query.gte("transaction_date", filters.dateFrom);
  if (filters.dateTo) query = query.lte("transaction_date", filters.dateTo);

  const { data, count } = await query;
  return { rows: (data as FuelListRow[]) ?? [], total: count ?? 0, page, pageSize };
}

export async function getFuelTransactionById(supabase: AnySupabase, id: string) {
  const { data } = await supabase
    .from("fuel_transactions")
    .select("*, vehicles(id, plate_number, assets(id, name, unit_id, units(name)))")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  return data;
}

/**
 * Riwayat BBM ringkas untuk halaman detail kendaraan (traceability).
 */
export async function getFuelHistoryForVehicle(supabase: AnySupabase, vehicleId: string, limit = 10) {
  const { data } = await supabase
    .from("fuel_transactions")
    .select("id, transaction_date, fuel_type, volume_liters, price_per_liter, total_cost, odometer_km, provider_name")
    .eq("vehicle_id", vehicleId)
    .is("deleted_at", null)
    .order("transaction_date", { ascending: false })
    .limit(limit);
  return data ?? [];
}
