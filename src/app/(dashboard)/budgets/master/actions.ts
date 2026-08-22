"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  budgetAccountSchema,
  fiscalYearSchema,
  programSchema,
  activitySchema,
  subactivitySchema,
} from "@/validations/budget";

export type MasterActionState = { error: string | null };

function duplicateOrGenericError(
  error: { code?: string; message?: string } | null,
  label: string
): MasterActionState {
  if (!error) return { error: null };

  // Log detail teknis ke server (terlihat di log Vercel/terminal `next dev`),
  // TIDAK ditampilkan ke pengguna (§39) — tapi memudahkan diagnosa saat
  // menghubungkan ke database baru.
  console.error(`[master-data:${label}]`, error.code, error.message);

  if (error.code === "23505") {
    return { error: `Kode ${label} tersebut sudah digunakan.` };
  }
  if (error.code === "42501") {
    return {
      error: `Akun Anda belum memiliki role Admin/Super Admin di database ini, sehingga tidak diizinkan menambah ${label}. Periksa tabel user_roles untuk akun Anda.`,
    };
  }
  return {
    error: `Data ${label} tidak dapat disimpan karena kesalahan teknis. Detail teknisnya sudah dicatat di log server — silakan periksa log atau hubungi developer.`,
  };
}

export async function createBudgetAccountAction(
  _prevState: MasterActionState,
  formData: FormData
): Promise<MasterActionState> {
  const parsed = budgetAccountSchema.safeParse({ code: formData.get("code"), name: formData.get("name") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };

  const supabase = createClient();
  const { error } = await supabase.from("budget_accounts").insert(parsed.data);
  if (error) return duplicateOrGenericError(error, "rekening");

  revalidatePath("/budgets/master");
  revalidatePath("/budgets");
  return { error: null };
}

export async function createFiscalYearAction(
  _prevState: MasterActionState,
  formData: FormData
): Promise<MasterActionState> {
  const parsed = fiscalYearSchema.safeParse({ year: formData.get("year") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };

  const supabase = createClient();
  const { error } = await supabase.from("fiscal_years").insert({ year: parsed.data.year });
  if (error) return duplicateOrGenericError(error, "tahun anggaran");

  revalidatePath("/budgets/master");
  revalidatePath("/budgets");
  return { error: null };
}

export async function setActiveFiscalYearAction(fiscalYearId: string): Promise<void> {
  const supabase = createClient();
  // Hanya SATU tahun anggaran yang boleh aktif — nonaktifkan semua dahulu.
  await supabase.from("fiscal_years").update({ is_active: false }).neq("id", fiscalYearId);
  await supabase.from("fiscal_years").update({ is_active: true }).eq("id", fiscalYearId);
  revalidatePath("/budgets/master");
  revalidatePath("/budgets");
  revalidatePath("/vehicles/rekap");
}

export async function createProgramAction(
  _prevState: MasterActionState,
  formData: FormData
): Promise<MasterActionState> {
  const parsed = programSchema.safeParse({ code: formData.get("code"), name: formData.get("name") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };

  const supabase = createClient();
  const { error } = await supabase.from("programs").insert(parsed.data);
  if (error) return duplicateOrGenericError(error, "program");

  revalidatePath("/budgets/master");
  return { error: null };
}

export async function createActivityAction(
  _prevState: MasterActionState,
  formData: FormData
): Promise<MasterActionState> {
  const parsed = activitySchema.safeParse({
    program_id: formData.get("program_id"),
    code: formData.get("code"),
    name: formData.get("name"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };

  const supabase = createClient();
  const { error } = await supabase.from("activities").insert(parsed.data);
  if (error) return duplicateOrGenericError(error, "kegiatan");

  revalidatePath("/budgets/master");
  return { error: null };
}

export async function createSubactivityAction(
  _prevState: MasterActionState,
  formData: FormData
): Promise<MasterActionState> {
  const parsed = subactivitySchema.safeParse({
    activity_id: formData.get("activity_id"),
    code: formData.get("code"),
    name: formData.get("name"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };

  const supabase = createClient();
  const { error } = await supabase.from("subactivities").insert(parsed.data);
  if (error) return duplicateOrGenericError(error, "sub kegiatan");

  revalidatePath("/budgets/master");
  return { error: null };
}
