"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/repositories/profileRepository";
import { maintenanceTransactionSchema, rejectReasonSchema } from "@/validations/maintenance";
import { STATUS_TRANSITIONS, type TransactionStatus } from "@/constants/maintenance";

export type MaintenanceActionState = {
  error: string | null;
};

/**
 * Simpan transaksi (create baru berstatus DRAFT, atau update transaksi yang
 * MASIH DRAFT). Transaksi yang sudah SUBMITTED ke atas tidak lagi diedit
 * lewat form ini — hanya lewat aksi status workflow (changeStatusAction).
 */
export async function saveMaintenanceAction(
  _prevState: MaintenanceActionState,
  formData: FormData
): Promise<MaintenanceActionState> {
  const id = formData.get("id")?.toString() || undefined;

  const raw = {
    transaction_date: formData.get("transaction_date"),
    document_number: formData.get("document_number"),
    asset_id: formData.get("asset_id"),
    maintenance_type_id: formData.get("maintenance_type_id"),
    description: formData.get("description"),
    vendor_id: formData.get("vendor_id"),
    invoice_number: formData.get("invoice_number"),
    proof_number: formData.get("proof_number"),
    amount: formData.get("amount"),
    funding_source_id: formData.get("funding_source_id"),
    program_id: formData.get("program_id"),
    activity_id: formData.get("activity_id"),
    subactivity_id: formData.get("subactivity_id"),
    budget_account_id: formData.get("budget_account_id"),
    fiscal_year_id: formData.get("fiscal_year_id"),
    unit_id: formData.get("unit_id"),
    notes: formData.get("notes"),
  };

  const parsed = maintenanceTransactionSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const supabase = createClient();

  const payload = {
    transaction_date: parsed.data.transaction_date,
    document_number: parsed.data.document_number || null,
    asset_id: parsed.data.asset_id,
    maintenance_type_id: parsed.data.maintenance_type_id,
    description: parsed.data.description,
    vendor_id: parsed.data.vendor_id,
    invoice_number: parsed.data.invoice_number || null,
    proof_number: parsed.data.proof_number || null,
    amount: parsed.data.amount,
    funding_source_id: parsed.data.funding_source_id,
    program_id: parsed.data.program_id,
    activity_id: parsed.data.activity_id,
    subactivity_id: parsed.data.subactivity_id,
    budget_account_id: parsed.data.budget_account_id,
    fiscal_year_id: parsed.data.fiscal_year_id,
    unit_id: parsed.data.unit_id,
    notes: parsed.data.notes || null,
  };

  let transactionId = id;

  if (id) {
    const { error } = await supabase
      .from("maintenance_transactions")
      .update(payload)
      .eq("id", id)
      .eq("status", "DRAFT"); // jaga-jaga di level query — RLS juga sudah menegakkan ini
    if (error) {
      return { error: "Data tidak dapat disimpan. Silakan periksa kembali data yang diinput." };
    }
  } else {
    const { data, error } = await supabase
      .from("maintenance_transactions")
      .insert({ ...payload, status: "DRAFT" })
      .select("id")
      .single();
    if (error || !data) {
      return { error: "Data tidak dapat disimpan. Silakan periksa kembali data yang diinput." };
    }
    transactionId = data.id;
  }

  revalidatePath("/maintenance");
  if (transactionId) revalidatePath(`/maintenance/${transactionId}`);
  redirect(`/maintenance/${transactionId}`);
}

export type ChangeStatusState = {
  error: string | null;
};

/**
 * Mengubah status transaksi sesuai peta STATUS_TRANSITIONS (§23). Role
 * diverifikasi di sini SEBELUM query dikirim agar pesan error ramah
 * pengguna — RLS (0009) tetap menjadi penegak akhir bila terjadi
 * percobaan bypass di luar UI aplikasi ini.
 */
export async function changeStatusAction(
  transactionId: string,
  currentStatus: TransactionStatus,
  targetStatus: TransactionStatus,
  reason?: string
): Promise<ChangeStatusState> {
  const allowedTransitions = STATUS_TRANSITIONS[currentStatus] ?? [];
  const transition = allowedTransitions.find((t) => t.to === targetStatus);

  if (!transition) {
    return { error: "Perubahan status tidak valid untuk kondisi transaksi saat ini." };
  }

  if (transition.requiresReason) {
    const parsedReason = rejectReasonSchema.safeParse({ reason });
    if (!parsedReason.success) {
      return { error: parsedReason.error.issues[0]?.message ?? "Alasan wajib diisi." };
    }
  }

  const supabase = createClient();
  const currentUser = await getCurrentUser(supabase);

  if (!currentUser || !transition.allowedRoles.some((r) => currentUser.roles.includes(r))) {
    return { error: "Anda tidak memiliki hak untuk melakukan aksi ini." };
  }

  const updatePayload: Record<string, unknown> = { status: targetStatus };
  if (transition.requiresReason) {
    updatePayload.rejection_reason = reason;
  }

  const { error } = await supabase
    .from("maintenance_transactions")
    .update(updatePayload)
    .eq("id", transactionId);

  if (error) {
    return { error: "Perubahan status gagal disimpan. Silakan periksa kembali dan coba lagi." };
  }

  revalidatePath(`/maintenance/${transactionId}`);
  revalidatePath("/maintenance");
  return { error: null };
}
