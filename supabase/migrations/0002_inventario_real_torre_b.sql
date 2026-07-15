-- Inventario real Torre B (28 unidades, BORRADOR — sales roll 2026-07-15).
-- Solo se cotizan unidades 'disponible'; 'vendida'/'apartada' se muestran en el tablero.
alter table public.unidades add column if not exists piso int;
alter table public.unidades add column if not exists disponibilidad text default 'disponible';
alter table public.unidades add column if not exists modelo text;
alter table public.unidades add column if not exists m2_ph numeric default 0;
alter table public.unidades add column if not exists m2_jardin numeric default 0;
alter table public.unidades add column if not exists precio_lista_m2 numeric default 8500;
alter table public.unidades add column if not exists precio_lista numeric;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'unidades_disponibilidad_check') then
    alter table public.unidades add constraint unidades_disponibilidad_check
      check (disponibilidad in ('disponible','apartada','vendida'));
  end if;
end $$;

delete from public.unidades;
insert into public.unidades
 (clave,etiqueta,piso,disponibilidad,modelo,recamaras,banos,m2_interior,m2_terraza,m2_ph,m2_jardin,m2_bodega,m2_total,precio_lista_m2,precio_lista,orden) values
 ('B101','B 101',5,'disponible','4 Bedroom A + PH',4,'4.5 baños',292.81,58.73,182.85,0.0,6.4,540.79,8500,4596715,1),
 ('B102','B 102',5,'disponible','4 Bedroom B + PH',4,'4.5 baños',297.94,61.36,162.13,0.0,6.4,527.83,8500,4486555,2),
 ('B103','B 103',5,'disponible','4 Bedroom B + PH',4,'4.5 baños',297.94,61.36,162.13,0.0,6.4,527.83,8500,4486555,3),
 ('B104','B 104',5,'disponible','4 Bedroom A + PH',4,'4.5 baños',292.81,58.73,182.85,0.0,6.4,540.79,8500,4596715,4),
 ('B201','B 201',4,'vendida','4 Bedroom A',4,'4.5 baños',232.67,58.73,0.0,0.0,6.4,297.8,8500,2531300,5),
 ('B202','B 202',4,'apartada','2 Bedroom A',2,'2.5 baños',150.92,36.81,0.0,0.0,6.4,194.13,8500,1650105,6),
 ('B203','B 203',4,'disponible','1 Bedroom A',1,'2.0 baños',87.02,17.95,0.0,0.0,6.4,111.37,8500,946645,7),
 ('B204','B 204',4,'disponible','1 Bedroom A',1,'2.0 baños',87.02,17.95,0.0,0.0,6.4,111.37,8500,946645,8),
 ('B205','B 205',4,'disponible','2 Bedroom A',2,'2.5 baños',150.92,36.81,0.0,0.0,6.4,194.13,8500,1650105,9),
 ('B206','B 206',4,'vendida','3 Bedroom A',3,'3.5 baños',192.1,58.81,0.0,0.0,6.4,257.31,8500,2187135,10),
 ('B301','B 301',3,'disponible','4 Bedroom A',4,'4.5 baños',232.67,58.73,0.0,0.0,6.4,297.8,8500,2531300,11),
 ('B302','B 302',3,'apartada','2 Bedroom A',2,'2.5 baños',150.92,36.81,0.0,0.0,6.4,194.13,8500,1650105,12),
 ('B303','B 303',3,'disponible','1 Bedroom A',1,'2.0 baños',87.02,17.95,0.0,0.0,6.4,111.37,8500,946645,13),
 ('B304','B 304',3,'disponible','1 Bedroom A',1,'2.0 baños',87.02,17.95,0.0,0.0,6.4,111.37,8500,946645,14),
 ('B305','B 305',3,'disponible','2 Bedroom A',2,'2.5 baños',150.92,36.81,0.0,0.0,6.4,194.13,8500,1650105,15),
 ('B306','B 306',3,'disponible','3 Bedroom A',3,'3.5 baños',192.1,58.81,0.0,0.0,6.4,257.31,8500,2187135,16),
 ('B401','B 401',2,'disponible','4 Bedroom A',4,'4.5 baños',232.67,58.73,0.0,0.0,6.4,297.8,8500,2531300,17),
 ('B402','B 402',2,'disponible','2 Bedroom A',2,'2.5 baños',150.92,36.81,0.0,0.0,6.4,194.13,8500,1650105,18),
 ('B403','B 403',2,'disponible','1 Bedroom A',1,'2.0 baños',87.02,17.95,0.0,0.0,6.4,111.37,8500,946645,19),
 ('B404','B 404',2,'disponible','1 Bedroom A',1,'2.0 baños',87.02,17.95,0.0,0.0,6.4,111.37,8500,946645,20),
 ('B405','B 405',2,'disponible','2 Bedroom A',2,'2.5 baños',150.92,36.81,0.0,0.0,6.4,194.13,8500,1650105,21),
 ('B406','B 406',2,'disponible','3 Bedroom A',3,'3.5 baños',192.1,58.81,0.0,0.0,6.4,257.31,8500,2187135,22),
 ('B501','B 501',1,'disponible','4 Bedroom A + FG',4,'4.5 baños',232.67,58.73,0.0,44.1,6.4,341.9,8500,2906150,23),
 ('B502','B 502',1,'disponible','2 Bedroom A + FG',2,'2.5 baños',150.92,36.81,0.0,40.69,6.4,234.82,8500,1995970,24),
 ('B503','B 503',1,'disponible','1 Bedroom A + FG',1,'2.0 baños',87.02,17.95,0.0,22.91,6.4,134.28,8500,1141380,25),
 ('B504','B 504',1,'disponible','1 Bedroom A + FG',1,'2.0 baños',87.02,17.95,0.0,22.91,6.4,134.28,8500,1141380,26),
 ('B505','B 505',1,'disponible','2 Bedroom A + FG',2,'2.5 baños',150.92,36.81,0.0,40.69,6.4,234.82,8500,1995970,27),
 ('B506','B 506',1,'disponible','3 Bedroom A + FG',3,'3.5 baños',194.7,70.65,0.0,44.1,6.4,315.85,8500,2684725,28);
