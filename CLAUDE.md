@AGENTS.md

## Deployment (Vercel) — CONFIRMADO
- Proyecto: the-cliff-club · team/scope: emmahermosillo (Hobby)
- Producción: https://the-cliff-club.vercel.app
- Repo conectado: emmanuelhermosillor/the-cliff-club · rama main
- Auto-deploy: cada push a main despliega a producción solo. NO hay que importar nada.
- Verificar (sin auth): `curl -sSI https://the-cliff-club.vercel.app` → 200/307.
- Falso negativo conocido: el conector/CLI local de Vercel puede NO ver el proyecto
  (sin acceso al team). Es falso negativo — el proyecto EXISTE. Verifica por la URL.
- Último deploy prod verificado: v3 commit 48ce81b, Status Ready (curl → 307).
