"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/validations/auth";

export type LoginActionState = {
  error: string | null;
};

/**
 * Server Action untuk login. Dipanggil dari <form action={loginAction}>.
 * Validasi input dulu (server-side, tidak bisa dilewati dari client),
 * baru panggil Supabase Auth. Pesan error selalu digeneralisasi agar
 * tidak membocorkan informasi teknis (§39/§20).
 */
export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    // Jangan bocorkan detail teknis Supabase (mis. status code) ke pengguna.
    return { error: "Email atau kata sandi salah. Silakan periksa kembali." };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

/**
 * Server Action untuk logout. Menghapus session lalu mengarahkan ke /login.
 */
export async function logoutAction(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
