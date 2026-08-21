import { createClient } from "@/lib/supabase/server";
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
import { MaintenanceForm } from "../MaintenanceForm";

export default async function NewMaintenancePage() {
  const supabase = createClient();
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
        <h1 className="text-lg font-semibold text-slate-800">Catat Transaksi Pemeliharaan</h1>
        <p className="text-sm text-slate-500">
          Cari aset yang dipelihara, lalu lengkapi rincian pekerjaan dan pembiayaan.
        </p>
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
        />
      </div>
    </div>
  );
}
