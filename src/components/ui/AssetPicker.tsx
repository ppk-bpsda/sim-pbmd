"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type AssetOption = {
  id: string;
  asset_code: string;
  register_number: string;
  name: string;
  unit_id: string;
  units: { name: string } | null;
};

export function AssetPicker({
  name = "asset_id",
  unitFieldName = "unit_id",
  initialAsset,
}: {
  name?: string;
  unitFieldName?: string;
  initialAsset?: { id: string; name: string; asset_code: string; unit_id: string; unitName?: string | null };
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AssetOption[]>([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(initialAsset ?? null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const supabase = createClient();
      const term = query.trim().replace(/[%_]/g, "");
      const { data } = await supabase
        .from("assets")
        .select("id, asset_code, register_number, name, unit_id, units(name)")
        .is("deleted_at", null)
        .or(`name.ilike.%${term}%,asset_code.ilike.%${term}%,register_number.ilike.%${term}%`)
        .limit(15);
      setResults((data as unknown as AssetOption[]) ?? []);
      setOpen(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name={name} value={selected?.id ?? ""} />
      <input type="hidden" name={unitFieldName} value={selected?.unit_id ?? ""} />

      {selected ? (
        <div className="flex items-center justify-between rounded-md border border-surface-border bg-surface-muted px-3 py-2 text-sm">
          <div>
            <p className="font-medium text-slate-700">{selected.name}</p>
            <p className="text-xs text-slate-400">
              {selected.asset_code} — Unit: {selected.unitName ?? "-"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelected(null);
              setQuery("");
            }}
            className="rounded-md p-1 text-slate-400 hover:bg-white hover:text-slate-600"
            aria-label="Ganti aset"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
            placeholder="Ketik nama, kode, atau nomor register aset..."
            className="w-full rounded-md border border-surface-border py-2 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
      )}

      {open && !selected && results.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-surface-border bg-white shadow-card">
          {results.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => {
                  setSelected({
                    id: r.id,
                    name: r.name,
                    asset_code: r.asset_code,
                    unit_id: r.unit_id,
                    unitName: r.units?.name,
                  });
                  setOpen(false);
                }}
                className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-surface-muted"
              >
                <span className="font-medium text-slate-700">{r.name}</span>
                <span className="text-xs text-slate-400">
                  {r.asset_code} — {r.register_number} — Unit: {r.units?.name ?? "-"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && !selected && query.trim().length >= 2 && results.length === 0 && (
        <div className="absolute z-20 mt-1 w-full rounded-md border border-surface-border bg-white px-3 py-2 text-sm text-slate-400 shadow-card">
          Tidak ditemukan aset yang cocok.
        </div>
      )}
    </div>
  );
}
