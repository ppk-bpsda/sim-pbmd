"use client";

import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { saveMaintenanceAction, type MaintenanceActionState } from "./actions";
import { AssetPicker } from "@/components/ui/AssetPicker";
import type {
  SimpleOption,
  ActivityOption,
  SubactivityOption,
  FiscalYearOption,
} from "@/repositories/masterDataRepository";

const initialState: MaintenanceActionState = { error: null };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Menyimpan..." : label}
    </button>
  );
}

function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-status-danger"> *</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-surface-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none";

export type MaintenanceFormInitialValues = {
  id?: string;
  transaction_date?: string;
  document_number?: string | null;
  asset?: { id: string; name: string; asset_code: string; unit_id: string; unitName?: string | null };
  maintenance_type_id?: string;
  description?: string;
  vendor_id?: string | null;
  invoice_number?: string | null;
  proof_number?: string | null;
  amount?: number;
  funding_source_id?: string | null;
  program_id?: string | null;
  activity_id?: string | null;
  subactivity_id?: string | null;
  budget_account_id?: string;
  fiscal_year_id?: string;
  notes?: string | null;
};

export function MaintenanceForm({
  maintenanceTypes,
  vendors,
  fundingSources,
  programs,
  activities,
  subactivities,
  budgetAccounts,
  fiscalYears,
  initialValues,
}: {
  maintenanceTypes: SimpleOption[];
  vendors: SimpleOption[];
  fundingSources: SimpleOption[];
  programs: SimpleOption[];
  activities: ActivityOption[];
  subactivities: SubactivityOption[];
  budgetAccounts: SimpleOption[];
  fiscalYears: FiscalYearOption[];
  initialValues?: MaintenanceFormInitialValues;
}) {
  const [state, formAction] = useFormState(saveMaintenanceAction, initialState);
  const [selectedProgram, setSelectedProgram] = useState(initialValues?.program_id ?? "");
  const [selectedActivity, setSelectedActivity] = useState(initialValues?.activity_id ?? "");

  const filteredActivities = useMemo(
    () => activities.filter((a) => a.program_id === selectedProgram),
    [activities, selectedProgram]
  );
  const filteredSubactivities = useMemo(
    () => subactivities.filter((s) => s.activity_id === selectedActivity),
    [subactivities, selectedActivity]
  );

  const isEdit = Boolean(initialValues?.id);
  const activeFiscalYears = fiscalYears.filter((f) => !f.is_locked);

  return (
    <form action={formAction} className="space-y-6">
      {initialValues?.id && <input type="hidden" name="id" value={initialValues.id} />}

      {state.error && (
        <div className="rounded-md border border-status-danger/30 bg-status-dangerBg px-4 py-3 text-sm text-status-danger">
          {state.error}
        </div>
      )}

      <Field label="Aset" htmlFor="asset_search" required>
        <AssetPicker initialAsset={initialValues?.asset} />
      </Field>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Tanggal Transaksi" htmlFor="transaction_date" required>
          <input
            id="transaction_date"
            name="transaction_date"
            type="date"
            defaultValue={initialValues?.transaction_date}
            className={inputClass}
          />
        </Field>
        <Field label="Nomor Dokumen" htmlFor="document_number">
          <input
            id="document_number"
            name="document_number"
            defaultValue={initialValues?.document_number ?? ""}
            className={inputClass}
            placeholder="SPK / Nota / Surat Pesanan"
          />
        </Field>
        <Field label="Jenis Pemeliharaan" htmlFor="maintenance_type_id" required>
          <select
            id="maintenance_type_id"
            name="maintenance_type_id"
            defaultValue={initialValues?.maintenance_type_id ?? ""}
            className={inputClass}
          >
            <option value="" disabled>
              Pilih jenis pemeliharaan
            </option>
            {maintenanceTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Penyedia" htmlFor="vendor_id">
          <select id="vendor_id" name="vendor_id" defaultValue={initialValues?.vendor_id ?? ""} className={inputClass}>
            <option value="">Pilih penyedia (opsional)</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Nomor Invoice/Tagihan" htmlFor="invoice_number">
          <input
            id="invoice_number"
            name="invoice_number"
            defaultValue={initialValues?.invoice_number ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Nomor Bukti" htmlFor="proof_number">
          <input
            id="proof_number"
            name="proof_number"
            defaultValue={initialValues?.proof_number ?? ""}
            className={inputClass}
          />
        </Field>

        <Field label="Nilai Pemeliharaan (Rp)" htmlFor="amount" required>
          <input
            id="amount"
            name="amount"
            type="number"
            min="0"
            defaultValue={initialValues?.amount ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Sumber Dana" htmlFor="funding_source_id">
          <select
            id="funding_source_id"
            name="funding_source_id"
            defaultValue={initialValues?.funding_source_id ?? ""}
            className={inputClass}
          >
            <option value="">Pilih sumber dana (opsional)</option>
            {fundingSources.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Rekening Belanja" htmlFor="budget_account_id" required>
          <select
            id="budget_account_id"
            name="budget_account_id"
            defaultValue={initialValues?.budget_account_id ?? ""}
            className={inputClass}
          >
            <option value="" disabled>
              Pilih rekening belanja
            </option>
            {budgetAccounts.map((b) => (
              <option key={b.id} value={b.id}>
                {b.code} — {b.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Tahun Anggaran" htmlFor="fiscal_year_id" required>
          <select
            id="fiscal_year_id"
            name="fiscal_year_id"
            defaultValue={initialValues?.fiscal_year_id ?? ""}
            className={inputClass}
          >
            <option value="" disabled>
              Pilih tahun anggaran
            </option>
            {activeFiscalYears.map((f) => (
              <option key={f.id} value={f.id}>
                {f.year} {f.is_active ? "(berjalan)" : ""}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Program" htmlFor="program_id">
          <select
            id="program_id"
            name="program_id"
            value={selectedProgram}
            onChange={(e) => {
              setSelectedProgram(e.target.value);
              setSelectedActivity("");
            }}
            className={inputClass}
          >
            <option value="">Pilih program (opsional)</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Kegiatan" htmlFor="activity_id">
          <select
            id="activity_id"
            name="activity_id"
            value={selectedActivity}
            onChange={(e) => setSelectedActivity(e.target.value)}
            disabled={!selectedProgram}
            className={inputClass}
          >
            <option value="">{selectedProgram ? "Pilih kegiatan (opsional)" : "Pilih program dahulu"}</option>
            {filteredActivities.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Sub Kegiatan" htmlFor="subactivity_id">
          <select
            id="subactivity_id"
            name="subactivity_id"
            defaultValue={initialValues?.subactivity_id ?? ""}
            disabled={!selectedActivity}
            className={inputClass}
          >
            <option value="">{selectedActivity ? "Pilih sub kegiatan (opsional)" : "Pilih kegiatan dahulu"}</option>
            {filteredSubactivities.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
      </section>

      <Field label="Uraian Pekerjaan" htmlFor="description" required>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={initialValues?.description ?? ""}
          className={inputClass}
          placeholder="Jelaskan pekerjaan pemeliharaan yang dilakukan"
        />
      </Field>

      <Field label="Keterangan" htmlFor="notes">
        <textarea id="notes" name="notes" rows={2} defaultValue={initialValues?.notes ?? ""} className={inputClass} />
      </Field>

      <div className="flex items-center gap-3 border-t border-surface-border pt-4">
        <SubmitButton label={isEdit ? "Simpan Perubahan" : "Simpan sebagai Draf"} />
        <p className="text-xs text-slate-400">
          Transaksi disimpan sebagai <strong>Draf</strong>. Ajukan untuk verifikasi dari halaman detail.
        </p>
      </div>
    </form>
  );
}
