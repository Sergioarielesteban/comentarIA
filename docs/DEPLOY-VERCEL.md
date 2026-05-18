# Desplegar ComentarIA en Vercel

## 1. Variables de entorno en Vercel

**Settings → Environment Variables** del proyecto. Añade todas (Production + Preview):

| Variable | Valor |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://hzhaxyclqewbnazfscfq.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | tu clave `sb_publishable_...` |
| `LLM_PROVIDER` | `anthropic` |
| `ANTHROPIC_API_KEY` | tu clave Anthropic |
| `OUTSCRAPER_API_KEY` | tu clave Outscraper |

> Las que empiezan por `NEXT_PUBLIC_` deben existir **antes del build**. Tras añadirlas: **Deployments → Redeploy**.

## 2. Supabase — URLs de producción

[Authentication → URL Configuration](https://supabase.com/dashboard/project/hzhaxyclqewbnazfscfq/auth/url-configuration)

- **Site URL:** `https://comentar-ia.vercel.app`
- **Redirect URLs** (añadir):
  ```
  https://comentar-ia.vercel.app/**
  http://localhost:3000/**
  ```

## 3. Móvil

Abre en el navegador: `https://comentar-ia.vercel.app`  
Misma cuenta → mismos datos en Supabase → no repite análisis salvo que regeneres.

## 4. Comprobar

Tras redeploy, en la consola del navegador (login) no debe fallar la petición a `*.supabase.co`.
