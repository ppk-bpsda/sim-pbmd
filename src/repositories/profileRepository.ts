export type CurrentUser = {
  id: string;
  fullName: string;
  unitId: string | null;
  unitName: string | null;
  roles: string[]; // kode role, mis. ['ADMIN']
};

/**
 * Mengambil profil + daftar role pengguna yang sedang login.
 * Mengandalkan RLS (policy profiles_select_self_or_admin, user_roles_select)
 * sehingga query ini otomatis aman dibatasi ke baris milik pemanggil.
 *
 * Catatan tipe: parameter sengaja `any` (lihat lib/supabase/server.ts) karena
 * client Supabase belum di-generic-kan dengan tipe Database asli. Ganti jadi
 * SupabaseClient<Database> setelah `npm run db:types` dijalankan.
 */
export async function getCurrentUser(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
): Promise<CurrentUser | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, unit_id, units:unit_id (name)")
    .eq("id", user.id)
    .maybeSingle();

  const { data: roleRows } = await supabase
    .from("user_roles")
    .select("roles:role_id (code)")
    .eq("user_id", user.id);

  const roles = (roleRows ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((r: any) => r.roles?.code)
    .filter((code: string | undefined): code is string => Boolean(code));

  return {
    id: user.id,
    fullName: profile?.full_name ?? user.email ?? "Pengguna",
    unitId: profile?.unit_id ?? null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    unitName: (profile as any)?.units?.name ?? null,
    roles,
  };
}
