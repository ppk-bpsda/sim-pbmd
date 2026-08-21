-- =============================================================
-- 0005_budgets.sql
-- Pagu anggaran per rekening/unit/tahun, dan tabel realisasi yang
-- HANYA diisi otomatis oleh trigger (lihat 0008) — tidak pernah
-- diinput manual, agar laporan tidak pernah berbeda dari database (§39/§55).
-- =============================================================

-- -------------------------------------------------------------
-- BUDGETS (Pagu)
-- -------------------------------------------------------------
create table public.budgets (
  id                 uuid primary key default gen_random_uuid(),
  fiscal_year_id     uuid not null references public.fiscal_years(id) on delete restrict,
  budget_account_id  uuid not null references public.budget_accounts(id) on delete restrict,
  unit_id            uuid not null references public.units(id) on delete restrict,
  ceiling_amount     numeric(18,2) not null check (ceiling_amount >= 0),  -- pagu
  notes              text,
  created_by         uuid references public.profiles(id),
  updated_by         uuid references public.profiles(id),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (fiscal_year_id, budget_account_id, unit_id)
);

create trigger trg_budgets_updated_at
  before update on public.budgets
  for each row execute function public.set_updated_at();

create index idx_budgets_fiscal_year on public.budgets(fiscal_year_id);
create index idx_budgets_unit on public.budgets(unit_id);

-- -------------------------------------------------------------
-- BUDGET_REALIZATIONS (Realisasi — tabel derived)
-- realized_amount = SUM(maintenance_transactions.amount) WHERE status IN
-- ('APPROVED','POSTED') dikelompokkan per (fiscal_year, budget_account, unit).
-- Diperbarui oleh trigger fn_recalculate_budget_realization (lihat 0008),
-- BUKAN oleh input pengguna — tidak ada RLS policy INSERT/UPDATE untuk role
-- mana pun pada tabel ini (lihat 0009).
-- -------------------------------------------------------------
create table public.budget_realizations (
  id                 uuid primary key default gen_random_uuid(),
  fiscal_year_id     uuid not null references public.fiscal_years(id) on delete restrict,
  budget_account_id  uuid not null references public.budget_accounts(id) on delete restrict,
  unit_id            uuid not null references public.units(id) on delete restrict,
  realized_amount    numeric(18,2) not null default 0 check (realized_amount >= 0),
  updated_at         timestamptz not null default now(),
  unique (fiscal_year_id, budget_account_id, unit_id)
);

comment on table public.budget_realizations is
  'Derived/read-model. Diisi HANYA oleh trigger dari maintenance_transactions berstatus APPROVED/POSTED. Jangan pernah diinput manual.';
