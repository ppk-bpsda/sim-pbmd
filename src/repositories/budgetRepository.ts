// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

export type BudgetRow = {
  id: string;
  ceiling_amount: number;
  notes: string | null;
  fiscal_years: { id: string; year: number } | null;
  budget_accounts: { id: string; code: string; name: string } | null;
  units: { id: string; name: string } | null;
};

export type BudgetListFilters = {
  fiscalYearId?: string;
  unitId?: string;
  budgetAccountId?: string;
};

/**
 * Daftar pagu + realisasi (dari budget_realizations, tabel derived §39.9)
 * digabung di sisi aplikasi (bukan SQL JOIN) karena budget_realizations
 * hanya berisi baris untuk kombinasi yang SUDAH pernah punya transaksi —
 * baris pagu tanpa realisasi tetap harus tampil dengan realisasi Rp0.
 */
export async function listBudgetsWithRealization(supabase: AnySupabase, filters: BudgetListFilters) {
  let budgetQuery = supabase
    .from("budgets")
    .select("id, ceiling_amount, notes, fiscal_years(id, year), budget_accounts(id, code, name), units(id, name)")
    .order("created_at", { ascending: false });

  if (filters.fiscalYearId) budgetQuery = budgetQuery.eq("fiscal_year_id", filters.fiscalYearId);
  if (filters.unitId) budgetQuery = budgetQuery.eq("unit_id", filters.unitId);
  if (filters.budgetAccountId) budgetQuery = budgetQuery.eq("budget_account_id", filters.budgetAccountId);

  const { data: budgets } = await budgetQuery;
  const rows = (budgets as BudgetRow[]) ?? [];

  if (rows.length === 0) return [];

  let realizationQuery = supabase
    .from("budget_realizations")
    .select("fiscal_year_id, budget_account_id, unit_id, realized_amount");

  if (filters.fiscalYearId) realizationQuery = realizationQuery.eq("fiscal_year_id", filters.fiscalYearId);
  if (filters.unitId) realizationQuery = realizationQuery.eq("unit_id", filters.unitId);
  if (filters.budgetAccountId) realizationQuery = realizationQuery.eq("budget_account_id", filters.budgetAccountId);

  const { data: realizations } = await realizationQuery;

  const realizationMap = new Map<string, number>();
  (realizations ?? []).forEach((r: { fiscal_year_id: string; budget_account_id: string; unit_id: string; realized_amount: number }) => {
    realizationMap.set(`${r.fiscal_year_id}|${r.budget_account_id}|${r.unit_id}`, Number(r.realized_amount));
  });

  return rows.map((b) => {
    const key = `${b.fiscal_years?.id}|${b.budget_accounts?.id}|${b.units?.id}`;
    const realized = realizationMap.get(key) ?? 0;
    const remaining = b.ceiling_amount - realized;
    const percentage = b.ceiling_amount > 0 ? Math.round((realized / b.ceiling_amount) * 10000) / 100 : 0;
    return { ...b, realized_amount: realized, remaining_amount: remaining, realization_percentage: percentage };
  });
}

export async function isBudgetDuplicate(
  supabase: AnySupabase,
  fiscalYearId: string,
  budgetAccountId: string,
  unitId: string,
  excludeId?: string
): Promise<boolean> {
  let query = supabase
    .from("budgets")
    .select("id", { count: "exact", head: true })
    .eq("fiscal_year_id", fiscalYearId)
    .eq("budget_account_id", budgetAccountId)
    .eq("unit_id", unitId);
  if (excludeId) query = query.neq("id", excludeId);
  const { count } = await query;
  return (count ?? 0) > 0;
}

export async function getBudgetById(supabase: AnySupabase, id: string) {
  const { data } = await supabase
    .from("budgets")
    .select("*, fiscal_years(id, year), budget_accounts(id, code, name), units(id, name)")
    .eq("id", id)
    .maybeSingle();
  return data;
}
