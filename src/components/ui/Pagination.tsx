import Link from "next/link";
import { cn } from "@/lib/utils";

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
};

function buildHref(basePath: string, searchParams: Record<string, string | undefined>, page: number) {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value && key !== "page") params.set(key, value);
  });
  params.set("page", String(page));
  return `${basePath}?${params.toString()}`;
}

export function Pagination({ page, pageSize, total, basePath, searchParams }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-surface-border px-4 py-3 text-sm text-slate-500 sm:flex-row">
      <p>
        Menampilkan <span className="font-medium text-slate-700">{from}</span>–
        <span className="font-medium text-slate-700">{to}</span> dari{" "}
        <span className="font-medium text-slate-700">{total}</span> data
      </p>
      <div className="flex items-center gap-1">
        <Link
          aria-disabled={page <= 1}
          href={buildHref(basePath, searchParams, Math.max(1, page - 1))}
          className={cn(
            "rounded-md border border-surface-border px-3 py-1.5 text-sm",
            page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-surface-muted"
          )}
        >
          Sebelumnya
        </Link>
        <span className="px-2 text-xs text-slate-400">
          Halaman {page} / {totalPages}
        </span>
        <Link
          aria-disabled={page >= totalPages}
          href={buildHref(basePath, searchParams, Math.min(totalPages, page + 1))}
          className={cn(
            "rounded-md border border-surface-border px-3 py-1.5 text-sm",
            page >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-surface-muted"
          )}
        >
          Berikutnya
        </Link>
      </div>
    </div>
  );
}
