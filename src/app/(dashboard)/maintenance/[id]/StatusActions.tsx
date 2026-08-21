"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { changeStatusAction } from "../actions";
import { STATUS_TRANSITIONS, type TransactionStatus, type StatusTransition } from "@/constants/maintenance";
import { cn } from "@/lib/utils";

const VARIANT_CLASS: Record<StatusTransition["variant"], string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700",
  danger: "border border-status-danger/40 text-status-danger hover:bg-status-dangerBg",
  neutral: "border border-surface-border text-slate-600 hover:bg-surface-muted",
};

export function StatusActions({
  transactionId,
  currentStatus,
  userRoles,
}: {
  transactionId: string;
  currentStatus: TransactionStatus;
  userRoles: string[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [activeReasonFor, setActiveReasonFor] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const availableTransitions = (STATUS_TRANSITIONS[currentStatus] ?? []).filter((t) =>
    t.allowedRoles.some((r) => userRoles.includes(r))
  );

  if (availableTransitions.length === 0) return null;

  function runTransition(transition: StatusTransition) {
    setError(null);
    startTransition(async () => {
      const result = await changeStatusAction(
        transactionId,
        currentStatus,
        transition.to,
        transition.requiresReason ? reason : undefined
      );
      if (result.error) {
        setError(result.error);
      } else {
        setActiveReasonFor(null);
        setReason("");
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-3 rounded-card border border-surface-border bg-white p-5 shadow-card">
      <h2 className="text-sm font-semibold text-slate-700">Aksi Workflow</h2>

      {error && (
        <div className="rounded-md border border-status-danger/30 bg-status-dangerBg px-3 py-2 text-sm text-status-danger">
          {error}
        </div>
      )}

      {activeReasonFor && (
        <div className="space-y-2 rounded-md border border-surface-border bg-surface-muted p-3">
          <label className="block text-sm font-medium text-slate-700">Alasan Penolakan</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-surface-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            placeholder="Jelaskan alasan penolakan..."
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {availableTransitions.map((transition) => (
          <button
            key={transition.to}
            type="button"
            disabled={isPending}
            onClick={() => {
              if (transition.requiresReason && activeReasonFor !== transition.to) {
                setActiveReasonFor(transition.to);
                return;
              }
              runTransition(transition);
            }}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60",
              VARIANT_CLASS[transition.variant]
            )}
          >
            {isPending ? "Memproses..." : transition.label}
          </button>
        ))}
      </div>
    </div>
  );
}
