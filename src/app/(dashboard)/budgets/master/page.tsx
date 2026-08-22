import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  getBudgetAccounts,
  getFiscalYears,
  getPrograms,
  getActivities,
  getSubactivities,
} from "@/repositories/masterDataRepository";
import {
  BudgetAccountForm,
  FiscalYearForm,
  FiscalYearActivateButton,
  ProgramForm,
  ActivityForm,
  SubactivityForm,
} from "./MasterForms";

export default async function BudgetMasterPage() {
  const supabase = createClient();
  const [budgetAccounts, fiscalYears, programs, activities, subactivities] = await Promise.all([
    getBudgetAccounts(supabase),
    getFiscalYears(supabase),
    getPrograms(supabase),
    getActivities(supabase),
    getSubactivities(supabase),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/budgets" className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Anggaran
        </Link>
        <h1 className="text-lg font-semibold text-slate-800">Master Anggaran</h1>
        <p className="text-sm text-slate-500">
          Rekening belanja, tahun anggaran, program, kegiatan, dan sub kegiatan dapat ditambah di sini
          tanpa mengubah kode aplikasi (§24). Hanya Admin/Super Admin yang dapat menambah data.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-card border border-surface-border bg-white p-5 shadow-card">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Tahun Anggaran</h2>
          <FiscalYearForm />
          <ul className="mt-4 divide-y divide-surface-border border-t border-surface-border">
            {fiscalYears.map((f) => (
              <li key={f.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-slate-700">{f.year}</span>
                <FiscalYearActivateButton fiscalYearId={f.id} isActive={f.is_active} />
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-card border border-surface-border bg-white p-5 shadow-card">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Rekening Belanja ({budgetAccounts.length})</h2>
          <BudgetAccountForm />
          <ul className="mt-4 max-h-56 divide-y divide-surface-border overflow-y-auto border-t border-surface-border">
            {budgetAccounts.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-slate-700">{a.name}</span>
                <span className="text-xs text-slate-400">{a.code}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-card border border-surface-border bg-white p-5 shadow-card">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Program ({programs.length})</h2>
        <ProgramForm />
        <ul className="mt-4 divide-y divide-surface-border border-t border-surface-border">
          {programs.map((p) => (
            <li key={p.id} className="flex items-center justify-between py-2 text-sm">
              <span className="text-slate-700">{p.name}</span>
              <span className="text-xs text-slate-400">{p.code}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-card border border-surface-border bg-white p-5 shadow-card">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Kegiatan ({activities.length})</h2>
        <ActivityForm programs={programs} />
        <ul className="mt-4 divide-y divide-surface-border border-t border-surface-border">
          {activities.map((a) => (
            <li key={a.id} className="flex items-center justify-between py-2 text-sm">
              <span className="text-slate-700">{a.name}</span>
              <span className="text-xs text-slate-400">{a.code}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-card border border-surface-border bg-white p-5 shadow-card">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Sub Kegiatan ({subactivities.length})</h2>
        <SubactivityForm activities={activities} />
        <ul className="mt-4 divide-y divide-surface-border border-t border-surface-border">
          {subactivities.map((s) => (
            <li key={s.id} className="flex items-center justify-between py-2 text-sm">
              <span className="text-slate-700">{s.name}</span>
              <span className="text-xs text-slate-400">{s.code}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
