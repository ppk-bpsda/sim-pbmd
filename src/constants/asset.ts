export const ASSET_CONDITIONS = [
  { value: "BAIK", label: "Baik" },
  { value: "RUSAK_RINGAN", label: "Rusak Ringan" },
  { value: "RUSAK_BERAT", label: "Rusak Berat" },
] as const;

export type AssetCondition = (typeof ASSET_CONDITIONS)[number]["value"];

export const CONDITION_BADGE_CLASS: Record<AssetCondition, string> = {
  BAIK: "bg-status-successBg text-status-success",
  RUSAK_RINGAN: "bg-status-warningBg text-status-warning",
  RUSAK_BERAT: "bg-status-dangerBg text-status-danger",
};

export function conditionLabel(value: string): string {
  return ASSET_CONDITIONS.find((c) => c.value === value)?.label ?? value;
}
