import { createClient } from "@/lib/supabase/server";
import { getFiscalYears, getUnits, getBudgetAccounts } from "@/repositories/masterDataRepository";
import { BudgetForm } from "../BudgetForm";

export default async function NewBudgetPage() {
  const supabase = createClient();
  const [fiscalYears, units, budgetAccounts] = await Promise.all([
    getFiscalYears(supabase),
    getUnits(supabase),
    getBudgetAccounts(supabase),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-800">Tambah Pagu Anggaran</h1>
        <p className="text-sm text-slate-500">Tetapkan pagu untuk satu kombinasi tahun anggaran, rekening, dan unit kerja.</p>
      </div>

      <div className="rounded-card border border-surface-border bg-white p-6 shadow-card">
        <BudgetForm fiscalYears={fiscalYears} units={units} budgetAccounts={budgetAccounts} />
      </div>
    </div>
  );
}
