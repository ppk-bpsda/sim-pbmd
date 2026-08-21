export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-900 px-4">
      <div className="w-full max-w-sm rounded-card bg-white p-8 shadow-card">
        <div className="mb-6 text-center">
          <h1 className="text-lg font-semibold text-brand-900">SIM-PBMD</h1>
          <p className="mt-1 text-sm text-slate-500">
            Sistem Informasi Pemeliharaan Barang Milik Daerah
          </p>
        </div>

        {/* NOTE: Form login fungsional (email/password via Supabase Auth,
            validasi, pesan error) diimplementasikan pada Phase 3 — Autentikasi.
            Placeholder ini hanya menandai lokasi & tampilan dasar halaman. */}
        <div className="rounded-md border border-dashed border-surface-border p-4 text-center text-sm text-slate-500">
          Formulir login akan tersedia pada Phase 3 (Autentikasi).
        </div>
      </div>
    </div>
  );
}
