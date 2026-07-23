# 📈 Activar Meta Conversions API (CAPI)

La CAPI envía tus conversiones a Meta **desde el servidor** (no solo desde el navegador). Así recuperas los eventos que el Pixel pierde por iOS, bloqueadores de anuncios o cierres de pestaña — normalmente **entre 10% y 30% más de conversiones registradas**, lo que hace que Meta **optimice mejor y te baje el costo por lead**.

> ✅ Ya está todo programado y desplegado. El Pixel y la CAPI comparten un `event_id`, así que Meta **cuenta cada conversión una sola vez** (sin doble conteo). Solo falta **1 paso tuyo**: poner el token.

---

## Paso 1 — Generar el token de la CAPI (en Meta)

1. Entra a **Events Manager** 👉 https://business.facebook.com/events_manager2
2. Selecciona tu **conjunto de datos / Pixel**: `1742726306716531`.
3. Ve a **Configuración (Settings)**.
4. Baja hasta **"API de conversiones"** → **"Generar token de acceso"** (Generate access token).
5. Copia el token (es una cadena larga). ⚠️ Es **secreto**, no lo compartas ni lo pegues en el código.

---

## Paso 2 — Guardar el token en Vercel (variable de entorno)

1. Entra a **Vercel** → tu proyecto **EV-GOLF-2026** → **Settings** → **Environment Variables**.
2. Agrega una variable nueva:
   - **Name:** `META_CAPI_TOKEN`
   - **Value:** *(pega el token del Paso 1)*
   - **Environments:** marca **Production** (y Preview si quieres).
3. **Save**.
4. Ve a **Deployments** → en el último deployment, menú **⋯** → **Redeploy** (para que tome la variable).

*(Opcional: si algún día cambias de Pixel, agrega también `META_PIXEL_ID` con el nuevo ID. Por defecto usa el actual.)*

---

## Paso 3 — Verificar que llegan los eventos

1. En **Events Manager** → tu Pixel → pestaña **"Probar eventos" (Test Events)**.
2. Abre **evgolf.club** y haz clic en un botón de WhatsApp / envía algo por el chat.
3. Deberías ver los eventos **Lead** y **Contact** llegando por **dos orígenes**: *Navegador* (Pixel) y *Servidor* (Conversions API), **emparejados / deduplicados**.
4. En unos días, en **Configuración → API de conversiones**, verás la **"Calidad de la coincidencia de eventos"** subir.

---

## ¿Cómo saber si está activo?

- Abre en tu navegador: **https://evgolf.club/api/capi**
  - Si responde `"configured": false` → aún **falta el token** (o el redeploy).
  - Si responde `"configured": true` → el token ya está puesto; verifica los eventos en **Test Events**.

---

## Notas técnicas (para referencia)
- Endpoint: `api/capi.js` (función serverless en Vercel).
- El cliente (`tracking.ts → metaTrack`) envía cada evento con su `event_id`, `fbp`/`fbc`, URL y datos; el servidor lo reenvía a la Graph API de Meta añadiendo IP y user-agent.
- Sin `META_CAPI_TOKEN`, el endpoint responde sin hacer nada — **la web nunca se rompe** por esto.
- Eventos que ya viajan por CAPI: **Lead**, **Contact**, **CustomizeProduct** (los mismos del Pixel).
