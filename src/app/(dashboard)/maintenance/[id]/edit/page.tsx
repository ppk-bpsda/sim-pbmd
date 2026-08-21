import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMaintenanceTransactionById } from "@/repositories/maintenanceRepository";
import {
  getMaintenanceTypes,
  getVendors,
  getFundingSources,
  getPrograms,
  getActivities,
  getSubactivities,
  getBudgetAccounts,
  getFiscalYears,
} from "@/repositories/masterDataRepository";
import { MaintenanceForm } from "../../MaintenanceForm";

export default async function EditMaintenancePage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const transaction = await getMaintenanceTransactionById(supabase, params.id);

  if (!transaction) {
    notFound();
  }
  if (transaction.status !== "DRAFT") {
    redirect(`/maintenance/${params.id}`);
  }

  const [maintenanceTypes, vendors, fundingSources, programs, activities, subactivities, budgetAccounts, fiscalYears] =
    await Promise.all([
      getMaintenanceTypes(supabase),
      getVendors(supabase),
      getFundingSources(supabase),
      getPrograms(supabase),
      getActivities(supabase),
      getSubactivities(supabase),
      getBudgetAccounts(supabase),
      getFiscalYears(supabase),
    ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-800">Edit Transaksi — {transaction.transaction_number}</h1>
        <p className="text-sm text-slate-500">Hanya dapat diedit selama status masih Draf.</p>
      </div>

      <div className="rounded-card border border-surface-border bg-white p-6 shadow-card">
        <MaintenanceForm
          maintenanceTypes={maintenanceTypes}
          vendors={vendors}
          fundingSources={fundingSources}
          programs={programs}
          activities={activities}
          subactivities={subactivities}
          budgetAccounts={budgetAccounts}
          fiscalYears={fiscalYears}
          initialValues={{
            id: transaction.id,
            transaction_date: transaction.transaction_date,
            document_number: transaction.document_number,
            asset: transaction.assets
              ? {
                  id: transaction.assets.id,
                  name: transaction.assets.name,
                  asset_code: transaction.assets.asset_code,
                  unit_id: transaction.assets.unit_id,
                  unitName: transaction.units?.name,
                }
              : undefined,
            maintenance_type_id: transaction.maintenance_type_id,
            description: transaction.description,
            vendor_id: transaction.vendor_id,
            invoice_number: transaction.invoice_number,
            proof_number: transaction.proof_number,
            amount: transaction.amount,
            funding_source_id: transaction.funding_source_id,
            program_id: transaction.program_id,
            activity_id: transaction.activity_id,
            subactivity_id: transaction.subactivity_id,
            budget_account_id: transaction.budget_account_id,
            fiscal_year_id: transaction.fiscal_year_id,
            notes: transaction.notes,
          }}
        />
      </div>
    </div>
  );
}
