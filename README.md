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

## Documento e inventario (v3)
- **Diseño nuevo** (`Documento.tsx`) reproduce `reference/propuesta_inversion.pdf` — 10 páginas:
  portada, confidencialidad (verbatim), introducción, la oportunidad, propuesta de venta,
  amortización (Nº secuencial, fechas MMM AA), descripción con **tablero real**, acuerdos,
  términos (verbatim), contraportada. Los % de enganche/intermedios/contra son dinámicos por etapa.
- **Anexo** (`Anexo.tsx` + `buildAnexo`) reproduce `reference/anexo_modelo.pdf` — análisis de
  inversión: competitive set, valor de entrada, compra-venta, renta (ADR $450), compuesta, flujo,
  indicadores (TIR) y conclusión. Modelo verificado (plusvalía 8%/5 años, comisión 6%). Founders
  Reserve sale en `proyeccion`, marcado "sujeto a confirmación". `ADR por tipología` = TODO.
- **Inventario real Torre B** (`unidades`, migración 0002): 28 unidades con `piso`/`disponibilidad`/
  `modelo`. El cotizador solo cotiza `disponible` (24); el tablero muestra todas por piso, coloreadas.
- **UX**: el cotizador es un formulario con resumen en vivo; el documento y el Anexo solo se
  muestran al pulsar Generar. Descargar PDF imprime el documento activo (print CSS).

## CRM (v5)
El cotizador captura al prospecto completo (nombre/correo/teléfono/origen) y lo empareja por
correo→teléfono→nombre (sin duplicar). Cada cotización congela los modelos de propuesta y Anexo
en `datos` para re-descargarlos con cifras congeladas (`/cotizaciones/[id]`). Prospectos: búsqueda,
filtro por estado, cambio de estado inline, edición y ficha (`/prospectos/[id]`) con sus cotizaciones
e historial, y borrado con confirmación de dos pasos + cascada. Todo respeta RLS.

## Assets de marca
Logos oficiales vectoriales (SVG) en `public/brand/`: `wordmark_shell.svg` (crema, sobre azul/oscuro),
`wordmark_blue.svg` (login), `logo_compuesto_shell.svg` (contraportadas). Master plan del desarrollo
(edificios): `public/renders/masterplan_desarrollo.jpg` (propuesta). Mapa costero de Quivira:
`public/renders/masterplan.jpg` (Anexo · Competitive Set, con pines aproximados).

## Pendientes
- Assets subibles por admin: Master Plan y Master Plan con Torre B señalada (placeholders con TODO).
- ADR por tipología en el Anexo (hoy fijo $450); TIR de CR/FR es estimada del flujo anual.
- Inventario en **BORRADOR**: confirmar B304 (cargada como 1 rec) y baños de PH/FG con Gerardo.
- Fuentes licenciadas IvyOra/Söhne — ver `public/fonts/README.md`.
