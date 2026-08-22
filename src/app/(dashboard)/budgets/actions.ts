"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { budgetSchema } from "@/validations/budget";
import { isBudgetDuplicate } from "@/repositories/budgetRepository";

export type BudgetActionState = { error: string | null };

export async function saveBudgetAction(
  _prevState: BudgetActionState,
  formData: FormData
): Promise<BudgetActionState> {
  const id = formData.get("id")?.toString() || undefined;

  const parsed = budgetSchema.safeParse({
    fiscal_year_id: formData.get("fiscal_year_id"),
    budget_account_id: formData.get("budget_account_id"),
    unit_id: formData.get("unit_id"),
    ceiling_amount: formData.get("ceiling_amount"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }
  const d = parsed.data;

  const supabase = createClient();

  const duplicate = await isBudgetDuplicate(supabase, d.fiscal_year_id, d.budget_account_id, d.unit_id, id);
  if (duplicate) {
    return {
      error: "Pagu untuk kombinasi Tahun Anggaran + Rekening + Unit Kerja ini sudah ada. Silakan edit data yang sudah ada.",
    };
  }

  const payload = {
    fiscal_year_id: d.fiscal_year_id,
    budget_account_id: d.budget_account_id,
    unit_id: d.unit_id,
    ceiling_amount: d.ceiling_amount,
    notes: d.notes || null,
  };

  if (id) {
    const { error } = await supabase.from("budgets").update(payload).eq("id", id);
    if (error) {
      return { error: "Data tidak dapat disimpan. Pastikan Anda memiliki hak akses (Admin)." };
    }
  } else {
    const { error } = await supabase.from("budgets").insert(payload);
    if (error) {
      return { error: "Data tidak dapat disimpan. Pastikan Anda memiliki hak akses (Admin)." };
    }
  }

  revalidatePath("/budgets");
  redirect("/budgets");
}
