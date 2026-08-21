import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Boxes,
  Wrench,
  Car,
  Fuel,
  Wallet,
  FileBarChart,
  Upload,
  Users,
  ShieldCheck,
} from "lucide-react";

export type ModuleNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Role yang tidak boleh melihat menu ini akan disaring di sini (selain RLS di DB) */
  hiddenForRoles?: string[];
};

export const MODULE_NAV: ModuleNavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Master BMD", href: "/assets", icon: Boxes },
  { label: "Pemeliharaan", href: "/maintenance", icon: Wrench },
  { label: "Kendaraan", href: "/vehicles", icon: Car },
  { label: "BBM", href: "/fuel", icon: Fuel },
  { label: "Anggaran", href: "/budgets", icon: Wallet },
  { label: "Laporan", href: "/reports", icon: FileBarChart },
  { label: "Import Data", href: "/imports", icon: Upload },
  { label: "Pengguna", href: "/users", icon: Users, hiddenForRoles: ["OPERATOR", "PIMPINAN", "AUDITOR"] },
  { label: "Audit Trail", href: "/audit", icon: ShieldCheck, hiddenForRoles: ["OPERATOR"] },
];
