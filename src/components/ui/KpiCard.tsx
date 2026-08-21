import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type KpiCardProps = {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "default" | "success" | "warning" | "danger";
};

const toneClasses: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  default: "bg-brand-100 text-brand-700",
  success: "bg-status-successBg text-status-success",
  warning: "bg-status-warningBg text-status-warning",
  danger: "bg-status-dangerBg text-status-danger",
};

export function KpiCard({ label, value, icon: Icon, tone = "default" }: KpiCardProps) {
  return (
    <div className="rounded-card border border-surface-border bg-white p-4 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-md", toneClasses[tone])}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-semibold text-slate-800">{value}</p>
    </div>
  );
}
