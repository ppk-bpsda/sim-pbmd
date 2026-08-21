"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MODULE_NAV } from "@/constants/modules";
import { cn } from "@/lib/utils";

export function Sidebar({ roles = [] }: { roles?: string[] }) {
  const pathname = usePathname();
  const visibleNav = MODULE_NAV.filter(
    (item) => !item.hiddenForRoles?.some((r) => roles.includes(r))
  );

  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-brand-900 text-white md:flex">
      <div className="flex h-16 items-center gap-2 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-600 text-sm font-bold">
          BM
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold">SIM-PBMD</p>
          <p className="text-[11px] text-white/60">Pemeliharaan BMD</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {visibleNav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-brand-600 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-4 py-3 text-[11px] text-white/40">
        Versi 0.1.0 — Development
      </div>
    </aside>
  );
}
