import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBudgetById } from "@/repositories/budgetRepository";
import { getFiscalYears, getUnits, getBudgetAccounts } from "@/repositories/masterDataRepository";
import { BudgetForm } from "../../BudgetForm";

export default async function EditBudgetPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [budget, fiscalYears, units, budgetAccounts] = await Promise.all([
    getBudgetById(supabase, params.id),
    getFiscalYears(supabase),
    getUnits(supabase),
    getBudgetAccounts(supabase),
  ]);

  if (!budget) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-800">
          Edit Pagu — {budget.budget_accounts?.code} ({budget.fiscal_years?.year})
        </h1>
      </div>

      <div className="rounded-card border border-surface-border bg-white p-6 shadow-card">
        <BudgetForm
          fiscalYears={fiscalYears}
          units={units}
          budgetAccounts={budgetAccounts}
          initialValues={{
            id: budget.id,
            fiscal_year_id: budget.fiscal_year_id,
            budget_account_id: budget.budget_account_id,
            unit_id: budget.unit_id,
            ceiling_amount: budget.ceiling_amount,
            notes: budget.notes,
          }}
        />
      </div>
    </div>
  );
}
