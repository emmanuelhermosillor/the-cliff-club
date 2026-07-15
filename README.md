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
- `src/server/matriz.ts` — **server-only**. Matriz de datos (etapas, tipologías, valores,
  amortización) y datos bancarios. Cifras verbatim del prototipo; no se inventan.
  La propuesta se calcula en el servidor (Server Action `computeProposal`) y solo el modelo
  de la combinación elegida viaja al cliente — la matriz completa nunca entra al bundle.
- `src/app/(protected)/` — vistas tras login: **Cotizador**, **Prospectos**, **Cotizaciones**.
- `src/proxy.ts` — protege todas las rutas; sin sesión → `/login`.
- `src/app/api/admin/create-user` — alta de usuarios con `service_role` (server-only, gated a admin).
  Preparada, **no** enlazada en la UI (README §6 del handoff).

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

## Pendientes de datos (no inventar)
- **Founders Reserve (etapa 1)** — deshabilitada en el selector hasta recibir su matriz y
  margen (el enganche es a 5 fases; la amortización actual asume 4). No se activa con números inventados.
- **Anexo** (companion que justifica el margen) — su modelo no viene en el handoff. Pendiente de
  definir si se agrega como láminas extra del PDF o como segundo generador ligado a la cotización.
