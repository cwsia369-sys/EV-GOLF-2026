// =============================================================
//  EV-GOLF · Configuración central + Tracking
// =============================================================
//
//  Medición activa:
//   - Meta Pixel (directo): base en index.html (PageView). Aquí
//     disparamos Lead / Contact / CustomizeProduct vía metaTrack().
//   - dataLayer: queda listo por si más adelante se añade GTM/GA4.
//
//  Las variables VITE_* se "hornean" en build-time.

declare global {
  interface Window {
    dataLayer?: any[];
    fbq?: (...args: any[]) => void;
  }
}

// --- Acceso seguro a variables de entorno (sin depender de vite/client) ---
const ENV: Record<string, string | undefined> =
  ((import.meta as any)?.env as Record<string, string>) || {};

// --- Número de WhatsApp (env con fallback al actual) ---
// Formato wa.me: código de país + número, solo dígitos, sin "+" ni espacios.
export const WHATSAPP_NUMBER: string = ENV.VITE_WHATSAPP_NUMBER || "573005732546";

// --- ID de Google Tag Manager (opcional) ---
export const GTM_ID: string | undefined = ENV.VITE_GTM_ID;

// --- URL final del sitio (para canonical / OG / schema) ---
export const SITE_URL: string = ENV.VITE_SITE_URL || "https://evgolf.club";

// Valor simbólico de un lead (un clic de WhatsApp NO es una venta).
// El precio del modelo viaja solo como parámetro informativo.
export const LEAD_VALUE = 1;

// =============================================================
//  INVENTARIO (única fuente de verdad de modelos / precios / stock)
// =============================================================
export type ModelKey = "signature4" | "resort6";

export const INVENTORY: Record<ModelKey, {
  key: ModelKey;
  seatKey: "4-seat" | "6-seat";
  name: string;
  seats: number;
  price: number;
  priceFormatted: string;
  stock: number;
}> = {
  signature4: {
    key: "signature4",
    seatKey: "4-seat",
    name: "EV-GOLF Signature 4",
    seats: 4,
    price: 55900000,
    priceFormatted: "$55.900.000 COP",
    stock: 4,
  },
  resort6: {
    key: "resort6",
    seatKey: "6-seat",
    name: "EV-GOLF Resort 6",
    seats: 6,
    price: 59900000,
    priceFormatted: "$59.900.000 COP",
    stock: 2,
  },
};

export const TOTAL_STOCK = INVENTORY.signature4.stock + INVENTORY.resort6.stock;

// =============================================================
//  Captura de UTMs (Meta / Google Ads)
// =============================================================
const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "fbclid",
];

const UTM_STORAGE_KEY = "evgolf_utms";

export function captureUtmParams(): void {
  try {
    const params = new URLSearchParams(window.location.search);
    const utms: Record<string, string> = {};
    UTM_KEYS.forEach((key) => {
      const value = params.get(key);
      if (value) utms[key] = value;
    });
    if (Object.keys(utms).length > 0) {
      localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utms));
    }
  } catch {
    /* noop */
  }
}

export function getStoredUtmParams(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(UTM_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

// =============================================================
//  Carga de GTM (solo si existe VITE_GTM_ID)
// =============================================================
export function initGtm(): void {
  if (!GTM_ID || typeof window === "undefined") return;
  if ((window as any).__gtmLoaded) return;
  (window as any).__gtmLoaded = true;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
  document.head.appendChild(script);

  // <noscript> fallback en el body
  const noscript = document.createElement("noscript");
  const iframe = document.createElement("iframe");
  iframe.src = `https://www.googletagmanager.com/ns.html?id=${GTM_ID}`;
  iframe.height = "0";
  iframe.width = "0";
  iframe.style.display = "none";
  iframe.style.visibility = "hidden";
  noscript.appendChild(iframe);
  document.body.appendChild(noscript);
}

// =============================================================
//  Evento genérico al dataLayer
// =============================================================
export function trackEvent(eventName: string, params: Record<string, any> = {}): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    page_location: window.location.href,
    page_title: document.title,
    ...getStoredUtmParams(),
    ...params,
  });
}

// =============================================================
//  Meta Pixel — disparo seguro de eventos
// =============================================================
export function metaTrack(event: string, params: Record<string, any> = {}): void {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq("track", event, params);
  }
}

// =============================================================
//  Apertura de WhatsApp + disparo de eventos de conversión
// =============================================================
export function openWhatsapp({
  message,
  model,
  price,
  stock,
  buttonLocation,
  language = "es",
}: {
  message: string;
  model?: string;
  price?: number;
  stock?: number;
  buttonLocation: string;
  language?: string;
}): void {
  const base = {
    event_category: "lead",
    event_label: buttonLocation,
    button_location: buttonLocation,
    model,
    price,            // informativo (no es el value de conversión)
    stock,
    language,
    lead_value: LEAD_VALUE,
    currency: "COP",
  };

  // dataLayer (por si se añade GTM/GA4 luego)
  trackEvent("whatsapp_click", base);
  trackEvent("generate_lead", { ...base, event_category: "conversion", event_label: "whatsapp_lead" });

  // Meta Pixel: Contact + Lead
  metaTrack("Contact", { content_name: model, value: LEAD_VALUE, currency: "COP" });
  metaTrack("Lead", { content_name: model, value: LEAD_VALUE, currency: "COP" });

  const finalMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${finalMessage}`, "_blank");
}
