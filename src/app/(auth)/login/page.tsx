import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-900 px-4">
      <div className="w-full max-w-sm rounded-card bg-white p-8 shadow-card">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-brand-600 text-sm font-bold text-white">
            BM
          </div>
          <h1 className="text-lg font-semibold text-brand-900">SIM-PBMD</h1>
          <p className="mt-1 text-sm text-slate-500">
            Sistem Informasi Pemeliharaan Barang Milik Daerah
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
