import { Bell, Search } from "lucide-react";
import { UserMenu } from "@/components/layout/UserMenu";
import type { CurrentUser } from "@/repositories/profileRepository";

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  OPERATOR: "Operator",
  VERIFIKATOR: "Verifikator",
  PIMPINAN: "Pimpinan",
  AUDITOR: "Auditor",
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "U";
}

export function Topbar({ user }: { user: CurrentUser }) {
  const roleLabel = user.roles.length
    ? user.roles.map((r) => ROLE_LABELS[r] ?? r).join(", ")
    : "Belum ada role";
  const roleWithUnit = user.unitName ? `${roleLabel} — ${user.unitName}` : roleLabel;

  return (
    <header className="flex h-16 items-center justify-between border-b border-surface-border bg-white px-4 md:px-6">
      <div className="flex flex-1 items-center gap-3">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Cari aset, kendaraan, transaksi..."
            className="w-full rounded-md border border-surface-border bg-surface-muted py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          aria-label="Notifikasi"
          className="relative rounded-full p-2 text-slate-500 hover:bg-surface-muted"
        >
          <Bell className="h-5 w-5" />
        </button>
        <UserMenu fullName={user.fullName} roleLabel={roleWithUnit} initials={getInitials(user.fullName)} />
      </div>
    </header>
  );
}
