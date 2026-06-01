# EV-GOLF · Landing Page de Lujo

Landing page de alta gama para la venta consultiva de carros de golf eléctricos premium (modelos 2026), optimizada para convertir visitantes en conversaciones de WhatsApp.

## Stack

- **React 19** + **TypeScript**
- **Vite 6** (dev server y build)
- **Tailwind CSS** (build con PostCSS — `tailwind.config.js` / `index.css`)
- **Font Awesome** + **Inter** (vía CDN)
- **Tracking**: GTM/dataLayer + captura de UTMs (`tracking.ts`)

Toda la UI vive en un único componente: [`App.tsx`](App.tsx).

## Requisitos

- Node.js 18+ (probado con Node 24)

## Cómo correr

```bash
npm install      # instalar dependencias
npm run dev      # servidor de desarrollo en http://localhost:3000
npm run build    # build de producción en dist/
npm run preview  # previsualizar el build
```

## Funcionalidades

- **Bilingüe ES/EN** con autodetección de idioma y persistencia en `localStorage`.
- **Catálogo** de modelos (4 y 6 puestos) con slider de imágenes y soporte táctil (swipe).
- **Configurador interactivo**: modelo, color exterior, cuero interior y accesorios, con resumen de precio en vivo.
- **Sección de video** para mostrar el producto en movimiento.
- **Ficha técnica** en modal protegido (sin descarga / sin clic derecho).
- **Integración con WhatsApp**: todos los CTA y la configuración personalizada se envían como mensaje pre-armado.

## Personalización rápida

Los valores editables más comunes están centralizados al inicio de [`App.tsx`](App.tsx):

| Qué cambiar | Dónde |
|---|---|
| **Número de WhatsApp** | constante `WHATSAPP_NUMBER` (formato `wa.me`: dígitos, sin `+`) |
| **Video (reel)** | constantes `VIDEO_URL` / `VIDEO_POSTER`. Se abre como reel vertical desde el botón "Ver el reel" del hero. Acepta YouTube, Vimeo o un `.mp4` directo. El video actual vive en `public/media/` (se sirve desde la raíz, ej. `/media/ev-golf-video.mp4`) |
| **Textos / traducciones** | objeto `translations` (`es` / `en`) |
| **Precios del configurador** | objetos `basePrices` y `colorPrices` dentro de `Configurator` |
| **Imágenes de modelos** | arrays `images` en cada `ProductCard` y `colorImageMap` |
| **Páginas de ficha técnica** | arrays `pdf4SeatPages` / `pdf6SeatPages` |

## Estructura

```
.
├── index.html        # HTML base: Tailwind config, fuentes, SEO/meta, favicon
├── index.tsx         # Punto de montaje de React
├── App.tsx           # Toda la aplicación (componentes + i18n)
├── vite.config.ts    # Configuración de Vite (puerto 3000)
└── tsconfig.json
```
