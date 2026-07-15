# The Cliff Club · Cotizador & CRM

App web privada para **The Cliff Club Residences** (Adria Capital, Los Cabos): un cotizador
de propuestas (10 láminas, export a PDF) y un CRM simple (prospectos + cotizaciones).
Next.js 16 (App Router, TS) + Supabase (`@supabase/ssr`). Confidencial.

## Stack
- **Next.js 16.2.10** — App Router. Ojo: middleware ahora es `proxy` (`src/proxy.ts`);
  `cookies()`/`headers()` son async. Ver `AGENTS.md`.
- **Supabase** — auth email/password, Postgres con RLS. Cliente browser/servidor/proxy en `src/lib/supabase/`.
- **Tailwind v4** (CSS-first) + `next/font`, siguiendo las convenciones de `~/Developer/ruella`.

## Arquitectura
- **Catálogo editable en Supabase** — tablas `etapas` y `unidades` (RLS: lectura autenticada,
  escritura solo `is_admin()`). Precios, descuentos, márgenes, fases de pago y m² se editan
  desde `/admin` sin tocar código ni redeploy. Migración + seeds en `supabase/migrations/`.
- `src/server/catalogo.ts` — **server-only**. Lee el catálogo y **calcula** la propuesta
  (valor total, mensualidad, utilidad, importe en letra) a partir de los inputs; no guarda cifras
  derivadas. Solo el modelo de la combinación elegida viaja al cliente vía Server Action
  `computeProposal` — el catálogo completo (otras etapas, márgenes, banco) nunca entra al bundle.
- `src/server/matriz.ts` — **server-only**. Datos que no se editan desde el panel: calendario de
  amortización, datos bancarios, formateadores.
- `src/lib/numero.ts` — `numeroALetras()` (importe en letra), validado contra los totales verificados.
- `src/app/(protected)/` — vistas tras login: **Cotizador** (con modo *unidad libre* / m² manual),
  **Prospectos**, **Cotizaciones**, **Admin** (solo rol admin).
- `src/proxy.ts` — protege todas las rutas; sin sesión → `/login`.
- `src/app/api/admin/create-user` — alta de usuarios con `service_role` (server-only, gated a admin).
  Preparada, **no** enlazada en la UI (README §6 del handoff original).

### Inmutabilidad de cotizaciones
Cada cotización guarda en `datos` (jsonb) un **snapshot** de las cifras usadas. Editar precios en
`/admin` afecta a las **nuevas** cotizaciones; las ya guardadas conservan su snapshot.

## Setup local
```bash
npm install
cp .env.example .env.local   # ya trae URL + anon key del proyecto the-cliff-club
npm run dev                  # http://localhost:3000
```
Login con los usuarios ya dados de alta (todos admin, pass `CliffClub2026`):
`emmanuel@emmahermosillo.com`, `gbc@adriacapital.mx`, `abc@adriacapital.mx`, `jcardenas@adriacapital.mx`.

## Variables de entorno
| Variable | Dónde | Notas |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | local + Vercel | pública |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | local + Vercel | pública (publishable) |
| `SUPABASE_SERVICE_ROLE_KEY` | **solo servidor** | opcional; solo para alta de usuarios. Nunca `NEXT_PUBLIC_`. |

## Deploy (Vercel, scope `emmahermosillo`)
1. Importa el repo privado `the-cliff-club` en Vercel (scope `emmahermosillo`).
2. Framework: Next.js (autodetectado). Sin overrides.
3. Env vars del proyecto → pega `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   (y `SUPABASE_SERVICE_ROLE_KEY` si se habilita alta de usuarios).
4. Deploy a producción.

## Assets
Logo y renders reales extraídos del machote (`public/brand/`, `public/renders/`).
Placeholders con `TODO` (pendientes de Gerardo):
- **Master Plan con Torre B señalada** (lámina 7).
- **Tablero de disponibilidad real** (hoy es ilustrativo).
- Fuentes licenciadas IvyOra/Söhne — ver `public/fonts/README.md`.

## Etapas del catálogo
- **Activas** (datos verificados): Founders Reserve (35% · $5,525/m² · enganche 50% en 5 fases ·
  margen 122% en estado `proyeccion`, pendiente de que Gerardo/Adrián lo confirmen), Founders Access
  (30% · $5,950 · margen 106%), Collectors Reserve (25% · $6,375 · margen 92%).
- **Inactivas** (no seleccionables; estructura de pago y margen **por confirmar** con Gerardo —
  no inventar): Collector Access, Residence Access, Alliance Circle, Preview Circle. Se activan
  desde `/admin` cuando estén sus datos.

## Pendientes
- **Anexo** (companion que justifica el margen) — su modelo no viene en el handoff. Pendiente de
  definir si se agrega como láminas extra del PDF o como segundo generador ligado a la cotización.
- Assets: Master Plan con Torre B señalada y tablero de disponibilidad real (placeholders con TODO).
- Fuentes licenciadas IvyOra/Söhne — ver `public/fonts/README.md`.
