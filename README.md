# ComentarIA (Espejo Ciego)

SaaS para restaurantes: análisis de reseñas, informe espejo dueño vs clientes, chat IA y resumen semanal.

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Supabase** (auth + persistencia)
- **Anthropic** (análisis y chat)
- **Outscraper** (búsqueda y reseñas Google)

## Estructura

```
app/              Rutas y API
components/       UI y flujos
hooks/            Lógica cliente reutilizable
lib/              Supabase, análisis, copy, tipos
styles/           Tokens de diseño
public/           Assets y PWA manifest
supabase/         Schema SQL
```

## Arranque

1. Crea un proyecto en [supabase.com](https://supabase.com) (o abre uno existente).
2. Copia `.env.example` → `.env.local` y pega **Project URL** y **anon/publishable key** desde *Settings → API*.
3. Ejecuta `supabase/schema.sql` en el SQL Editor de Supabase.
4. `npm install && npm run dev` — **reinicia** el servidor tras cambiar `.env.local`.

## Ver la app en el móvil (misma WiFi, sin repetir análisis)

1. En el Mac, arranca escuchando en la red local:
   ```bash
   npm run dev:mobile
   ```
2. Averigua la IP del Mac: **Ajustes → Wi‑Fi → Detalles** (ej. `192.168.1.42`).
3. En el móvil (misma WiFi), abre: `http://192.168.1.42:3000`
4. **Inicia sesión con la misma cuenta** que en el ordenador.

El análisis se guarda en **Supabase**; al entrar en el móvil se descarga y **no se vuelve a cobrar** en Anthropic salvo que pulses *Regenerar análisis* en Ajustes o cambies las reseñas.

> En desarrollo, el móvil usa el servidor del Mac (las llamadas a IA salen desde tu Mac, no desde el teléfono).

Si login muestra *Failed to fetch*, la URL del proyecto suele ser incorrecta o el proyecto ya no existe.

## IA local (gratis) con Ollama

Sin coste de API: análisis y chat usan un modelo en tu Mac.

```bash
# 1. Instalar Ollama: https://ollama.com
brew install ollama

# 2. Arrancar el servicio (o abre la app Ollama)
ollama serve

# 3. Descargar un modelo (solo la primera vez, ~2 GB)
ollama pull llama3.2
```

En `.env.local`:

```env
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.2
```

Comprueba que responde: `curl http://localhost:11434/api/tags`

Modelos alternativos en español: `mistral`, `qwen2.5:7b` (`ollama pull mistral`).

Para usar Anthropic en producción: `LLM_PROVIDER=anthropic` y `ANTHROPIC_API_KEY=...`

## Rutas principales

| Ruta | Descripción |
|------|-------------|
| `/` | Landing |
| `/login` | Auth |
| `/onboarding` | Registrar restaurante |
| `/insights` | Dashboard / insights semanales |
| `/espejo` | Informe espejo |
| `/audio` | Resumen en audio |
| `/chat` | Consultor IA |
| `/ajustes` | Ajustes |
| `/informe/pdf` | Exportación PDF (impresión) |

## Pendiente (placeholders)

Ver `lib/placeholders.ts`: tendencia semanal, TTS premium, PDF avanzado, multi-restaurante, etc.
