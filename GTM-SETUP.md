# 📊 Activar tracking (GTM + Meta Pixel + GA4 + Google Ads)

La página **ya dispara todos los eventos al `dataLayer`**. Solo falta (1) poner los IDs y (2) crear los tags dentro de GTM. Esta guía te lo deja listo.

---

## 1. Variables de entorno

En **Vercel → tu proyecto → Settings → Environment Variables**, agrega:

| Variable | Valor | Para qué |
|---|---|---|
| `VITE_WHATSAPP_NUMBER` | `57XXXXXXXXXX` (tu número, solo dígitos, con 57) | Número real de WhatsApp |
| `VITE_GTM_ID` | `GTM-XXXXXXX` | Carga Google Tag Manager |
| `VITE_SITE_URL` | `https://ev-golf-2026.vercel.app` | Canonical / OG |

> Después de guardarlas, haz **Redeploy** en Vercel (las `VITE_*` se hornean en build).
> Para probar local: crea `.env.local` con las mismas (ver `.env.example`).

---

## 2. Eventos que la web ya envía al dataLayer

| Evento | Cuándo se dispara | Parámetros útiles |
|---|---|---|
| `page_view` | Al cargar la página | page_location, utm_* |
| `scroll_50` / `scroll_90` | Scroll 50% / 90% | percent |
| `whatsapp_click` | Clic en cualquier CTA de WhatsApp | button_location, model, price |
| `generate_lead` | Igual que arriba (conversión) | model, price, lead_value=1 |
| `view_technical_sheet` | Abre ficha técnica | model |
| `video_play` | Abre un video (hero o modelo) | model, location |
| `configurator_submit` | Envía configuración por WhatsApp | model, price |

Todos incluyen además: `utm_source, utm_medium, utm_campaign, utm_content, utm_term, gclid, fbclid` (capturados de la URL).

---

## 3. Qué crear dentro de GTM (https://tagmanager.google.com)

Crea un contenedor **Web**, copia el `GTM-XXXXXXX` a `VITE_GTM_ID`, y dentro configura:

### A. Triggers (Activadores) — uno por evento
Tipo **Custom Event**, con el nombre exacto del evento:
- `generate_lead`, `whatsapp_click`, `configurator_submit`, `video_play`, `view_technical_sheet`, `scroll_50`, `scroll_90`.

### B. GA4
1. Tag **"Google Analytics: GA4 Configuration"** con tu `G-XXXXXXXXXX` → trigger **All Pages**.
2. Tags **"GA4 Event"** para cada evento (ej. `generate_lead`) → trigger del mismo nombre. Manda los parámetros (model, price, button_location).

### C. Meta Pixel
1. Tag **Custom HTML** con el código base del Pixel (tu `PIXEL_ID`) → trigger **All Pages** (= `PageView`).
2. Tag **Custom HTML** con `fbq('track','Contact')` → trigger `whatsapp_click`.
3. Tag **Custom HTML** con `fbq('track','Lead')` → trigger `generate_lead`.
4. (Opcional) `fbq('track','CustomizeProduct')` → trigger `configurator_submit`.

> Recomendado: **valor de lead simbólico** (value=1) — no mandar el precio real como valor de conversión (infla el ROAS).

### D. Google Ads (conversión)
Tag **"Google Ads Conversion Tracking"** con `AW-XXXXXXX` + label → trigger `generate_lead`.

---

## 4. Verificar
1. Abre la web con `?gtm_debug=x` o usa **Vista previa** de GTM.
2. Haz clic en "Cotizar" → deben verse `whatsapp_click` y `generate_lead` en GTM Preview.
3. En Meta Events Manager y GA4 DebugView confirma que llegan.

---

### Nota
La estrategia elegida fue **GTM como única capa** (no se hardcodea gtag/fbq en el código) para evitar doble conteo. Si algún día prefieres el Pixel directo en el código, se puede cambiar.
