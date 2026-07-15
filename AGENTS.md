# This is NOT the Next.js you know

This project runs **Next.js 16** (App Router, TypeScript). APIs and conventions differ
from older training data — read the relevant guide in `node_modules/next/dist/docs/`
before writing code. Notable in this repo:

- **Middleware is now `proxy`.** Route protection lives in `src/proxy.ts` (exports `proxy`),
  not `middleware.ts`.
- **Request APIs are async.** `cookies()` / `headers()` must be awaited.

## Project shape

- **App**: cotizador de propuestas (10 láminas, export PDF) + CRM (prospectos, cotizaciones)
  para **The Cliff Club Residences** (Adria Capital, Los Cabos).
- **Backend**: Supabase (`@supabase/ssr`) — proyecto `the-cliff-club`. RLS activo; cada asesor
  ve lo suyo, admin ve todo. Login email/password; rutas protegidas por `src/proxy.ts`.
- **Confidencialidad (crítico)**: la matriz de precios/márgenes y los datos bancarios viven en
  `src/server/matriz.ts` (**server-only**). Nunca los muevas al cliente. El `service_role`
  solo en el servidor (`src/app/api/admin/create-user`).
- **Cifras**: son verbatim del prototipo verificado — **no las inventes ni recalcules**.
- **Convenciones**: siguen `~/Developer/ruella` (Tailwind v4 CSS-first, `next/font`,
  `src/design-system`, deploy a Vercel scope `emmahermosillo`).

Ver `README.md` para setup, deploy y TODOs pendientes.
