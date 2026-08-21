"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { profileUpdateSchema } from "@/validations/auth";

export type ProfileActionState = {
  error: string | null;
  success: boolean;
};

export async function updateProfileAction(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const raw = {
    full_name: formData.get("full_name"),
    phone: formData.get("phone"),
  };

  const parsed = profileUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid.", success: false };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sesi tidak valid. Silakan login kembali.", success: false };
  }

  // RLS (profiles_update_self_limited) memastikan hanya baris milik user sendiri
  // yang bisa diubah — filter .eq('id', user.id) di sini bersifat eksplisit/defensif,
  // bukan satu-satunya lapisan keamanan.
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      phone: parsed.data.phone || null,
    })
    .eq("id", user.id);

  if (error) {
    return { error: "Data tidak dapat disimpan. Silakan periksa kembali data yang diinput.", success: false };
  }

  revalidatePath("/profile");
  return { error: null, success: true };
}
