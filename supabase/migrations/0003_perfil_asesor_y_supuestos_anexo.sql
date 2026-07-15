-- E1: datos del asesor en su perfil
alter table public.profiles add column if not exists telefono text;
alter table public.profiles add column if not exists puesto text;
alter table public.profiles add column if not exists whatsapp text;

-- C: supuestos del Anexo (defaults globales, editables por admin)
create table if not exists public.config_anexo (
  id int primary key default 1,
  plusvalia_anual numeric not null default 0.08,
  plazo_anios int not null default 5,
  adr numeric not null default 450,
  ocupacion numeric not null default 0.45,
  comision numeric not null default 0.06,
  fee_renta numeric not null default 0.20,
  mantenimiento numeric not null default 0.10,
  updated_at timestamptz not null default now(),
  constraint config_anexo_singleton check (id = 1)
);
insert into public.config_anexo (id) values (1) on conflict (id) do nothing;
alter table public.config_anexo enable row level security;
create policy "config_anexo_select_auth" on public.config_anexo for select to authenticated using (true);
create policy "config_anexo_write_admin" on public.config_anexo for all to authenticated using (public.is_admin()) with check (public.is_admin());
create trigger trg_config_anexo_updated_at before update on public.config_anexo for each row execute function public.set_updated_at();
