import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getMaintenanceTransactionById, getStatusHistory } from "@/repositories/maintenanceRepository";
import { getCurrentUser } from "@/repositories/profileRepository";
import { StatusActions } from "./StatusActions";
import { STATUS_BADGE_CLASS, STATUS_LABELS, type TransactionStatus } from "@/constants/maintenance";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-surface-border py-2.5 text-sm last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-700">{value ?? "-"}</span>
    </div>
  );
}

export default async function MaintenanceDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [transaction, currentUser] = await Promise.all([
    getMaintenanceTransactionById(supabase, params.id),
    getCurrentUser(supabase),
  ]);

  if (!transaction) {
    notFound();
  }

  const history = await getStatusHistory(supabase, transaction.id);
  const status = transaction.status as TransactionStatus;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs text-slate-400">{transaction.transaction_number}</p>
          <h1 className="text-lg font-semibold text-slate-800">{transaction.assets?.name ?? "-"}</h1>
          <span className={cn("mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-medium", STATUS_BADGE_CLASS[status])}>
            {STATUS_LABELS[status]}
          </span>
        </div>
        {status === "DRAFT" && (
          <Link
            href={`/maintenance/${transaction.id}/edit`}
            className="flex items-center gap-2 rounded-md border border-surface-border px-4 py-2 text-sm text-slate-600 hover:bg-surface-muted"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        )}
      </div>

      {transaction.rejection_reason && (
        <div className="rounded-md border border-status-danger/30 bg-status-dangerBg px-4 py-3 text-sm text-status-danger">
          <span className="font-medium">Alasan penolakan:</span> {transaction.rejection_reason}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-card border border-surface-border bg-white p-5 shadow-card">
            <h2 className="mb-2 text-sm font-semibold text-slate-700">Informasi Transaksi</h2>
            <DetailRow
              label="Aset"
              value={
                <Link href={`/assets/${transaction.assets?.id}`} className="text-brand-700 hover:underline">
                  {transaction.assets?.name} ({transaction.assets?.asset_code})
                </Link>
              }
            />
            <DetailRow label="Tanggal Transaksi" value={formatDate(transaction.transaction_date)} />
            <DetailRow label="Nomor Dokumen" value={transaction.document_number} />
            <DetailRow label="Jenis Pemeliharaan" value={transaction.maintenance_types?.name} />
            <DetailRow label="Uraian Pekerjaan" value={transaction.description} />
            <DetailRow label="Penyedia" value={transaction.vendors?.name} />
            <DetailRow label="Nomor Invoice/Tagihan" value={transaction.invoice_number} />
            <DetailRow label="Nomor Bukti" value={transaction.proof_number} />
            <DetailRow label="Nilai Pemeliharaan" value={formatCurrency(transaction.amount)} />
            <DetailRow label="Sumber Dana" value={transaction.funding_sources?.name} />
            <DetailRow
              label="Rekening Belanja"
              value={
                transaction.budget_accounts
                  ? `${transaction.budget_accounts.code} — ${transaction.budget_accounts.name}`
                  : "-"
              }
            />
            <DetailRow label="Program" value={transaction.programs?.name} />
            <DetailRow label="Kegiatan" value={transaction.activities?.name} />
            <DetailRow label="Sub Kegiatan" value={transaction.subactivities?.name} />
            <DetailRow label="Tahun Anggaran" value={transaction.fiscal_years?.year} />
            <DetailRow label="Unit Kerja" value={transaction.units?.name} />
            <DetailRow label="Keterangan" value={transaction.notes} />
          </div>

          <div className="rounded-card border border-surface-border bg-white p-5 shadow-card">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Riwayat Status (Audit Trail)</h2>
            <ol className="space-y-3">
              {history.map((h) => (
                <li key={h.id} className="flex items-start gap-3 text-sm">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-600" />
                  <div>
                    <p className="text-slate-700">
                      {h.from_status ? (
                        <>
                          {STATUS_LABELS[h.from_status as TransactionStatus]} →{" "}
                          {STATUS_LABELS[h.to_status as TransactionStatus]}
                        </>
                      ) : (
                        <>Dibuat sebagai {STATUS_LABELS[h.to_status as TransactionStatus]}</>
                      )}
                    </p>
                    <p className="text-xs text-slate-400">
                      {h.profiles?.full_name ?? "Sistem"} — {formatDate(h.changed_at)}
                    </p>
                    {h.reason && <p className="mt-0.5 text-xs text-status-danger">Alasan: {h.reason}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="space-y-4">
          {currentUser && (
            <StatusActions transactionId={transaction.id} currentStatus={status} userRoles={currentUser.roles} />
          )}
        </div>
      </div>
    </div>
  );
}
