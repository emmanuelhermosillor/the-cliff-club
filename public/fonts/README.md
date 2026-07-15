# Fuentes — TODO

La marca oficial usa **IvyOra Display** (titulares), **IvyOra Text** (cuerpo serif) y
**Söhne Mono** (etiquetas/datos). Son **de pago** y aún no están en el repo.

Mientras tanto, el fallback vía `next/font/google` es:
Cormorant Garamond / EB Garamond / Space Mono (ver `src/app/layout.tsx`).

## Al recibir las licenciadas
1. Copia los `.woff2` aquí (`public/fonts/`).
2. En `src/app/layout.tsx`, sustituye los `next/font/google` por `next/font/local`
   apuntando a estos archivos, manteniendo las mismas variables CSS
   (`--font-cormorant` → IvyOra Display, `--font-eb` → IvyOra Text, `--font-space` → Söhne Mono),
   o renómbralas y ajusta `src/app/globals.css`.
