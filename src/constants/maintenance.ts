export const TRANSACTION_STATUSES = [
  "DRAFT",
  "SUBMITTED",
  "VERIFIED",
  "APPROVED",
  "POSTED",
  "REJECTED",
  "CANCELLED",
] as const;

export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number];

export const STATUS_LABELS: Record<TransactionStatus, string> = {
  DRAFT: "Draf",
  SUBMITTED: "Diajukan",
  VERIFIED: "Terverifikasi",
  APPROVED: "Disetujui",
  POSTED: "Diposting (Final)",
  REJECTED: "Ditolak",
  CANCELLED: "Dibatalkan",
};

export const STATUS_BADGE_CLASS: Record<TransactionStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  SUBMITTED: "bg-status-infoBg text-status-info",
  VERIFIED: "bg-brand-100 text-brand-700",
  APPROVED: "bg-status-successBg text-status-success",
  POSTED: "bg-status-successBg text-status-success",
  REJECTED: "bg-status-dangerBg text-status-danger",
  CANCELLED: "bg-status-dangerBg text-status-danger",
};

export type StatusTransition = {
  to: TransactionStatus;
  label: string;
  allowedRoles: string[];
  requiresReason?: boolean;
  variant: "primary" | "danger" | "neutral";
};

/**
 * Aturan transisi status di level APLIKASI (§23). Ini lapisan UX/business-rule
 * TAMBAHAN di atas RLS (0009_rls_policies.sql) — RLS tetap penegak keamanan
 * akhir di database; peta ini hanya menentukan tombol aksi mana yang
 * ditampilkan & memvalidasi sebelum request dikirim, supaya alur persetujuan
 * mengikuti hierarki (Operator ajukan → Verifikator verifikasi → Admin
 * setujui & posting) meskipun RLS mengizinkan kombinasi lain yang lebih longgar.
 */
export const STATUS_TRANSITIONS: Record<TransactionStatus, StatusTransition[]> = {
  DRAFT: [
    { to: "SUBMITTED", label: "Ajukan", allowedRoles: ["OPERATOR", "ADMIN", "SUPER_ADMIN"], variant: "primary" },
    { to: "CANCELLED", label: "Batalkan", allowedRoles: ["OPERATOR", "ADMIN", "SUPER_ADMIN"], variant: "neutral" },
  ],
  SUBMITTED: [
    { to: "VERIFIED", label: "Verifikasi", allowedRoles: ["VERIFIKATOR", "ADMIN", "SUPER_ADMIN"], variant: "primary" },
    {
      to: "REJECTED",
      label: "Tolak",
      allowedRoles: ["VERIFIKATOR", "ADMIN", "SUPER_ADMIN"],
      requiresReason: true,
      variant: "danger",
    },
    { to: "CANCELLED", label: "Batalkan", allowedRoles: ["ADMIN", "SUPER_ADMIN"], variant: "neutral" },
  ],
  VERIFIED: [
    { to: "APPROVED", label: "Setujui", allowedRoles: ["ADMIN", "SUPER_ADMIN"], variant: "primary" },
    {
      to: "REJECTED",
      label: "Tolak",
      allowedRoles: ["ADMIN", "SUPER_ADMIN"],
      requiresReason: true,
      variant: "danger",
    },
  ],
  APPROVED: [
    { to: "POSTED", label: "Posting (Final)", allowedRoles: ["ADMIN", "SUPER_ADMIN"], variant: "primary" },
  ],
  POSTED: [],
  REJECTED: [],
  CANCELLED: [],
};
