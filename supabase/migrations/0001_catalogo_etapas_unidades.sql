-- Catálogo editable de etapas y unidades (aplicada al proyecto the-cliff-club).
-- Las cifras derivadas (valor total, mensualidad, utilidad, letra) NO se guardan:
-- la app las calcula a partir de estos inputs (ver src/server/catalogo.ts).

-- ETAPAS -------------------------------------------------------------
create table if not exists public.etapas (
  id uuid primary key default gen_random_uuid(),
  clave text unique not null,
  nombre text not null,
  tagline text,
  descripcion text,
  orden int not null default 0,
  modelo text not null default 'completo',
  es_comprador boolean not null default true,
  descuento numeric,
  precio_base_m2 numeric default 8500,
  precio_entrada_m2 numeric,
  enganche_pct numeric,
  intermedios_pct numeric,
  intermedios_meses int default 24,
  intermedios_desde_idx int default 8,
  contra_pct numeric,
  contra_mes_idx int default 35,
  fases_enganche jsonb,
  gracia_meses jsonb,
  margen numeric,
  margen_estado text default 'por_calcular',
  activa boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- UNIDADES -----------------------------------------------------------
create table if not exists public.unidades (
  id uuid primary key default gen_random_uuid(),
  clave text unique not null,
  etiqueta text,
  recamaras text,
  banos text,
  m2_interior numeric,
  m2_terraza numeric,
  m2_bodega numeric,
  m2_total numeric,
  sqft_total numeric,
  orden int not null default 0,
  activa boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.etapas   enable row level security;
alter table public.unidades enable row level security;

-- Lectura: cualquier usuario autenticado (la app lee del lado servidor).
create policy "etapas_select_auth"   on public.etapas   for select to authenticated using (true);
create policy "unidades_select_auth" on public.unidades for select to authenticated using (true);

-- Escritura: solo admin (reutiliza public.is_admin()).
create policy "etapas_write_admin"   on public.etapas   for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "unidades_write_admin" on public.unidades for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Trigger updated_at.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists trg_etapas_updated_at on public.etapas;
create trigger trg_etapas_updated_at before update on public.etapas
  for each row execute function public.set_updated_at();

drop trigger if exists trg_unidades_updated_at on public.unidades;
create trigger trg_unidades_updated_at before update on public.unidades
  for each row execute function public.set_updated_at();

-- ============================ SEEDS ============================
insert into public.unidades (clave,etiqueta,recamaras,banos,m2_interior,m2_terraza,m2_bodega,m2_total,sqft_total,orden) values
 ('B403','B 403','1 recámara','2.0 baños', 87.02, 17.95, 6.40, 111.37, 1198.78, 1),
 ('B402','B 402','2 recámaras','2.5 baños',150.92, 36.81, 6.40, 194.13, 2089.60, 2),
 ('B406','B 406','3 recámaras','3.5 baños',192.10, 58.81, 6.40, 257.31, 2769.66, 3),
 ('B401','B 401','4 recámaras','4.5 baños',232.67, 58.73, 6.40, 297.80, 3205.49, 4)
on conflict (clave) do nothing;

-- Etapas activas (datos verificados). FR/FA/CR.
insert into public.etapas
 (clave,nombre,tagline,descripcion,orden,modelo,es_comprador,descuento,precio_entrada_m2,
  enganche_pct,intermedios_pct,contra_pct,fases_enganche,gracia_meses,margen,margen_estado,activa)
values
 ('FR','Founders Reserve','El primer nombre en la lista de Torre B.',
  'La etapa más temprana y exclusiva de The Cliff Club Residences, reservada al círculo más cercano, antes que Founders Access.',
  1,'completo',true,0.35,5525,
  0.50,0.40,0.10,
  '[{"c":"Apartado","pct":0.05,"mes":0},{"c":"Permiso / movimiento de tierras","pct":0.075,"mes":2},{"c":"Permiso de construcción","pct":0.10,"mes":3},{"c":"Inicio de construcción","pct":0.125,"mes":4},{"c":"Construcción","pct":0.15,"mes":5}]'::jsonb,
  '[6,7]'::jsonb,
  1.22,'proyeccion',true),
 ('FA','Founders Access','Una invitación al primer círculo de Torre B.',
  'Founders Access abre Torre B a un grupo reducido, antes del mercado. Entrar hoy es entrar al valor de origen. Después, el precio será otro.',
  2,'completo',true,0.30,5950,
  0.35,0.55,0.10,
  '[{"c":"Apartado","pct":0.05,"mes":0},{"c":"Permiso de construcción","pct":0.10,"mes":3},{"c":"Inicio de construcción","pct":0.10,"mes":4},{"c":"Construcción","pct":0.10,"mes":5}]'::jsonb,
  '[6,7]'::jsonb,
  1.06,'confirmado',true),
 ('CR','Collectors Reserve','Acceso preferente a Torre B.',
  'Collectors Reserve es la etapa más flexible de The Cliff Club Residences: acceso preferente a Torre B, con condiciones pensadas para entrar desde las primeras etapas.',
  3,'completo',true,0.25,6375,
  0.30,0.55,0.15,
  '[{"c":"Apartado","pct":0.025,"mes":0},{"c":"Permiso / movimiento de tierras","pct":0.075,"mes":2},{"c":"Permiso de construcción","pct":0.075,"mes":3},{"c":"Inicio de construcción","pct":0.125,"mes":4}]'::jsonb,
  '[5,6,7]'::jsonb,
  0.92,'confirmado',true)
on conflict (clave) do nothing;

-- Etapas inactivas (estructura de pago y margen POR CONFIRMAR con Gerardo — no inventar).
insert into public.etapas
 (clave,nombre,tagline,orden,modelo,es_comprador,descuento,precio_entrada_m2,margen_estado,activa)
values
 ('CA','Collector Access','Acceso al coleccionista.',4,'completo',   true, 0.20,6800,  'por_calcular',false),
 ('RA','Residence Access','Propiedad fraccional en Torre B.',5,'fraccional',true,0.15,7437.5,'por_calcular',false),
 ('AC','Alliance Circle','Círculo de aliados y proveedores.',6,'especial',false,0.10,8145,  'por_calcular',false),
 ('PC','Preview Circle','Lista de espera.',7,'especial',false,0.10,8325,  'por_calcular',false)
on conflict (clave) do nothing;
