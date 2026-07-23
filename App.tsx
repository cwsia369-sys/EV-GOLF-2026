import React, { useState, useEffect, useRef } from 'react';
import {
  WHATSAPP_NUMBER,
  INVENTORY,
  TOTAL_STOCK,
  openWhatsapp,
  trackEvent,
  metaTrack,
  captureUtmParams,
  initGtm,
} from './tracking';

// --- VIDEO ---
// TODO: Pega aquí el enlace del video de EV-GOLF.
// Acepta links normales de YouTube (https://youtu.be/ID o https://www.youtube.com/watch?v=ID),
// de Vimeo (https://vimeo.com/ID) o un archivo .mp4 directo. Se normaliza automáticamente.
// Déjalo vacío ("") para mostrar un marcador temporal.
const VIDEO_URL = "/media/ev-golf-video.mp4";
// Imagen de portada (se muestra antes de reproducir). Déjala "" si no aplica.
const VIDEO_POSTER = "/media/ev-golf-poster.jpg";

// Videos comerciales por modelo (verticales). Cambia las rutas si subes nuevos.
const MODEL_VIDEOS: Record<string, { url: string, poster: string }> = {
  "4-seat": { url: "/media/ev4-golf.mp4", poster: "/media/ev4-golf-poster.jpg" },
  "6-seat": { url: "/media/ev6-golf.mp4", poster: "/media/ev6-golf-poster.jpg" },
};

// Disponibilidad para entrega inmediata: cada modelo tiene un color + cuero fijos.
// 4 Puestos -> exterior Negro + sillas Cognac | 6 Puestos -> exterior Blanco + sillas Rojo
const MODEL_AVAILABILITY: Record<string, { color: string, interior: string }> = {
  "4-seat": { color: "black", interior: "cognac" },
  "6-seat": { color: "white", interior: "red" },
};

// Convierte un enlace de YouTube/Vimeo a su formato "embed". Devuelve null si es un .mp4.
const toEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0`;
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null; // No es YouTube/Vimeo: se trata como archivo de video directo.
};

// --- I18N DICTIONARY ---
const translations: Record<string, any> = {
  es: {
    nav_contact: "Cotizar",
    hero_title_1: "Carros de Golf Eléctricos",
    hero_title_2: "Entrega Inmediata en Colombia",
    hero_desc: "Ideales para hoteles, clubes, fincas y resorts. Quedan pocas unidades disponibles.",
    hero_btn_models: "Ver unidades disponibles",
    hero_btn_catalog: "Solicitar Catálogo",
    hero_badge_1: "Solo 6 disponibles",
    hero_badge_2: "Entrega inmediata",
    hero_badge_3: "Despacho nacional",
    hero_reel_btn: "Ver carros en acción",
    hero_reel_sub: "EV-GOLF en movimiento · 17s",
    reel_tap_sound: "Toca para activar el sonido",
    cat_badge: "Unidades disponibles",
    cat_title_1: "Elige tu EV-GOLF",
    cat_desc: "Disponibilidad inmediata en Colombia. Carros de golf eléctricos premium para movilidad cómoda y silenciosa en grandes espacios privados.",
    prod_series: "Entrega inmediata",
    prod_4_title: "4 Puestos Luxury Edition",
    prod_4_desc: "Compacto, elegante y robusto. Ideal para recorridos internos en fincas, condominios y clubes. Unidad nueva, lista para entrega inmediata.",
    prod_6_title: "6 Puestos Family Resort",
    prod_6_desc: "Mayor capacidad para transportar visitantes o equipos. Perfecto para hoteles, clubes y resorts. Unidad nueva, lista para entrega inmediata.",
    prod_price_label: "Precio",
    prod_launch: "Precio de lanzamiento",
    prod_launch_sub: "Pocas unidades disponibles",
    prod_btn_tech: "Ver ficha técnica",
    prod_btn_buy: "Me interesa",
    prod_btn_personalize: "Personalizar Diseño",
    prod_btn_video: "Ver video",
    prod_video_tag: "Video Comercial",
    prod_4_customize: "Configurar 4 Puestos",
    prod_6_customize: "Configurar 6 Puestos",
    innovation_label: "Ficha técnica",
    features_engineering: "Tecnología y confort",
    features_title: "Diseñados para moverse mejor",
    features_subtitle: "Movilidad eléctrica premium",
    features_desc: "EV-GOLF combina diseño, comodidad y operación eléctrica silenciosa para mejorar la movilidad dentro de espacios privados. Practicidad, presencia y eficiencia.",
    feat_1_title: "Operación silenciosa",
    feat_1_desc: "Recorridos internos sin ruido",
    feat_2_title: "Conducción práctica",
    feat_2_desc: "Fácil manejo para tu equipo",
    feat_3_title: "Interior cómodo",
    feat_3_desc: "Asientos premium en cuero",
    feat_4_title: "Uso versátil",
    feat_4_desc: "Fincas, hoteles, clubes y más",
    info_logistics_title: "Entrega Inmediata",
    info_logistics_desc: "Carros de golf eléctricos nuevos disponibles en Colombia. Coordinamos el despacho hasta tu ciudad.",
    info_finance_title: "Métodos de Pago",
    info_finance_desc: "No ofrecemos financiación: la compra es de contado. Aceptamos varios medios de pago:",
    info_warranty_title: "Garantía de Fábrica",
    info_warranty_desc: "1 año de garantía de fábrica en todas las piezas.",
    usos_label: "Ideales para",
    usos_title: "Movilidad para grandes espacios",
    usos_desc: "No es solo un carro de golf: es una solución de movilidad eléctrica premium para espacios privados y proyectos turísticos.",
    footer_desc: "Carros de golf eléctricos nuevos con entrega inmediata en Colombia. Unidades premium para hoteles, clubes, fincas y proyectos turísticos.",
    footer_tag_1: "Entrega inmediata",
    footer_tag_2: "Garantía 1 año",
    footer_tag_3: "Despacho nacional",
    footer_tag_4: "Asesoría por WhatsApp",
    footer_copy: "© EV-GOLF Colombia | Carros de golf eléctricos con entrega inmediata en Colombia",
    modal_tech_spec: "Especificaciones Técnicas",
    modal_secure: "Visualización Segura - No disponible para descarga",
    modal_close: "Cerrar Visualización",
    modal_copyright: "Propiedad intelectual reservada EV-GOLF Colombia",
    wa_msg_4: "Hola EV-GOLF, me interesa el 4 Puestos Luxury Edition ($55.900.000 COP). Quiero fotos, videos, ficha técnica y disponibilidad para entrega inmediata.",
    wa_msg_6: "Hola EV-GOLF, me interesa el 6 Puestos Family Resort ($59.900.000 COP). Quiero fotos, videos, ficha técnica y disponibilidad para entrega inmediata.",
    wa_msg_nav: "Hola EV-GOLF, quiero hablar con un asesor sobre los carros de golf eléctricos con entrega inmediata en Colombia.",
    p_4_feat: ["Capacidad para 4 personas", "Motor eléctrico 3.5 KW", "Batería de litio 72V – 100AH", "Autonomía 80–90 km · 35 km/h", "Pantalla HD 9\" + Cámara de reversa", "Luces LED y direccionales · Bluetooth", "Suspensión independiente MacPherson", "Llantas Off Road rin 14\" · Frenos hidráulicos", "Asientos premium en cuero"],
    p_6_feat: ["Capacidad para 6 personas", "Motor eléctrico 3.5 KW", "Batería de litio premium 72V – 100AH", "Autonomía 80–90 km · 35 km/h", "Pantalla HD 9\" + Cámara de reversa", "Luces LED y direccionales · Bluetooth", "Suspensión independiente MacPherson", "Llantas Off Road rin 14\" · Frenos hidráulicos", "Asientos premium en cuero"],
    
    // Configurator Translation Items
    config_title: "Configurador Personalizado",
    config_subtitle: "Diseña tu EV-GOLF",
    config_desc: "Elige modelo, color e interior y envía tu configuración por WhatsApp. Un asesor confirma disponibilidad, fotos, ficha técnica y despacho.",
    config_nav_btn: "Personalizar",
    config_model: "1. Selecciona tu Modelo",
    config_color: "2. Color de Pintura Exterior",
    config_interior: "3. Tono del Cuero Interior (Premium)",
    config_accessories: "4. Accesorios Premium Incorporados",
    config_included: "Incluido",
    config_summary: "Resumen de tu Configuración",
    config_base_price: "Precio Base de Unidad",
    config_extras: "Accesorios y Acabados",
    config_total: "Precio Especial Estimado",
    config_finance_calc: "Simulador Financiero Integrado",
    config_down_payment: "Cuota Inicial (30% - 80%)",
    config_months: "Plazo para Financiación",
    config_monthly_quota: "Cuota de Pago Mensual",
    config_interest: "Amortización con tasa preferencial del 1.2% m.v. (aprobación ágil)",
    config_request_whatsapp: "Enviar Configuración por WhatsApp",
    config_months_count: "{{months}} meses",
    config_color_gold: "Champaña Metalizado Premium (De fábrica)",
    config_color_black: "Negro Obsidiana Ultra-Gloss",
    config_color_white: "Blanco Perlado Premium",
    config_color_green: "Verde Británico de Carreras",
    config_interior_cognac: "Cuero Cognac Imperial",
    config_interior_red: "Cuero Rojo Borgoña Imperial",
    config_acc_audio: "Sonido Envolvente Bluetooth JBL Premium",
    config_acc_windshield: "Vidrio Parabrisas Abatible Antifricción",
    config_acc_rain: "Carpeta de Clima Impermeable Premium",
    config_acc_wheels: "Rines de Lujo 14\" en Negro Satinado",
    video_title: "Experiencia en Movimiento",
    video_subtitle: "Visualiza su Desempeño",
    video_desc: "Mira todos los detalles del nuevo EV-GOLF en acción a través de nuestra presentación premium.",
  },
  en: {
    nav_contact: "Get a quote",
    hero_title_1: "Electric Golf Carts",
    hero_title_2: "Immediate Delivery in Colombia",
    hero_desc: "Ideal for hotels, clubs, estates and resorts. Only a few units left.",
    hero_btn_models: "View available units",
    hero_btn_catalog: "Request Catalog",
    hero_badge_1: "Only 6 available",
    hero_badge_2: "Immediate delivery",
    hero_badge_3: "Nationwide shipping",
    hero_reel_btn: "Watch them in action",
    hero_reel_sub: "EV-GOLF in motion · 17s",
    reel_tap_sound: "Tap to turn on sound",
    cat_badge: "Available units",
    cat_title_1: "Choose your EV-GOLF",
    cat_desc: "Immediate availability in Colombia. Premium electric golf carts for comfortable, silent mobility across large private spaces.",
    prod_series: "Immediate delivery",
    prod_4_title: "4-Seat Luxury Edition",
    prod_4_desc: "Compact, elegant and rugged. Ideal for internal routes at estates, condos and clubs. Brand-new unit, ready for immediate delivery.",
    prod_6_title: "6-Seat Family Resort",
    prod_6_desc: "Greater capacity to move guests or teams. Perfect for hotels, clubs and resorts. Brand-new unit, ready for immediate delivery.",
    prod_price_label: "Price",
    prod_launch: "Launch price",
    prod_launch_sub: "Few units available",
    prod_btn_tech: "View technical sheet",
    prod_btn_buy: "I'm interested",
    prod_btn_personalize: "Personalize Design",
    prod_btn_video: "Watch video",
    prod_video_tag: "Commercial Video",
    prod_4_customize: "Configure 4-Seat",
    prod_6_customize: "Configure 6-Seat",
    innovation_label: "Technical sheet",
    features_engineering: "Technology & comfort",
    features_title: "Designed to move better",
    features_subtitle: "Premium electric mobility",
    features_desc: "EV-GOLF blends design, comfort and silent electric operation to improve mobility within private spaces. Practicality, presence and efficiency.",
    feat_1_title: "Silent operation",
    feat_1_desc: "Quiet internal routes",
    feat_2_title: "Easy to drive",
    feat_2_desc: "Simple handling for your team",
    feat_3_title: "Comfortable interior",
    feat_3_desc: "Premium leather seats",
    feat_4_title: "Versatile use",
    feat_4_desc: "Estates, hotels, clubs and more",
    info_logistics_title: "Immediate Delivery",
    info_logistics_desc: "New electric golf carts available in Colombia. We coordinate shipping to your city.",
    info_finance_title: "Payment Methods",
    info_finance_desc: "We don't offer financing: purchase is paid in full. We accept several payment methods:",
    info_warranty_title: "Factory Warranty",
    info_warranty_desc: "1-year factory warranty on all parts.",
    usos_label: "Ideal for",
    usos_title: "Mobility for large spaces",
    usos_desc: "It's more than a golf cart: it's a premium electric mobility solution for private spaces and tourism projects.",
    footer_desc: "Brand-new electric golf carts with immediate delivery in Colombia. Premium units for hotels, clubs, estates and tourism projects.",
    footer_tag_1: "Immediate delivery",
    footer_tag_2: "1-year warranty",
    footer_tag_3: "Nationwide shipping",
    footer_tag_4: "WhatsApp support",
    footer_copy: "© EV-GOLF Colombia | Electric golf carts with immediate delivery in Colombia",
    modal_tech_spec: "Technical Specifications",
    modal_secure: "Secure Viewing - Not available for download",
    modal_close: "Close Viewer",
    modal_copyright: "Intellectual Property Reserved EV-GOLF Colombia",
    wa_msg_4: "Hi EV-GOLF, I'm interested in the 4-Seat Luxury Edition ($55,900,000 COP). I'd like photos, videos, the technical sheet and availability for immediate delivery.",
    wa_msg_6: "Hi EV-GOLF, I'm interested in the 6-Seat Family Resort ($59,900,000 COP). I'd like photos, videos, the technical sheet and availability for immediate delivery.",
    wa_msg_nav: "Hello EV-GOLF, I'd like to talk to an advisor about the electric golf carts with immediate delivery in Colombia.",
    p_4_feat: ["4-passenger capacity", "3.5 KW electric motor", "Lithium battery 72V – 100AH", "Range 80–90 km · 35 km/h", "9\" HD screen + reverse camera", "Full LED lights · Bluetooth", "Independent MacPherson suspension", "14\" Off Road tires · hydraulic brakes", "Premium leather seats"],
    p_6_feat: ["6-passenger capacity", "3.5 KW electric motor", "Premium lithium battery 72V – 100AH", "Range 80–90 km · 35 km/h", "9\" HD screen + reverse camera", "Full LED lights · Bluetooth", "Independent MacPherson suspension", "14\" Off Road tires · hydraulic brakes", "Premium leather seats"],

    // Configurator English Items
    config_title: "Interactive Configurator",
    config_subtitle: "Design Your EV-GOLF",
    config_desc: "Pick model, color and interior and send your configuration via WhatsApp. An advisor confirms availability, photos, the technical sheet and shipping.",
    config_nav_btn: "Personalize",
    config_model: "1. Select Your Model",
    config_color: "2. Premium Exterior Color",
    config_interior: "3. Interior Leather Options",
    config_accessories: "4. Included Premium Accessories",
    config_included: "Included",
    config_summary: "Your Custom Configuration",
    config_base_price: "Base Vehicle Price",
    config_extras: "Selected Accessories & Trim",
    config_total: "Estimated Premium Price",
    config_finance_calc: "Integrated Finance Simulator",
    config_down_payment: "Down Payment (30% - 80%)",
    config_months: "Financing Terms",
    config_monthly_quota: "Estimated Monthly Payment",
    config_interest: "Amortization calculated on exclusive 1.1% monthly interest rate",
    config_request_whatsapp: "Send Details via WhatsApp",
    config_months_count: "{{months}} months",
    config_color_gold: "Metallic Champagne Premium (Standard)",
    config_color_black: "Glossy Obsidian Black",
    config_color_white: "Glistening Pearl White Premium",
    config_color_green: "Classic British Racing Green",
    config_interior_cognac: "Imperial Cognac Leather",
    config_interior_red: "Imperial Burgundy Red Leather",
    config_acc_audio: "JBL Premium Bluetooth Surround Sound System",
    config_acc_windshield: "Impact-Resistant Folding Windshield",
    config_acc_rain: "Premium Weatherproof Rain Enclosure",
    config_acc_wheels: "14\" Satin Black Luxury Rims",
    video_title: "Experience in Motion",
    video_subtitle: "Visualize its Performance",
    video_desc: "Watch the premium EV-GOLF in action through our interactive showcase.",
  }
};

// Sub-component for Product Image Slider
const ImageSlider = ({ images }: { images: string[] }) => {
  const [current, setCurrent] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const nextSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrent(current === images.length - 1 ? 0 : current + 1);
  };

  const prevSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrent(current === 0 ? images.length - 1 : current - 1);
  };

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) nextSlide();
    if (isRightSwipe) prevSlide();
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div 
      className="relative w-full h-full overflow-hidden group select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {images.map((img, idx) => (
          <div key={idx} className="min-w-full h-full flex items-center justify-center bg-gray-50">
            <img 
              src={img} 
              alt={`Slide ${idx + 1}`} 
              className="w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm text-navy w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md z-10 hover:bg-white"
        aria-label="Anterior"
      >
        <i className="fas fa-chevron-left text-xs"></i>
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm text-navy w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md z-10 hover:bg-white"
        aria-label="Siguiente"
      >
        <i className="fas fa-chevron-right text-xs"></i>
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={(e) => { e.stopPropagation(); setCurrent(idx); }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              current === idx ? 'w-6 bg-luxuryGold' : 'w-1.5 bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// Reel-style video player (Modal). Reutilizable: hero y cada modelo.
type VideoConfig = { url: string, poster?: string, title?: string, subtitle?: string, vertical?: boolean };
const VideoModal = ({ video, onClose, t }: { video: VideoConfig | null, onClose: () => void, t: any }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [loading, setLoading] = useState(true);
  const url = video?.url || "";
  const vertical = video?.vertical ?? true;
  const embedUrl = toEmbedUrl(url);
  const isDirectFile = Boolean(url) && !embedUrl;

  // Lock body scroll + close on Escape while open.
  useEffect(() => {
    if (!video) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    // Sonido primero: intenta reproducir CON audio (funciona si se abrió por un clic).
    // Si el navegador lo bloquea (ej. deep-link sin interacción), cae a silencio.
    setPlaying(true);
    setLoading(true);
    const v = videoRef.current;
    if (v) {
      v.currentTime = 0;
      v.muted = false;
      setMuted(false);
      v.play().then(() => {
        if (!v.muted) setMuted(false);
      }).catch(() => {
        v.muted = true;
        setMuted(true);
        v.play().catch(() => {});
      });
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', onKey);
      if (v) v.pause();
    };
  }, [video, onClose]);

  if (!video) return null;

  const frameClasses = vertical
    ? "relative h-[85vh] max-h-[820px] aspect-[9/16] rounded-[2.25rem] overflow-hidden bg-black border border-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] ring-1 ring-luxuryGold/20 animate-in zoom-in-95 duration-300"
    : "relative w-full max-w-4xl aspect-video rounded-[1.75rem] overflow-hidden bg-black border border-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] ring-1 ring-luxuryGold/20 animate-in zoom-in-95 duration-300";

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-luxuryGold/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Close */}
      <button
        onClick={onClose}
        aria-label={t('modal_close')}
        className="absolute top-5 right-5 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-luxuryGold hover:text-navy backdrop-blur-md transition-all duration-300 border border-white/10"
      >
        <i className="fas fa-times text-lg"></i>
      </button>

      {/* Video frame */}
      <div className={frameClasses}>
        {embedUrl ? (
          <iframe
            src={`${embedUrl}${embedUrl.includes('?') ? '&' : '?'}autoplay=1`}
            title={video.title || 'EV-GOLF'}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : isDirectFile ? (
          <>
            <video
              ref={videoRef}
              src={url}
              poster={video.poster || undefined}
              className="absolute inset-0 w-full h-full object-cover cursor-pointer"
              playsInline
              loop
              autoPlay
              muted
              onClick={togglePlay}
              onLoadStart={() => setLoading(true)}
              onWaiting={() => setLoading(true)}
              onCanPlay={() => setLoading(false)}
              onPlaying={() => setLoading(false)}
            />

            {/* Spinner de carga / buffering */}
            {loading && (
              <div className="absolute inset-0 z-[15] flex items-center justify-center bg-black/40 pointer-events-none">
                <span className="w-14 h-14 rounded-full border-[3px] border-white/25 border-t-luxuryGold animate-spin" />
              </div>
            )}

            {/* Top gradient + brand */}
            <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-black/70 to-transparent pointer-events-none" />
            <div className="absolute top-5 left-5 flex items-center gap-2 text-white font-black tracking-tighter text-lg pointer-events-none">
              <span>EV</span><span className="text-luxuryGold">-GOLF</span>
            </div>

            {/* Bottom gradient + caption */}
            <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
            <div className="absolute bottom-6 left-5 right-20 pointer-events-none">
              {video.subtitle && <p className="text-luxuryGold text-[10px] font-bold uppercase tracking-[0.3em] mb-1">{video.subtitle}</p>}
              {video.title && <p className="text-white text-base font-bold leading-tight">{video.title}</p>}
            </div>

            {/* Play overlay when paused (no mientras carga) */}
            {!playing && !loading && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/20 z-10"
                aria-label="Play"
              >
                <span className="w-20 h-20 rounded-full bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center text-white">
                  <i className="fas fa-play text-2xl ml-1"></i>
                </span>
              </button>
            )}

            {/* Mute toggle */}
            <button
              onClick={toggleMute}
              aria-label="Sound"
              className="absolute bottom-6 right-5 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white flex items-center justify-center hover:bg-luxuryGold hover:text-navy transition-all duration-300"
            >
              <i className={`fas ${muted ? 'fa-volume-xmark' : 'fa-volume-high'} text-base`}></i>
            </button>

            {/* Tap-to-unmute hint */}
            {muted && !loading && (
              <button
                onClick={toggleMute}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center gap-2 bg-black/55 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-full border border-white/15 animate-pulse"
              >
                <i className="fas fa-volume-high text-luxuryGold"></i>
                {t('reel_tap_sound')}
              </button>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs uppercase tracking-widest">
            {t('video_subtitle')}
          </div>
        )}
      </div>
    </div>
  );
};

// Component for Technical Sheet Viewer (Modal)
const TechnicalSheetModal = ({ isOpen, onClose, title, pages, t }: { isOpen: boolean, onClose: () => void, title: string, pages: string[], t: any }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 's')) {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleContextMenu = (e: React.MouseEvent) => e.preventDefault();

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 select-none" 
      onContextMenu={handleContextMenu}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-navy/95 backdrop-blur-xl transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-4xl h-full max-h-[92vh] rounded-[2rem] overflow-hidden flex flex-col luxury-shadow animate-in fade-in zoom-in duration-300">
        {/* Header - Fixed */}
        <div className="flex justify-between items-center p-6 md:p-8 border-b border-gray-100 bg-white sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-softGray rounded-2xl flex items-center justify-center text-luxuryGold">
              <i className="fas fa-file-contract text-xl"></i>
            </div>
            <div>
              <span className="text-luxuryGold font-bold text-[10px] uppercase tracking-[0.3em] block mb-0.5">{t('modal_tech_spec')}</span>
              <h3 className="text-lg md:text-xl font-black text-navy uppercase tracking-tighter leading-tight">{title}</h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-softGray text-navy hover:bg-navy hover:text-white transition-all duration-300 shadow-sm"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Content - Protected Viewer */}
        <div className="flex-grow overflow-y-auto bg-gray-100/50 p-4 md:p-8 space-y-8 scroll-smooth scrollbar-hide relative">
          <div className="max-w-3xl mx-auto space-y-10 technical-sheet">
            {pages.map((page, idx) => (
              <div 
                key={idx} 
                className="relative bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-xl overflow-hidden"
              >
                <img 
                  src={page} 
                  alt={`${title} - pág ${idx + 1}`} 
                  className="w-full h-auto object-contain select-none pointer-events-none block mx-auto"
                  draggable={false}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-transparent z-10" />
                <div className="absolute top-4 right-4 bg-navy/10 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-bold text-navy uppercase tracking-widest">
                  Pág {idx + 1}
                </div>
              </div>
            ))}
          </div>
          
          <div className="py-16 text-center">
            <div className="w-12 h-1 bg-luxuryGold/20 mx-auto mb-6 rounded-full"></div>
            <p className="text-gray-400 text-[9px] font-bold tracking-[0.5em] uppercase">{t('modal_copyright')}</p>
          </div>
        </div>

        {/* Action Footer - Fixed */}
        <div className="bg-softGray border-t border-gray-100 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-navy/40">
            <i className="fas fa-shield-alt text-sm"></i>
            <span className="text-[10px] font-bold uppercase tracking-widest">{t('modal_secure')}</span>
          </div>
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-navy text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-luxuryGold transition-all duration-300 shadow-lg"
          >
            {t('modal_close')}
          </button>
        </div>
      </div>
    </div>
  );
};

// Reusable Components
const Navbar = ({ t, lang, setLang, onLead }: { t: any, lang: string, setLang: (l: string) => void, onLead: (loc: string) => void }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <a
          href="#top"
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          aria-label="EV-GOLF — Inicio"
          className="text-2xl font-bold tracking-tighter flex items-center gap-2 shrink-0 whitespace-nowrap cursor-pointer"
        >
          <span className={`transition-colors duration-300 ${!isScrolled ? 'text-white' : 'text-navy'}`}>EV</span>
          <span className="text-luxuryGold">-GOLF</span>
        </a>
        
        <div className="flex items-center gap-4 md:gap-8">
          <a
            href="#configurar"
            className={`hidden md:inline text-xs font-bold uppercase tracking-widest hover:text-luxuryGold transition-all ${
              !isScrolled ? 'text-white' : 'text-navy'
            }`}
          >
            {t('config_nav_btn')}
          </a>

          {/* Language Selector */}
          <div className="flex items-center bg-black/5 rounded-full px-4 py-1.5 backdrop-blur-sm" aria-label="Language selector">
            <button 
              onClick={() => setLang('es')}
              className={`text-[10px] font-bold uppercase tracking-widest transition-all ${lang === 'es' ? 'text-luxuryGold' : 'text-gray-400'}`}
            >
              ES
            </button>
            <span className="mx-2 text-gray-300">|</span>
            <button 
              onClick={() => setLang('en')}
              className={`text-[10px] font-bold uppercase tracking-widest transition-all ${lang === 'en' ? 'text-luxuryGold' : 'text-gray-400'}`}
            >
              EN
            </button>
          </div>

          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t('wa_msg_nav'))}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onLead('navbar')}
            className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-green-700 transition-colors shadow-lg"
          >
            <i className="fab fa-whatsapp text-xl"></i>
            <span>{t('nav_contact')}</span>
          </a>
        </div>
      </div>
    </nav>
  );
};

const Hero = ({ t, onOpenReel }: { t: any, onOpenReel: () => void }) => {
  return (
    <section className="relative min-h-screen py-24 md:py-0 flex items-center md:h-screen pt-24 md:pt-16 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="/media/hero-cover.jpg"
          alt="Carro de golf eléctrico EV-GOLF en campo de golf, disponible en Colombia"
          fetchPriority="high"
          className="w-full h-full object-cover object-[72%_center] brightness-[0.82] hero-zoom"
        />
        {/* Gradient overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy/85 via-navy/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/55 via-transparent to-transparent" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-2xl">
          <h1 className="hero-in text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-[1.1] mb-5 tracking-tight">
            {t('hero_title_1')} <span className="text-luxuryGold block mt-1">{t('hero_title_2')}</span>
          </h1>
          <p className="hero-in text-lg md:text-xl text-gray-200 mb-7 font-light leading-relaxed" style={{ animationDelay: '120ms' }}>
            {t('hero_desc')}
          </p>

          {/* Trust / scarcity badges */}
          <div className="hero-in flex flex-wrap gap-3 mb-9" style={{ animationDelay: '240ms' }}>
            {[t('hero_badge_1'), t('hero_badge_2'), t('hero_badge_3')].map((b, i) => (
              <span key={i} className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] md:text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full">
                <i className="fas fa-circle-check text-luxuryGold text-xs"></i>
                {b}
              </span>
            ))}
          </div>

          <div className="hero-in flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8" style={{ animationDelay: '360ms' }}>
            <a
              href="#modelos"
              className="bg-luxuryGold text-navy px-8 py-4 rounded-md text-base font-bold text-center hover:brightness-105 transition-all luxury-shadow uppercase tracking-wider shrink-0"
            >
              {t('hero_btn_models')}
            </a>

            {/* Reel video trigger */}
            <button
              type="button"
              onClick={onOpenReel}
              className="group flex items-center gap-4 focus:outline-none"
              aria-label={t('hero_reel_btn')}
            >
              <span className="relative flex items-center justify-center shrink-0 w-14 h-14">
                <span className="absolute inset-0 rounded-full bg-luxuryGold/30 animate-ping" />
                <span className="absolute inset-0 rounded-full border border-luxuryGold/40 scale-125 group-hover:scale-150 transition-transform duration-500" />
                <span className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-luxuryGold shadow-[0_8px_30px_rgba(197,160,89,0.45)] flex items-center justify-center bg-navy">
                  <img src={VIDEO_POSTER} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                  <i className="fas fa-play text-luxuryGold text-base relative ml-0.5 drop-shadow-lg group-hover:scale-110 transition-transform" />
                </span>
              </span>
              <span className="text-left">
                <span className="block text-white font-bold uppercase tracking-[0.2em] text-sm group-hover:text-luxuryGold transition-colors">
                  {t('hero_reel_btn')}
                </span>
                <span className="block text-gray-300 text-xs font-light mt-0.5">
                  {t('hero_reel_sub')}
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

// Precio con count-up al entrar en viewport (seguro: muestra el valor final si no se dispara)
const AnimatedPrice = ({ value, className }: { value: number, className?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const fmt = (n: number) => "$" + Math.round(n).toLocaleString("es-CO") + " COP";
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let started = false;
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const run = () => {
      if (started) return;
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.92 && r.bottom > 0) {
        started = true;
        window.removeEventListener("scroll", run);
        if (reduce) { el.textContent = fmt(value); return; }
        const dur = 1100, t0 = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - t0) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = fmt(value * eased);
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = fmt(value);
        };
        requestAnimationFrame(tick);
      }
    };
    window.addEventListener("scroll", run, { passive: true });
    run();
    const safety = setTimeout(() => { if (!started) el.textContent = fmt(value); }, 3000);
    return () => { window.removeEventListener("scroll", run); clearTimeout(safety); };
  }, [value]);
  return <span ref={ref} className={className}>{fmt(value)}</span>;
};

const ProductCard = ({ title, description, features, price, priceValue, oldPrice, images, badge, waLink, onOpenTechSheet, onPersonalize, onWatchVideo, onLead, t }: {
  title: string,
  description: string,
  features: string[],
  price: string,
  priceValue: number,
  oldPrice?: string,
  images: string[],
  badge: string,
  waLink: string,
  onOpenTechSheet: () => void,
  onPersonalize: () => void,
  onWatchVideo: () => void,
  onLead: () => void,
  t: any
}) => (
  <div className="bg-white rounded-3xl overflow-hidden luxury-shadow card-hover border border-gray-100 flex flex-col h-full group">
    <div className="relative h-[240px] sm:h-[300px] overflow-hidden">
      <ImageSlider images={images} />
      <div className="absolute top-6 right-6 bg-navy text-luxuryGold px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl border border-luxuryGold/30 z-20">
        {badge}
      </div>

      {/* Watch commercial video */}
      <button
        onClick={onWatchVideo}
        aria-label={t('prod_btn_video')}
        className="group/vid absolute top-6 left-6 z-20 flex items-center gap-2.5 pl-2 pr-4 py-2 rounded-full bg-navy/80 backdrop-blur-md border border-luxuryGold/30 text-white shadow-xl hover:bg-luxuryGold hover:text-navy transition-all duration-300"
      >
        <span className="relative flex items-center justify-center w-7 h-7 rounded-full bg-luxuryGold text-navy shrink-0">
          <span className="absolute inset-0 rounded-full bg-luxuryGold/50 animate-ping" />
          <i className="fas fa-play text-[10px] ml-0.5 relative"></i>
        </span>
        <span className="text-[10px] font-black uppercase tracking-[0.15em]">{t('prod_btn_video')}</span>
      </button>
    </div>
    <div className="p-6 sm:p-8 flex-grow flex flex-col">
      <div className="mb-3">
        <span className="text-luxuryGold font-bold text-xs uppercase tracking-widest">{t('prod_series')}</span>
        <h3 className="text-2xl font-bold text-navy mt-1 tracking-tight">{title}</h3>
      </div>
      <p className="text-gray-500 mb-6 font-light leading-relaxed text-sm">{description}</p>

      {/* Ficha técnica — 2 columnas compactas */}
      <div className="mb-7 flex-grow">
        <p className="text-[10px] font-bold text-luxuryGold uppercase tracking-[0.2em] mb-3">{t('innovation_label')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2.5">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-gray-700 text-[13px] leading-snug">
              <i className="fas fa-check text-luxuryGold text-[10px] mt-1 shrink-0"></i>
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-6 text-center bg-gray-50 -mx-6 -mb-6 p-6 sm:-mx-8 sm:-mb-8 sm:p-8 font-sans">
        <p className="text-[10px] text-luxuryGold uppercase tracking-[0.2em] mb-1.5 font-bold">{t('prod_launch')}</p>
        <div className="flex items-baseline justify-center gap-3 mb-2">
          {oldPrice && <span className="text-base sm:text-lg text-gray-400 line-through font-semibold">{oldPrice}</span>}
          <AnimatedPrice value={priceValue} className="text-3xl sm:text-4xl font-black text-navy tracking-tighter" />
        </div>
        <p className="inline-flex items-center gap-1.5 text-[10px] font-bold text-navy/70 uppercase tracking-wider mb-5">
          <i className="fas fa-bolt text-luxuryGold soft-pulse"></i>
          {t('prod_launch_sub')}
        </p>

        {/* CTA principal */}
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onLead}
          className="flex items-center justify-center gap-2 w-full bg-navy text-white py-4 rounded-xl font-bold hover:bg-opacity-95 transition-all uppercase tracking-[0.15em] text-sm luxury-shadow"
        >
          <i className="fab fa-whatsapp text-lg"></i>
          {t('prod_btn_buy')}
        </a>

        {/* Secundarios en fila */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <button
            onClick={onPersonalize}
            className="flex items-center justify-center gap-2 bg-luxuryGold/10 border border-luxuryGold/30 text-navy py-3 rounded-xl font-bold hover:bg-luxuryGold/20 transition-all uppercase tracking-wider text-[10px]"
          >
            <i className="fas fa-sliders-h text-luxuryGold"></i>
            {t('prod_btn_personalize')}
          </button>
          <button
            onClick={onOpenTechSheet}
            className="flex items-center justify-center gap-2 border border-navy/10 text-navy/60 py-3 rounded-xl font-bold hover:bg-navy/5 transition-all uppercase tracking-wider text-[10px]"
          >
            <i className="fas fa-file-invoice text-luxuryGold"></i>
            {t('prod_btn_tech')}
          </button>
        </div>
      </div>
    </div>
  </div>
);

const Configurator = ({ 
  t,
  lang,
  selectedModel,
  onSelectModel,
  selectedColor,
  setSelectedColor,
  selectedInterior,
  setSelectedInterior,
  selectedAcc,
  setSelectedAcc
}: {
  t: any,
  lang: string,
  selectedModel: string,
  onSelectModel: (m: string) => void,
  selectedColor: string,
  setSelectedColor: (c: string) => void,
  selectedInterior: string,
  setSelectedInterior: (i: string) => void,
  selectedAcc: string[],
  setSelectedAcc: any
}) => {
  // Component price configurations
  const basePrices: Record<string, number> = {
    "4-seat": 55900000,
    "6-seat": 59900000,
  };

  // Colores disponibles: Blanco y Negro, ambos sin costo adicional.
  const colorPrices: Record<string, number> = {
    "white": 0,
    "black": 0,
  };

  // Acc prices. "name" = título corto legible; "label" = descripción larga.
  const accessories = [
    { key: "audio", name: lang === "es" ? "Audio JBL Premium" : "JBL Premium Audio", label: t("config_acc_audio"), price: 0, icon: "fa-music" },
    { key: "windshield", name: lang === "es" ? "Parabrisas Abatible" : "Folding Windshield", label: t("config_acc_windshield"), price: 0, icon: "fa-shield-halved" },
    { key: "rain", name: lang === "es" ? "Carpeta de Clima" : "Rain Enclosure", label: t("config_acc_rain"), price: 0, icon: "fa-cloud-showers-heavy" },
    { key: "wheels", name: lang === "es" ? "Rines de Lujo 14\"" : "14\" Luxury Rims", label: t("config_acc_wheels"), price: 0, icon: "fa-circle-dot" },
  ];

  // Helper formatting for currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }).format(val);
  };

  const basePrice = basePrices[selectedModel] || 0;
  const colorAddedPrice = colorPrices[selectedColor] || 0;
  const accPriceTotal = accessories
    .filter(a => selectedAcc.includes(a.key))
    .reduce((sum, item) => sum + item.price, 0);

  const totalPrice = basePrice + colorAddedPrice + accPriceTotal;

  // Color detail metadata (solo Blanco y Negro disponibles).
  const colorsList = [
    { key: "white", hex: "#EDEDED", label: t("config_color_white") },
    { key: "black", hex: "#1A1A1A", label: t("config_color_black") },
  ];

  const interiorList = [
    { key: "cognac", hex: "#8B5A2B", label: t("config_interior_cognac") },
    { key: "red", hex: "#7C1C24", label: t("config_interior_red") },
  ];

  const colorShortNames: Record<string, Record<string, string>> = {
    es: { white: "Blanco", black: "Negro" },
    en: { white: "White", black: "Black" },
  };

  const interiorShortNames: Record<string, Record<string, string>> = {
    es: { cognac: "Cognac", red: "Rojo" },
    en: { cognac: "Cognac", red: "Red" },
  };

  // Image mapping (solo Blanco y Negro).
  const colorImageMap: Record<string, Record<string, string>> = {
    "4-seat": {
      "white": "https://i.ibb.co/x8j57sZD/Gemini-Generated-Image-2lbbyd2lbbyd2lbb.png",
      "black": "https://i.ibb.co/JjSGqV2Y/Chat-GPT-Image-Jan-22-2026-10-09-06-PM.png"
    },
    "6-seat": {
      "white": "https://i.ibb.co/Wpf7knyz/Chat-GPT-Image-Jan-26-2026-04-14-16-PM.png",
      "black": "https://i.ibb.co/gb0QnKdw/Chat-GPT-Image-Jan-26-2026-04-08-12-PM.png"
    }
  };

  const currentPreviewImage = colorImageMap[selectedModel]?.[selectedColor] || colorImageMap[selectedModel]?.["white"] || "";

  const toggleAccessory = (key: string) => {
    setSelectedAcc((prev: string[]) => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  // WhatsApp builder
  const handleWhatsappSubmit = () => {
    const modelName = selectedModel === "4-seat" ? "4 Puestos Luxury Edition" : "6 Puestos Family Resort";
    const eventData = { event_category: "conversion", button_location: "configurator", model: modelName, price: totalPrice, language: lang, lead_value: 1, currency: "COP" };
    trackEvent("configurator_submit", eventData);
    trackEvent("whatsapp_click", { ...eventData, event_category: "lead", event_label: "configurator" });
    trackEvent("generate_lead", { ...eventData, event_label: "whatsapp_lead" });
    // Meta Pixel: configuración enviada = CustomizeProduct + Lead + Contact
    metaTrack("CustomizeProduct", { content_name: modelName, value: 1, currency: "COP" });
    metaTrack("Lead", { content_name: modelName, value: 1, currency: "COP" });
    metaTrack("Contact", { content_name: modelName, value: 1, currency: "COP" });

    const selectedColorName = colorsList.find(c => c.key === selectedColor)?.label || selectedColor;
    const selectedInteriorName = interiorList.find(i => i.key === selectedInterior)?.label || selectedInterior;
    const selectedAccNames = accessories
      .filter(a => selectedAcc.includes(a.key))
      .map(a => a.label)
      .join(", ") || (lang === "es" ? "Ninguno" : "None");

    const message = lang === "es" 
      ? `Hola EV-GOLF Colombia, configuré mi carro de golf eléctrico en el personalizador online:

*Configuración Seleccionada:*
🚗 *Modelo:* ${selectedModel === "4-seat" ? "4 Puestos Luxury Edition" : "6 Puestos Family Resort"}
🎨 *Color Exterior:* ${selectedColorName}
🛋️ *Cojinería:* ${selectedInteriorName}
🛠️ *Accesorios:* ${selectedAccNames}

*Cotización Directa:*
💰 *Precio de Lista Total:* ${formatCurrency(totalPrice)}

Por favor, me gustaría que un asesor confirme disponibilidad de entrega inmediata para compra directa y coordinemos detalles.`
      : `Hello EV-GOLF Colombia, I configured my electric golf cart on your online configurator:

*Selected Setup:*
🚗 *Model:* ${selectedModel === "4-seat" ? "4-Seat Luxury Edition" : "6-Seat Family Resort"}
🎨 *Exterior Paint:* ${selectedColorName}
🛋️ *Interior Leather:* ${selectedInteriorName}
🛠️ *Accessories:* ${selectedAccNames}

*Direct Purchase Estimation:*
💰 *Total List Price:* ${formatCurrency(totalPrice)}

Please connect me with an advisor to verify immediate dispatch availability and coordinate purchase details.`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
  };

  return (
    <section id="configurar" className="py-24 bg-gradient-to-b from-white to-softGray border-t border-gray-100 overflow-hidden font-sans">
      <div className="container mx-auto px-6">
        
        {/* Header */}
        <div className="reveal text-center max-w-3xl mx-auto mb-16">
          <span className="text-luxuryGold font-extrabold tracking-[0.4em] uppercase text-[11px] mb-4 block leading-tight">
            {t("config_title")}
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-navy mb-6 tracking-tight leading-none uppercase">
            {t("config_subtitle")}
          </h2>
          <p className="text-gray-500 font-light leading-relaxed text-base md:text-lg">
            {t("config_desc")}
          </p>
        </div>

        {/* Panel & Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-7xl mx-auto items-stretch">
          
          {/* Left panel: Customizer options (7 cols on desktop) */}
          <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-[2rem] luxury-shadow border border-gray-50 space-y-7">
            
            {/* 1. Model Selector */}
            <div>
              <label className="text-navy font-bold uppercase tracking-wider text-xs block mb-4">
                {t("config_model")}
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => onSelectModel("4-seat")}
                  className={`p-5 rounded-2xl border-2 text-left transition-all duration-300 ${
                    selectedModel === "4-seat" 
                      ? "border-luxuryGold bg-navy/5 text-navy shadow-md" 
                      : "border-gray-100 hover:border-gray-200 text-gray-500"
                  }`}
                >
                  <p className="font-extrabold text-sm uppercase tracking-wider block mb-1">
                    4 {lang === "es" ? "Puestos" : "Seats"}
                  </p>
                  <span className="text-luxuryGold font-bold text-xs">
                    {formatCurrency(basePrices["4-seat"])}
                  </span>
                </button>

                <button
                  onClick={() => onSelectModel("6-seat")}
                  className={`p-5 rounded-2xl border-2 text-left transition-all duration-300 ${
                    selectedModel === "6-seat" 
                      ? "border-luxuryGold bg-navy/5 text-navy shadow-md" 
                      : "border-gray-100 hover:border-gray-200 text-gray-500"
                  }`}
                >
                  <p className="font-extrabold text-sm uppercase tracking-wider block mb-1">
                    6 {lang === "es" ? "Puestos" : "Seats"}
                  </p>
                  <span className="text-luxuryGold font-bold text-xs">
                    {formatCurrency(basePrices["6-seat"])}
                  </span>
                </button>
              </div>
            </div>

            {/* 2. Paint color toggle (Blanco / Negro) */}
            <div>
              <label className="text-navy font-bold uppercase tracking-wider text-xs block mb-3">
                {t("config_color")}
              </label>
              <div className="relative flex p-1.5 rounded-2xl bg-softGray border border-gray-100">
                {/* Sliding highlight */}
                <span
                  className="absolute top-1.5 bottom-1.5 rounded-xl bg-navy shadow-md transition-all duration-300 ease-out"
                  style={{
                    left: selectedColor === "white" ? "0.375rem" : "50%",
                    right: selectedColor === "white" ? "50%" : "0.375rem",
                  }}
                />
                {colorsList.map((color) => {
                  const isActive = selectedColor === color.key;
                  return (
                    <button
                      key={color.key}
                      onClick={() => setSelectedColor(color.key)}
                      aria-pressed={isActive}
                      className={`relative z-10 flex-1 flex items-center justify-center gap-3 py-3.5 rounded-xl transition-colors duration-300 ${
                        isActive ? "text-white" : "text-gray-500 hover:text-navy"
                      }`}
                    >
                      <span
                        className="w-5 h-5 rounded-full border border-black/10 inline-block shadow-sm shrink-0"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-xs font-bold uppercase tracking-[0.15em]">
                        {colorShortNames[lang]?.[color.key] || color.key}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-gray-400 font-light mt-2 text-center">
                {lang === "es" ? "Ambos colores sin costo adicional" : "Both colors at no extra cost"}
              </p>
            </div>

            {/* 3. Interior leather toggle (Cognac / Rojo) */}
            <div>
              <label className="text-navy font-bold uppercase tracking-wider text-xs block mb-2">
                {t("config_interior")}
              </label>
              <p className="text-xs text-gray-400 font-light mb-3">
                {lang === "es" ? "Cuero premium, hipoalergénico e impermeable con microperforación." : "Premium leather, allergy-safe and breathable with micro-perforation."}
              </p>
              <div className="relative flex p-1.5 rounded-2xl bg-softGray border border-gray-100">
                {/* Sliding highlight */}
                <span
                  className="absolute top-1.5 bottom-1.5 rounded-xl bg-navy shadow-md transition-all duration-300 ease-out"
                  style={{
                    left: selectedInterior === "cognac" ? "0.375rem" : "50%",
                    right: selectedInterior === "cognac" ? "50%" : "0.375rem",
                  }}
                />
                {interiorList.map((intOption) => {
                  const isActive = selectedInterior === intOption.key;
                  return (
                    <button
                      key={intOption.key}
                      onClick={() => setSelectedInterior(intOption.key)}
                      aria-pressed={isActive}
                      className={`relative z-10 flex-1 flex items-center justify-center gap-3 py-3.5 rounded-xl transition-colors duration-300 ${
                        isActive ? "text-white" : "text-gray-500 hover:text-navy"
                      }`}
                    >
                      <span
                        className="w-5 h-5 rounded-full border border-black/10 inline-block shadow-sm shrink-0"
                        style={{ backgroundColor: intOption.hex }}
                      />
                      <span className="text-xs font-bold uppercase tracking-[0.15em]">
                        {interiorShortNames[lang]?.[intOption.key] || intOption.key}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Equipamiento incluido (informativo) */}
            <div>
              <label className="text-navy font-bold uppercase tracking-wider text-xs block mb-4">
                {t("config_accessories")}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {accessories.map((acc) => (
                  <div
                    key={acc.key}
                    className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-luxuryGold/[0.06] border border-luxuryGold/20"
                  >
                    <span className="w-8 h-8 rounded-lg bg-luxuryGold/15 text-luxuryGold flex items-center justify-center shrink-0">
                      <i className={`fas ${acc.icon} text-xs`}></i>
                    </span>
                    <span className="text-xs font-bold text-navy leading-tight min-w-0 flex-grow">{acc.name}</span>
                    <i className="fas fa-check-circle text-green-600 text-sm shrink-0"></i>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-gray-400 font-light mt-3 text-center">
                {lang === "es" ? "Equipamiento premium incluido sin costo adicional" : "Premium equipment included at no extra cost"}
              </p>
            </div>

          </div>

          {/* Right panel: Sticky Live Preview and Summary Card (5 cols on desktop) */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 flex flex-col gap-5">
            
            {/* Live Picture Card with option transitions */}
            <div className="bg-white rounded-[2rem] overflow-hidden luxury-shadow border border-gray-50 flex flex-col p-6 items-center justify-center relative">
              <span className="absolute top-6 left-6 bg-navy/5 px-3 py-1 rounded-full text-[9px] font-bold text-navy uppercase tracking-widest">
                {lang === "es" ? "Vista de Diseño" : "Design View"}
              </span>

              {/* Dynamic Image Display with smooth scale animation */}
              <div className="w-full h-[180px] flex items-center justify-center mt-7">
                {currentPreviewImage && (
                  <img
                    key={currentPreviewImage}
                    src={currentPreviewImage}
                    alt="Premium preview of configuration"
                    loading="lazy"
                    className="soft-fade w-full h-full object-contain p-2 max-h-[190px] transition-transform duration-700 hover:scale-105 drop-shadow-xl"
                  />
                )}
              </div>

            </div>

            {/* Total Summary Breakdown Card */}
            <div className="bg-navy text-white rounded-[2rem] p-6 md:p-7 luxury-shadow border border-white/5 relative overflow-hidden font-sans flex-grow flex flex-col">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-luxuryGold/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-luxuryGold/5 rounded-full blur-3xl" />

              {/* Header (centered) */}
              <div className="relative text-center mb-5">
                <div className="w-10 h-10 mx-auto mb-2.5 rounded-xl bg-luxuryGold/10 border border-luxuryGold/20 flex items-center justify-center text-luxuryGold">
                  <i className="fas fa-receipt text-base"></i>
                </div>
                <h3 className="text-sm font-black uppercase tracking-[0.25em] text-white">
                  {t("config_summary")}
                </h3>
              </div>

              {/* Spec grid (2x2) */}
              <div className="relative grid grid-cols-2 gap-2.5 mb-5">
                {/* Model */}
                <div className="bg-white/[0.04] rounded-xl p-3.5 border border-white/5 flex flex-col gap-2">
                  <span className="flex items-center gap-2 text-gray-400 text-[10px] uppercase tracking-[0.15em] font-bold">
                    <i className="fas fa-car-side text-luxuryGold"></i>
                    {lang === "es" ? "Modelo" : "Model"}
                  </span>
                  <span className="text-white text-sm font-extrabold leading-none">
                    {selectedModel === "4-seat" ? (lang === "es" ? "4 Puestos" : "4 Seats") : (lang === "es" ? "6 Puestos" : "6 Seats")}
                  </span>
                </div>

                {/* Color */}
                <div className="bg-white/[0.04] rounded-xl p-3.5 border border-white/5 flex flex-col gap-2">
                  <span className="flex items-center gap-2 text-gray-400 text-[10px] uppercase tracking-[0.15em] font-bold">
                    <i className="fas fa-palette text-luxuryGold"></i>
                    {lang === "es" ? "Color" : "Color"}
                  </span>
                  <span className="flex items-center gap-2 text-white text-sm font-extrabold leading-none">
                    <span className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm shrink-0" style={{ backgroundColor: colorsList.find(c => c.key === selectedColor)?.hex }} />
                    {colorShortNames[lang]?.[selectedColor] || selectedColor}
                  </span>
                </div>

                {/* Interior */}
                <div className="bg-white/[0.04] rounded-xl p-3.5 border border-white/5 flex flex-col gap-2">
                  <span className="flex items-center gap-2 text-gray-400 text-[10px] uppercase tracking-[0.15em] font-bold">
                    <i className="fas fa-couch text-luxuryGold"></i>
                    {lang === "es" ? "Cuero" : "Leather"}
                  </span>
                  <span className="flex items-center gap-2 text-white text-sm font-extrabold leading-none">
                    <span className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm shrink-0" style={{ backgroundColor: interiorList.find(i => i.key === selectedInterior)?.hex }} />
                    {interiorShortNames[lang]?.[selectedInterior] || selectedInterior}
                  </span>
                </div>

                {/* Accessories */}
                <div className="bg-white/[0.04] rounded-xl p-3.5 border border-white/5 flex flex-col gap-2">
                  <span className="flex items-center gap-2 text-gray-400 text-[10px] uppercase tracking-[0.15em] font-bold">
                    <i className="fas fa-gem text-luxuryGold"></i>
                    {lang === "es" ? "Accesorios" : "Accessories"}
                  </span>
                  <span className="flex items-baseline gap-1.5 text-white text-sm font-extrabold leading-none">
                    {selectedAcc.length}
                    <span className="text-luxuryGold text-[10px] font-black uppercase tracking-wider">
                      {lang === "es" ? (selectedAcc.length === 1 ? "incluido" : "incluidos") : "included"}
                    </span>
                  </span>
                </div>
              </div>

              {/* Total = botón dorado (el precio ES el CTA) */}
              <div className="relative pt-5 mt-auto border-t border-white/10">
                <button
                  onClick={handleWhatsappSubmit}
                  className="shine group w-full bg-luxuryGold text-navy rounded-2xl px-5 pt-4 pb-5 shadow-lg hover:shadow-luxuryGold/30 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300"
                  aria-label={t("config_request_whatsapp")}
                >
                  <span className="block text-[10px] uppercase tracking-[0.3em] font-bold text-navy/60 mb-1">
                    {t("config_total")}
                  </span>
                  <span key={totalPrice} className="price-pop block text-3xl md:text-4xl leading-none font-black tracking-tight mb-4">
                    {formatCurrency(totalPrice)}
                  </span>
                  {/* CTA pill (se ve claramente clickeable) */}
                  <span className="flex items-center justify-center gap-2.5 bg-navy text-white rounded-full py-3 px-5 text-xs font-black uppercase tracking-wider shadow-md group-hover:bg-green-600 transition-colors duration-300">
                    <i className="fab fa-whatsapp text-base"></i>
                    {t("config_request_whatsapp")}
                    <i className="fas fa-arrow-right text-[10px] group-hover:translate-x-1 transition-transform"></i>
                  </span>
                </button>

                <p className="text-center text-[10px] text-gray-400 italic mt-3">
                  {lang === "es" ? "IVA e impuestos incluidos" : "Taxes included"}
                </p>
                <p className="text-center text-[9px] text-gray-500 uppercase tracking-widest font-bold mt-1">
                  {lang === "es" ? "Atención VIP • Respuesta inmediata 24/7" : "VIP Support • Fast Response 24/7"}
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

const Features = ({ t, lang }: { t: any, lang: string }) => {
  return (
    <section className="py-24 bg-softGray">
      <div className="container mx-auto px-6">
        <div className="reveal flex flex-col lg:flex-row items-center gap-16">
          <div className="w-full lg:w-1/2">
            <div className="relative group">
              <img
                src="https://i.ibb.co/s9drKn1v/Gemini-Generated-Image-sime9csime9csime.png"
                alt="Interior premium EV-GOLF"
                loading="lazy"
                className="rounded-[2.5rem] luxury-shadow w-full h-[550px] object-cover border-8 border-white"
              />
              <div className="absolute -bottom-6 -right-6 bg-navy text-white p-10 rounded-3xl luxury-shadow border-b-4 border-luxuryGold">
                <p className="text-5xl font-black text-luxuryGold">72V</p>
                <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-300 mt-1">{lang === 'es' ? 'Batería de litio' : 'Lithium battery'}</p>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-1/2">
            <span className="text-luxuryGold font-bold tracking-[0.3em] uppercase text-xs mb-4 block">{t('features_engineering')}</span>
            <h2 className="text-4xl md:text-6xl font-black text-navy mb-8 leading-[1.1]">
              {t('features_title')} <br/><span className="text-luxuryGold">{t('features_subtitle')}</span>
            </h2>
            <p className="text-xl text-gray-500 leading-relaxed mb-10 font-light">
              {t('features_desc')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10">
              {[
                { icon: 'fa-volume-off', title: t('feat_1_title'), desc: t('feat_1_desc') },
                { icon: 'fa-gauge-high', title: t('feat_2_title'), desc: t('feat_2_desc') },
                { icon: 'fa-couch', title: t('feat_3_title'), desc: t('feat_3_desc') },
                { icon: 'fa-layer-group', title: t('feat_4_title'), desc: t('feat_4_desc') }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-5">
                  <div className="bg-white p-4 rounded-2xl shadow-sm text-luxuryGold shrink-0">
                    <i className={`fas ${item.icon} text-2xl`}></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-navy text-lg">{item.title}</h4>
                    <p className="text-sm text-gray-400 font-light">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = ({ t }: { t: any }) => (
  <footer className="bg-navy text-white py-20 border-t border-gray-900">
    <div className="container mx-auto px-6 text-center">
      <div className="text-4xl font-black mb-6 tracking-tighter">
        <span>EV</span>
        <span className="text-luxuryGold">-GOLF</span>
      </div>
      <p className="text-gray-400 mb-10 max-w-lg mx-auto font-light leading-relaxed">{t('footer_desc')}</p>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-16">
        {[
          { icon: 'fa-truck', label: t('footer_tag_1') },
          { icon: 'fa-shield-alt', label: t('footer_tag_2') },
          { icon: 'fa-tools', label: t('footer_tag_3') },
          { icon: 'fa-check-circle', label: t('footer_tag_4') }
        ].map((item, i) => (
          <div key={i} className="flex flex-col items-center group cursor-default">
            <div className="w-12 h-12 rounded-full border border-gray-800 flex items-center justify-center mb-4 transition-colors group-hover:border-luxuryGold group-hover:bg-luxuryGold/10">
              <i className={`fas ${item.icon} text-lg text-luxuryGold`}></i>
            </div>
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">{item.label}</span>
          </div>
        ))}
      </div>
      
      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent mb-10"></div>
      <p className="text-gray-500 text-[10px] tracking-[0.4em] uppercase font-bold">{t('footer_copy')}</p>
    </div>
  </footer>
);

// =============================================================
//  Chat-asistente guiado (preguntas y respuestas) + handoff al asesor
//  Responde dudas al instante y pasa al asesor por WhatsApp CON contexto.
// =============================================================
const ChatAssistant = ({ lang, onLead, onOpenReel }: { lang: string, onLead: (loc: string, extra?: Record<string, any>) => void, onOpenReel?: () => void }) => {
  const es = lang === 'es';
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ from: 'bot' | 'user', text: string }[]>([]);
  const [stage, setStage] = useState<'menu' | 'handoff'>('menu');
  const [topics, setTopics] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [model, setModel] = useState('');
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  const greeting = es
    ? '¡Hola! 👋 Soy el asistente de EV-GOLF. Resuelvo tus dudas al instante. ¿Qué te gustaría saber?'
    : "Hi! 👋 I'm the EV-GOLF assistant. I answer your questions instantly. What would you like to know?";

  // Preguntas y respuestas (controladas — nunca inventa)
  const qa: { key: string, label: string, topic: string, a: string }[] = es ? [
    { key: 'precios', label: '💰 Precios', topic: 'precios', a: 'Precios de lanzamiento 🔥\n🚗 4 Puestos Luxury — $55.900.000 COP\n🚙 6 Puestos Family Resort — $59.900.000 COP\nIncluyen batería de litio, garantía de 1 año y entrega inmediata.' },
    { key: 'negociable', label: '💲 ¿Es negociable?', topic: 'precio', a: 'El precio de lanzamiento ya es un valor especial por tiempo limitado 🔥. Para condiciones particulares o compra de varias unidades, un asesor con gusto revisa opciones contigo. ¿Te comunico con uno? 😊' },
    { key: 'incluye', label: '📦 ¿Qué incluye?', topic: 'qué incluye', a: 'Cada unidad incluye: batería de litio, pantalla HD 9" + cámara de reversa, luces LED y direccionales, Bluetooth, frenos hidráulicos, suspensión independiente MacPherson, llantas rin 14" y asientos premium en cuero. ✅' },
    { key: 'ficha', label: '⚙️ Ficha técnica', topic: 'ficha técnica', a: 'Motor 3.5 KW · Batería litio 72V–100AH · Autonomía 80–90 km · hasta 35 km/h · Pantalla HD 9" + cámara de reversa · Luces LED · Bluetooth · Frenos hidráulicos · Suspensión MacPherson · Llantas rin 14" · Asientos en cuero.' },
    { key: 'bateria', label: '🔋 Batería y carga', topic: 'batería', a: 'Batería de litio 72V–100AH ⚡. Carga rápida en 1 hora o carga normal en 8 horas. Vida útil aproximada de 4 a 7 años antes de cambiarla. Autonomía de 80–90 km por carga (hasta 35 km/h) y se recarga en un tomacorriente convencional.' },
    { key: 'garantia', label: '🛡️ Garantía', topic: 'garantía', a: '1 año de garantía de fábrica 🛡️. Cubre todo lo relacionado con defectos de fábrica y piezas. No cubre piezas de desgaste normal por el uso.' },
    { key: 'servicio', label: '🛠️ Repuestos y servicio', topic: 'repuestos y servicio', a: 'Sí manejamos repuestos: se solicitan directamente a la fábrica y se importan. Un asesor coordina contigo el repuesto que necesites. 🛠️' },
    { key: 'entrega', label: '🚚 Entrega', topic: 'entrega', a: 'Tenemos unidades nuevas con ENTREGA INMEDIATA. Despachamos a todo el país hasta tu ciudad o proyecto. 🚚' },
    { key: 'pago', label: '💳 Pago y factura', topic: 'pago y factura', a: 'La compra es de contado. Aceptamos transferencia, PSE, efectivo y tarjeta. Emitimos factura de la compra ✅' },
    { key: 'modelo', label: '🤔 ¿4 o 6 puestos?', topic: '¿4 o 6 puestos?', a: '4 Puestos → ideal para fincas, conjuntos y clubes.\n6 Puestos → ideal para hoteles, resorts y grupos grandes.\n¿Cuántas personas necesitas mover? Un asesor te ayuda a elegir 😉' },
    { key: 'usos', label: '🏨 ¿Dónde se usan?', topic: 'usos', a: 'Hoteles, resorts, clubes, conjuntos, fincas, campos de golf, glamping y proyectos turísticos. Son para espacios privados (no vías públicas).' },
  ] : [
    { key: 'precios', label: '💰 Pricing', topic: 'pricing', a: 'Launch prices 🔥\n🚗 4-Seat Luxury — $55,900,000 COP\n🚙 6-Seat Family Resort — $59,900,000 COP\nInclude lithium battery, 1-year warranty and immediate delivery.' },
    { key: 'negociable', label: '💲 Is it negotiable?', topic: 'price', a: 'The launch price is already a special, limited-time value 🔥. For particular conditions or multiple units, an advisor will gladly review options with you. Shall I connect you? 😊' },
    { key: 'incluye', label: '📦 What\'s included?', topic: 'what\'s included', a: 'Each unit includes: lithium battery, 9" HD screen + rear camera, LED lights and turn signals, Bluetooth, hydraulic brakes, independent MacPherson suspension, 14" rims and premium leather seats. ✅' },
    { key: 'ficha', label: '⚙️ Tech specs', topic: 'tech specs', a: '3.5 KW motor · Lithium battery 72V–100AH · Range 80–90 km · up to 35 km/h · 9" HD screen + rear camera · LED lights · Bluetooth · Hydraulic brakes · MacPherson suspension · 14" rims · Leather seats.' },
    { key: 'bateria', label: '🔋 Battery & charging', topic: 'battery', a: 'Lithium battery 72V–100AH ⚡. Fast charge in 1 hour or standard charge in 8 hours. Approximate lifespan of 4 to 7 years before replacement. Range 80–90 km per charge (up to 35 km/h), recharges from a standard outlet.' },
    { key: 'garantia', label: '🛡️ Warranty', topic: 'warranty', a: '1-year factory warranty 🛡️. Covers everything related to factory defects and parts. It does not cover parts subject to normal wear and tear.' },
    { key: 'servicio', label: '🛠️ Parts & service', topic: 'parts & service', a: 'Yes, we handle parts: they are ordered directly from the factory and imported. An advisor coordinates the part you need with you. 🛠️' },
    { key: 'entrega', label: '🚚 Delivery', topic: 'delivery', a: 'We have brand-new units with IMMEDIATE DELIVERY. We ship nationwide to your city or project. 🚚' },
    { key: 'pago', label: '💳 Payment & invoice', topic: 'payment', a: 'Purchase is paid in full. We accept bank transfer, PSE, cash and card. We issue a purchase invoice ✅' },
    { key: 'modelo', label: '🤔 4 or 6 seats?', topic: '4 or 6 seats', a: '4-Seat → ideal for estates, condos and clubs.\n6-Seat → ideal for hotels, resorts and larger groups.\nHow many people do you need to move? An advisor can help you choose 😉' },
    { key: 'usos', label: '🏨 Where are they used?', topic: 'use cases', a: 'Hotels, resorts, clubs, condos, estates, golf courses, glamping and tourism projects. For private spaces (not public roads).' },
  ];

  const models = es
    ? [{ v: '4 Puestos Luxury Edition', l: '4 Puestos' }, { v: '6 Puestos Family Resort', l: '6 Puestos' }, { v: 'Aún no sé / quiero asesoría', l: 'No estoy seguro' }]
    : [{ v: '4-Seat Luxury Edition', l: '4-Seat' }, { v: '6-Seat Family Resort', l: '6-Seat' }, { v: 'Not sure / need advice', l: 'Not sure yet' }];

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, open, stage]);

  const openChat = () => {
    setOpen(true);
    if (messages.length === 0) setMessages([{ from: 'bot', text: greeting }]);
  };

  const ask = (item: { key: string, label: string, topic: string, a: string }) => {
    const clean = item.label.replace(/^[^\wÀ-ÿ¿]+/, '').trim();
    setMessages((m) => [...m, { from: 'user', text: clean }, { from: 'bot', text: item.a }]);
    setTopics((t) => (t.includes(item.key) ? t : [...t, item.key]));
    onLead('chat_question', { question: item.key });
  };

  const goVideo = () => {
    setMessages((m) => [...m, { from: 'user', text: es ? '🎥 Ver video' : '🎥 Watch video' }, { from: 'bot', text: es ? '¡Genial! Te muestro el video 🎥' : 'Great! Here is the video 🎥' }]);
    onLead('chat_video');
    if (onOpenReel) { setOpen(false); setTimeout(onOpenReel, 250); }
  };

  // Interpreta texto libre por palabras clave (sin tildes) → devuelve el key del tema o null
  const matchTopic = (raw: string): string | null => {
    const s = raw.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const rules: { keys: string[], topic: string }[] = [
      { keys: ['negoci', 'descuento', 'rebaj', 'discount', 'oferta', 'mejor precio'], topic: 'negociable' },
      { keys: ['precio', 'cuesta', 'vale', 'cuanto', 'valor', 'cost', 'price', 'plata'], topic: 'precios' },
      { keys: ['bateria', 'battery', 'carga', 'charg', 'litio', 'lithium', 'autonom', 'rinde', 'dura la bat', 'kilometr', 'km'], topic: 'bateria' },
      { keys: ['garant', 'warranty', 'respaldo'], topic: 'garantia' },
      { keys: ['repuesto', 'servicio', 'mantenim', 'service', 'part', 'tecnic', 'reparac'], topic: 'servicio' },
      { keys: ['incluye', 'trae', 'include', 'viene con', 'accesorio'], topic: 'incluye' },
      { keys: ['ficha', 'especific', 'spec', 'motor', 'velocidad', 'speed', 'potencia'], topic: 'ficha' },
      { keys: ['entrega', 'envio', 'despacho', 'deliver', 'ship', 'llega', 'domicilio'], topic: 'entrega' },
      { keys: ['pago', 'pagar', 'factura', 'invoice', 'payment', 'financ', 'credito', 'cuota', 'tarjeta', 'transferencia'], topic: 'pago' },
      { keys: ['4 o 6', '4 y 6', 'cual model', 'que model', 'diferencia', 'recomiend', 'puestos', 'seats', 'personas', 'capacidad'], topic: 'modelo' },
      { keys: ['sirve', 'usar', 'donde', 'uso', 'hotel', 'finca', 'club', 'resort', 'conjunto', 'golf', 'glamping'], topic: 'usos' },
      { keys: ['video', 'ver el carro', 'movimiento', 'accion'], topic: 'video' },
      { keys: ['asesor', 'humano', 'persona', 'hablar', 'llamar', 'contacto', 'whatsapp', 'comprar', 'quiero uno'], topic: 'asesor' },
    ];
    for (const r of rules) if (r.keys.some((k) => s.includes(k))) return r.topic;
    return null;
  };

  const handleFreeText = () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    setMessages((m) => [...m, { from: 'user', text }]);
    const topic = matchTopic(text);
    onLead('chat_freetext', { matched: topic || 'none' });
    if (topic === 'video') { setTimeout(goVideo, 150); return; }
    if (topic === 'asesor') { setTimeout(startHandoff, 200); return; }
    const item = topic ? qa.find((q) => q.key === topic) : null;
    if (item) {
      setTopics((t) => (t.includes(item.key) ? t : [...t, item.key]));
      setTimeout(() => setMessages((m) => [...m, { from: 'bot', text: item.a }]), 250);
    } else {
      setTimeout(() => setMessages((m) => [...m, { from: 'bot', text: es
        ? 'Buena pregunta 😊 Para darte ese detalle exacto, te paso con un asesor. Toca "Hablar con un asesor" 👇 o elige una opción del menú.'
        : 'Good question 😊 For that exact detail, let me connect you with an advisor. Tap "Talk to an advisor" 👇 or pick a menu option.' }]), 250);
    }
  };

  const startHandoff = () => {
    setStage('handoff');
    setMessages((m) => [...m,
      { from: 'user', text: es ? '👤 Hablar con un asesor' : '👤 Talk to an advisor' },
      { from: 'bot', text: es ? '¡Con gusto! 😊 Déjame tus datos y te paso con un asesor por WhatsApp:' : "Sure! 😊 Leave your details and I'll connect you with an advisor on WhatsApp:" },
    ]);
  };

  const sendToAdvisor = () => {
    const topicLabels = topics.map((k) => qa.find((q) => q.key === k)?.topic).filter(Boolean).join(', ');
    const msg = es
      ? `Hola EV-GOLF${name ? `, soy ${name.trim()}` : ''}${city ? ` de ${city.trim()}` : ''}. ${model ? `Me interesa el ${model}.` : 'Me interesan los carros de golf eléctricos.'}${topicLabels ? ` Ya vi en la web: ${topicLabels}.` : ''} Quiero hablar con un asesor sobre disponibilidad y precio con entrega inmediata.`
      : `Hi EV-GOLF${name ? `, I'm ${name.trim()}` : ''}${city ? ` from ${city.trim()}` : ''}. ${model ? `I'm interested in the ${model}.` : "I'm interested in the electric golf carts."}${topicLabels ? ` I already checked: ${topicLabels}.` : ''} I'd like to talk to an advisor about availability and pricing with immediate delivery.`;
    onLead('chat_handoff', { model: model || undefined, city: city || undefined, topics: topics.join('|') || undefined });
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <>
      {/* Ventana de chat */}
      {open && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-5 sm:right-5 z-[90] flex items-end sm:items-stretch justify-center sm:justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm sm:hidden" onClick={() => setOpen(false)} />
          <div className="relative w-full sm:w-[380px] h-[82vh] sm:h-[600px] sm:max-h-[80vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 fade-in duration-300">
            {/* Header */}
            <div className="bg-navy px-5 py-4 flex items-center gap-3 shrink-0">
              <span className="relative w-11 h-11 rounded-full bg-[#25D366] flex items-center justify-center text-white text-xl shrink-0">
                <i className="fab fa-whatsapp"></i>
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-navy" />
              </span>
              <div className="flex-grow">
                <p className="text-white font-black text-base leading-tight">{es ? 'Asistente EV-GOLF' : 'EV-GOLF Assistant'}</p>
                <p className="text-luxuryGold text-[11px] font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  {es ? 'En línea · responde al instante' : 'Online · instant replies'}
                </p>
              </div>
              <button onClick={() => setOpen(false)} aria-label={es ? 'Cerrar' : 'Close'} className="text-white/60 hover:text-white text-lg w-8 h-8 flex items-center justify-center">
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Mensajes */}
            <div className="flex-grow overflow-y-auto scrollbar-hide px-4 py-4 space-y-2.5 bg-softGray">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line shadow-sm ${m.from === 'user' ? 'bg-[#25D366] text-white rounded-2xl rounded-br-md' : 'bg-white text-navy rounded-2xl rounded-bl-md border border-gray-100'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>

            {/* Footer: menú o formulario de handoff */}
            <div className="shrink-0 border-t border-gray-100 bg-white p-3">
              {stage === 'menu' ? (
                <>
                  <div className="flex flex-wrap gap-2 max-h-[128px] overflow-y-auto scrollbar-hide mb-2.5">
                    {qa.map((item) => (
                      <button key={item.key} onClick={() => ask(item)}
                        className="text-xs font-bold text-navy bg-softGray hover:bg-luxuryGold hover:text-navy border border-gray-200 hover:border-luxuryGold rounded-full px-3 py-2 transition-all duration-200">
                        {item.label}
                      </button>
                    ))}
                    <button onClick={goVideo}
                      className="text-xs font-bold text-navy bg-softGray hover:bg-luxuryGold border border-gray-200 hover:border-luxuryGold rounded-full px-3 py-2 transition-all duration-200">
                      {es ? '🎥 Ver video' : '🎥 Watch video'}
                    </button>
                  </div>
                  <button onClick={startHandoff}
                    className="shine w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-sm py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-green-500/20">
                    <i className="fab fa-whatsapp text-base"></i>
                    {es ? 'Hablar con un asesor' : 'Talk to an advisor'}
                  </button>
                  <div className="flex items-center gap-2 mt-2.5">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleFreeText(); }}
                      placeholder={es ? 'Escribe tu pregunta…' : 'Type your question…'}
                      className="flex-grow bg-softGray border border-gray-200 rounded-full px-4 py-2.5 text-sm text-navy placeholder-gray-400 focus:outline-none focus:border-luxuryGold transition"
                    />
                    <button onClick={handleFreeText} aria-label={es ? 'Enviar' : 'Send'}
                      className="w-10 h-10 shrink-0 rounded-full bg-navy hover:bg-luxuryGold text-white hover:text-navy flex items-center justify-center transition">
                      <i className="fas fa-paper-plane text-sm"></i>
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-2.5">
                  <div className="flex gap-2">
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder={es ? 'Tu nombre' : 'Your name'}
                      className="w-1/2 bg-softGray border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-navy placeholder-gray-400 focus:outline-none focus:border-luxuryGold transition" />
                    <input value={city} onChange={(e) => setCity(e.target.value)} placeholder={es ? 'Ciudad' : 'City'}
                      className="w-1/2 bg-softGray border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-navy placeholder-gray-400 focus:outline-none focus:border-luxuryGold transition" />
                  </div>
                  <select value={model} onChange={(e) => setModel(e.target.value)}
                    className={`w-full bg-softGray border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-luxuryGold transition ${model ? 'text-navy' : 'text-gray-400'}`}>
                    <option value="">{es ? 'Modelo de interés (opcional)' : 'Model of interest (optional)'}</option>
                    {models.map((m) => <option key={m.v} value={m.v} className="text-navy">{m.l}</option>)}
                  </select>
                  <button onClick={sendToAdvisor}
                    className="shine w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-sm py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-green-500/20">
                    <i className="fab fa-whatsapp text-base"></i>
                    {es ? 'Abrir WhatsApp' : 'Open WhatsApp'}
                  </button>
                  <button onClick={() => setStage('menu')} className="w-full text-gray-400 hover:text-navy text-xs font-bold py-1 transition">
                    {es ? '← Volver a las preguntas' : '← Back to questions'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Botón flotante */}
      {!open && (
        <button
          onClick={openChat}
          aria-label={es ? 'Abrir chat' : 'Open chat'}
          className="fixed bottom-5 right-5 z-[80] flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white pl-4 pr-5 py-3.5 rounded-full shadow-2xl shadow-green-600/30 transition-all duration-300 hover:scale-105"
        >
          <span className="relative flex items-center justify-center">
            <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60 animate-ping" />
            <i className="fab fa-whatsapp text-2xl relative"></i>
          </span>
          <span className="font-black text-sm hidden sm:inline">{es ? 'Chatea ahora' : 'Chat now'}</span>
        </button>
      )}
    </>
  );
};

// =============================================================
//  FAQ (manejo de objeciones) — acordeón
// =============================================================
const FAQ = ({ lang }: { lang: string }) => {
  const [open, setOpen] = useState<number | null>(0);
  const es = lang === 'es';
  const items = es ? [
    { q: '¿Cuánto tarda la entrega?', a: 'Tenemos unidades nuevas con entrega inmediata en Colombia. Confirmamos disponibilidad del modelo y coordinamos el despacho hasta tu ciudad apenas se concreta la compra.' },
    { q: '¿Los carros son nuevos?', a: 'Sí. Todas las unidades son nuevas, con batería de litio, y salen listas para usar con su garantía de fábrica.' },
    { q: '¿Qué garantía tienen?', a: '1 año de garantía de fábrica. Cubre todo lo relacionado con defectos de fábrica y piezas; no cubre piezas de desgaste normal por el uso. Te acompañamos durante ese periodo.' },
    { q: '¿Cuánto dura la batería, cuánto se demora en cargar y cuánto rinde?', a: 'Batería de litio 72V–100AH con autonomía aproximada de 80–90 km por carga y hasta 35 km/h. Tiene carga rápida en 1 hora o carga normal en 8 horas, y una vida útil de 4 a 7 años antes de cambiarla. Se recarga en un tomacorriente convencional.' },
    { q: '¿Cómo consigo repuestos?', a: 'Sí manejamos repuestos: se solicitan directamente a la fábrica y se importan. Un asesor coordina contigo el repuesto que necesites.' },
    { q: '¿Ofrecen financiación?', a: 'La compra es de contado. Aceptamos transferencia bancaria, PSE, efectivo y tarjeta. Coordinamos el medio de pago que más te convenga.' },
    { q: '¿Entregan factura?', a: 'Sí, emitimos factura por la compra. Coordinamos los datos de facturación al concretar la venta.' },
    { q: '¿Hacen envíos a todo el país?', a: 'Sí, despachamos a nivel nacional. Coordinamos la logística hasta tu ciudad o proyecto.' },
    { q: '¿Puedo personalizar el carro?', a: 'Sí. En el configurador eliges modelo, color exterior, tono del cuero y accesorios. También puedes consultarnos por requerimientos especiales.' },
    { q: '¿Necesito licencia o matrícula?', a: 'Son vehículos pensados para movilidad dentro de espacios privados (hoteles, clubes, fincas, conjuntos, resorts), no para circular en vías públicas.' },
    { q: '¿Puedo ver un video o más fotos antes de comprar?', a: '¡Claro! Escríbenos por WhatsApp y te enviamos videos, fotos reales y la ficha técnica completa del modelo que te interese.' },
  ] : [
    { q: 'How long does delivery take?', a: 'We have brand-new units with immediate delivery in Colombia. We confirm model availability and coordinate shipping to your city as soon as the purchase is set.' },
    { q: 'Are the carts new?', a: 'Yes. All units are brand-new, with lithium batteries, ready to use and covered by factory warranty.' },
    { q: 'What warranty do they include?', a: '1-year factory warranty. It covers everything related to factory defects and parts; it does not cover parts subject to normal wear and tear. We support you during that period.' },
    { q: 'How long does the battery last, how long to charge and what range?', a: 'Lithium battery 72V–100AH with an approximate range of 80–90 km per charge and speeds up to 35 km/h. Fast charge in 1 hour or standard charge in 8 hours, and a lifespan of 4 to 7 years before replacement. It recharges from a standard outlet.' },
    { q: 'How do I get spare parts?', a: 'Yes, we handle spare parts: they are ordered directly from the factory and imported. An advisor coordinates the part you need with you.' },
    { q: 'Do you offer financing?', a: 'Purchase is paid in full. We accept bank transfer, PSE, cash and card. We coordinate the payment method that suits you best.' },
    { q: 'Do you issue an invoice?', a: 'Yes, we issue an invoice for the purchase. We coordinate billing details when closing the sale.' },
    { q: 'Do you ship nationwide?', a: 'Yes, we ship across the country. We coordinate logistics to your city or project.' },
    { q: 'Can I customize the cart?', a: 'Yes. In the configurator you choose model, exterior color, leather tone and accessories. You can also ask us about special requirements.' },
    { q: 'Do I need a license or registration?', a: 'These vehicles are designed for mobility within private spaces (hotels, clubs, estates, complexes, resorts), not for public roads.' },
    { q: 'Can I see a video or more photos before buying?', a: 'Of course! Message us on WhatsApp and we\'ll send videos, real photos and the full technical sheet of the model you like.' },
  ];

  return (
    <section className="py-24 bg-softGray border-t border-gray-100">
      <div className="container mx-auto px-6">
        <div className="reveal text-center max-w-3xl mx-auto mb-14">
          <span className="text-luxuryGold font-extrabold tracking-[0.4em] uppercase text-[11px] mb-4 block">
            {es ? 'Preguntas frecuentes' : 'FAQ'}
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-navy mb-5 tracking-tight leading-none uppercase">
            {es ? 'Resolvemos tus dudas' : 'We answer your questions'}
          </h2>
          <p className="text-gray-500 font-light leading-relaxed text-base md:text-lg">
            {es ? 'Todo lo que necesitas saber antes de comprar tu carro de golf eléctrico.' : 'Everything you need to know before buying your electric golf cart.'}
          </p>
        </div>

        <div className="reveal max-w-3xl mx-auto space-y-3">
          {items.map((it, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 luxury-shadow overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 text-left px-6 py-5 group"
              >
                <span className="text-navy font-bold text-sm md:text-base leading-snug">{it.q}</span>
                <span className={`shrink-0 w-8 h-8 rounded-full bg-navy/5 flex items-center justify-center text-luxuryGold transition-transform duration-300 ${open === i ? 'rotate-180 bg-luxuryGold/15' : ''}`}>
                  <i className="fas fa-chevron-down text-xs"></i>
                </span>
              </button>
              <div className={`grid transition-all duration-300 ease-in-out ${open === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <p className="px-6 pb-5 text-gray-500 text-sm font-light leading-relaxed">{it.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const App: React.FC = () => {
  // --- TRACKING INIT (UTMs + GTM + page_view + scroll depth) ---
  useEffect(() => {
    captureUtmParams();
    initGtm();
    trackEvent('page_view');

    const fired: Record<number, boolean> = {};
    const revealEls = () => Array.from(document.querySelectorAll('.reveal'));
    const onScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
      const docH = document.documentElement.scrollHeight || 1;
      const pct = (scrollTop + window.innerHeight) / docH * 100;
      [50, 90].forEach((mark) => {
        if (pct >= mark && !fired[mark]) {
          fired[mark] = true;
          trackEvent(`scroll_${mark}`, { event_category: 'engagement', percent: mark });
        }
      });
      // Reveal: muestra los elementos cuyo borde superior entra al viewport
      const trigger = window.innerHeight * 0.9;
      revealEls().forEach((el) => {
        if (el.getBoundingClientRect().top < trigger) el.classList.add('is-visible');
      });
      // Barra de progreso de scroll
      const sp = document.getElementById('scroll-progress');
      if (sp) {
        const max = docH - window.innerHeight;
        sp.style.width = Math.min(100, Math.max(0, max > 0 ? (scrollTop / max) * 100 : 0)) + '%';
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    // Chequeo inicial (y un segundo pase por si el layout tarda)
    onScroll();
    const t = setTimeout(onScroll, 300);

    return () => { window.removeEventListener('scroll', onScroll); clearTimeout(t); };
  }, []);

  // Dispara evento de lead + abre el chat (los CTAs de WhatsApp lo usan).
  const leadEvent = (buttonLocation: string, extra: Record<string, any> = {}) => {
    trackEvent('whatsapp_click', { event_category: 'lead', event_label: buttonLocation, button_location: buttonLocation, language: lang, ...extra });
    trackEvent('generate_lead', { event_category: 'conversion', event_label: 'whatsapp_lead', button_location: buttonLocation, language: lang, lead_value: 1, currency: 'COP', ...extra });
    // Meta Pixel: cada clic de WhatsApp = Contact + Lead
    metaTrack('Contact', { content_name: extra.model, value: 1, currency: 'COP' });
    metaTrack('Lead', { content_name: extra.model, value: 1, currency: 'COP' });
  };

  // --- LANGUAGE LOGIC ---
  const [lang, setLangState] = useState<string>(() => {
    const saved = localStorage.getItem('lang');
    if (saved) return saved;
    return navigator.language.startsWith('es') ? 'es' : 'en';
  });

  const setLang = (l: string) => {
    setLangState(l);
    localStorage.setItem('lang', l);
  };

  const t = (key: string) => translations[lang][key] || key;

  // --- CONFIGURATOR STATE ---
  // Default: 4 Puestos -> Negro + Cognac (según disponibilidad).
  const [selectedModel, setSelectedModel] = useState("4-seat");
  const [selectedColor, setSelectedColor] = useState(MODEL_AVAILABILITY["4-seat"].color);
  const [selectedInterior, setSelectedInterior] = useState(MODEL_AVAILABILITY["4-seat"].interior);
  const [selectedAcc, setSelectedAcc] = useState<string[]>(["audio", "windshield", "rain", "wheels"]);

  // Al cambiar de modelo, aplica su color + cuero disponibles para entrega inmediata.
  const chooseModel = (model: string) => {
    setSelectedModel(model);
    const avail = MODEL_AVAILABILITY[model];
    if (avail) {
      setSelectedColor(avail.color);
      setSelectedInterior(avail.interior);
    }
  };

  const handlePersonalizeSelected = (model: string) => {
    chooseModel(model);
    const element = document.getElementById("configurar");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const [modalData, setModalData] = useState<{ isOpen: boolean, title: string, pages: string[] }>({
    isOpen: false,
    title: '',
    pages: []
  });

  // Video modal (reutilizable: hero reel + videos de cada modelo)
  const [activeVideo, setActiveVideo] = useState<VideoConfig | null>(null);

  // --- Deep-link de videos (links para compartir, sin cambiar el home) ---
  // /videos -> reel general | /videos/4-puestos -> comercial 4 | /videos/6-puestos -> comercial 6
  // También soporta ?video=reel|4|6
  useEffect(() => {
    const path = window.location.pathname.replace(/\/+$/, '');
    const v = new URLSearchParams(window.location.search).get('video');
    const is = (...keys: string[]) => keys.includes(path) || (v ? keys.some(k => k.endsWith(v)) : false);

    if (is('/videos/4-puestos', '/videos/4') || v === '4') {
      trackEvent('video_play', { model: t('prod_4_title'), location: 'deeplink' });
      setActiveVideo({ ...MODEL_VIDEOS['4-seat'], title: t('prod_4_title'), subtitle: t('prod_video_tag'), vertical: true });
    } else if (is('/videos/6-puestos', '/videos/6') || v === '6') {
      trackEvent('video_play', { model: t('prod_6_title'), location: 'deeplink' });
      setActiveVideo({ ...MODEL_VIDEOS['6-seat'], title: t('prod_6_title'), subtitle: t('prod_video_tag'), vertical: true });
    } else if (path === '/videos' || path === '/video' || v === 'reel' || v === '1') {
      trackEvent('video_play', { location: 'deeplink_reel' });
      setActiveVideo({ url: VIDEO_URL, poster: VIDEO_POSTER, title: t('video_title'), subtitle: t('video_subtitle'), vertical: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openPdf = (title: string, pages: string[]) => {
    setModalData({ isOpen: true, title, pages });
    document.body.style.overflow = 'hidden'; 
  };

  const closePdf = () => {
    setModalData({ ...modalData, isOpen: false });
    document.body.style.overflow = 'auto'; 
  };

  // Technical Sheet Document Pages
  const pdf4SeatPages = [
    "https://i.ibb.co/N6SgdFNJ/1-1-Row-4-Seat-Electric-Golf-Sightseeing-Vehicle-1.png",
    "https://i.ibb.co/ccB4VMYB/1-1-Row-4-Seat-Electric-Golf-Sightseeing-Vehicle-2.png",
    "https://i.ibb.co/M514SFST/1-1-Row-4-Seat-Electric-Golf-Sightseeing-Vehicle-3.png"
  ];

  const pdf6SeatPages = [
    "https://i.ibb.co/XxQWGzFC/2-1-Row-6-Seat-Electric-Golf-Sightseeing-Vehicle-1.png",
    "https://i.ibb.co/YBMkrMgD/2-1-Row-6-Seat-Electric-Golf-Sightseeing-Vehicle-2.png",
    "https://i.ibb.co/9Hw0M72R/2-1-Row-6-Seat-Electric-Golf-Sightseeing-Vehicle-3.png"
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-luxuryGold/30">
      <div id="scroll-progress" />
      <Navbar t={t} lang={lang} setLang={setLang} onLead={leadEvent} />
      
      <main className="flex-grow">
        <Hero t={t} onOpenReel={() => { trackEvent('video_play', { location: 'hero_reel' }); history.replaceState(null, '', '/videos'); setActiveVideo({ url: VIDEO_URL, poster: VIDEO_POSTER, title: t('video_title'), subtitle: t('video_subtitle'), vertical: true }); }} />

        {/* Catalog Section */}
        <section id="modelos" className="py-24 bg-white relative">
          <div className="container mx-auto px-6">
            <div className="reveal text-center max-w-3xl mx-auto mb-20">
              <span className="text-luxuryGold font-bold tracking-[0.4em] uppercase text-[10px] mb-5 block">{t('cat_badge')}</span>
              <h2 className="text-4xl md:text-6xl font-black text-navy mb-8 tracking-tighter">{t('cat_title_1')} <span className="text-luxuryGold">{t('hero_title_2')}</span></h2>
              <p className="text-lg text-gray-500 leading-relaxed font-light">
                {t('cat_desc')}
              </p>
            </div>

            <div className="reveal grid grid-cols-1 md:grid-cols-2 gap-16 max-w-7xl mx-auto">
              <ProductCard 
                title={t('prod_4_title')}
                description={t('prod_4_desc')}
                features={t('p_4_feat')}
                price="$55.900.000 COP"
                priceValue={55900000}
                oldPrice="$60.000.000"
                badge={lang === 'es' ? 'Disponible' : 'Available'}
                images={[
                  "https://i.ibb.co/hxmXLZ7P/Chat-GPT-Image-Jan-22-2026-09-47-29-PM.png",
                  "https://i.ibb.co/x8j57sZD/Gemini-Generated-Image-2lbbyd2lbbyd2lbb.png",
                  "https://i.ibb.co/JjSGqV2Y/Chat-GPT-Image-Jan-22-2026-10-09-06-PM.png",
                  "https://i.ibb.co/SX8bnG65/Chat-GPT-Image-Jan-26-2026-11-50-56-AM.png"
                ]}
                waLink={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t('wa_msg_4'))}`}
                onOpenTechSheet={() => { trackEvent('view_technical_sheet', { model: t('prod_4_title') }); openPdf(t('prod_4_title'), pdf4SeatPages); }}
                onPersonalize={() => handlePersonalizeSelected("4-seat")}
                onWatchVideo={() => { trackEvent('video_play', { model: t('prod_4_title'), location: 'product_card' }); history.replaceState(null, '', '/videos/4-puestos'); setActiveVideo({ ...MODEL_VIDEOS["4-seat"], title: t('prod_4_title'), subtitle: t('prod_video_tag'), vertical: true }); }}
                onLead={() => leadEvent('product_card', { model: t('prod_4_title'), price: 55900000 })}
                t={t}
              />
              <ProductCard 
                title={t('prod_6_title')}
                description={t('prod_6_desc')}
                features={t('p_6_feat')}
                price="$59.900.000 COP"
                priceValue={59900000}
                oldPrice="$65.000.000"
                badge={lang === 'es' ? 'Disponible' : 'Available'}
                images={[
                  "https://i.ibb.co/20kqPH5N/Chat-GPT-Image-Jan-26-2026-04-11-32-PM.png",
                  "https://i.ibb.co/Wpf7knyz/Chat-GPT-Image-Jan-26-2026-04-14-16-PM.png",
                  "https://i.ibb.co/s9drKn1v/Gemini-Generated-Image-sime9csime9csime.png",
                  "https://i.ibb.co/gb0QnKdw/Chat-GPT-Image-Jan-26-2026-04-08-12-PM.png"
                ]}
                waLink={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t('wa_msg_6'))}`}
                onOpenTechSheet={() => { trackEvent('view_technical_sheet', { model: t('prod_6_title') }); openPdf(t('prod_6_title'), pdf6SeatPages); }}
                onPersonalize={() => handlePersonalizeSelected("6-seat")}
                onWatchVideo={() => { trackEvent('video_play', { model: t('prod_6_title'), location: 'product_card' }); history.replaceState(null, '', '/videos/6-puestos'); setActiveVideo({ ...MODEL_VIDEOS["6-seat"], title: t('prod_6_title'), subtitle: t('prod_video_tag'), vertical: true }); }}
                onLead={() => leadEvent('product_card', { model: t('prod_6_title'), price: 59900000 })}
                t={t}
              />
            </div>
          </div>
        </section>

        {/* Comparación 4 vs 6 */}
        <section className="py-24 bg-softGray border-t border-gray-100">
          <div className="container mx-auto px-6">
            <div className="reveal text-center max-w-3xl mx-auto mb-14">
              <span className="text-luxuryGold font-extrabold tracking-[0.4em] uppercase text-[11px] mb-4 block">
                {lang === 'es' ? 'Compara y elige' : 'Compare & choose'}
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-navy mb-5 tracking-tight leading-none uppercase">
                {lang === 'es' ? '¿4 o 6 puestos?' : '4 or 6 seats?'}
              </h2>
              <p className="text-gray-500 font-light leading-relaxed text-base md:text-lg">
                {lang === 'es'
                  ? 'Misma ingeniería premium. Elige según cuántas personas necesitas mover.'
                  : 'Same premium engineering. Choose by how many people you need to move.'}
              </p>
            </div>

            <div className="reveal max-w-4xl mx-auto overflow-x-auto">
              <table className="w-full bg-white rounded-3xl overflow-hidden luxury-shadow border border-gray-100 text-sm">
                <thead>
                  <tr className="bg-navy text-white">
                    <th className="text-left px-5 py-5 font-bold text-xs uppercase tracking-wider">{lang === 'es' ? 'Característica' : 'Feature'}</th>
                    <th className="px-4 py-5 font-black text-center">{lang === 'es' ? '4 Puestos' : '4-Seat'}<br /><span className="text-luxuryGold text-[10px] font-bold uppercase tracking-wider">Luxury Edition</span></th>
                    <th className="px-4 py-5 font-black text-center">{lang === 'es' ? '6 Puestos' : '6-Seat'}<br /><span className="text-luxuryGold text-[10px] font-bold uppercase tracking-wider">Family Resort</span></th>
                  </tr>
                </thead>
                <tbody className="text-navy">
                  {[
                    { f: lang === 'es' ? 'Capacidad' : 'Capacity', a: lang === 'es' ? '4 personas' : '4 people', b: lang === 'es' ? '6 personas' : '6 people' },
                    { f: lang === 'es' ? 'Ideal para' : 'Ideal for', a: lang === 'es' ? 'Fincas, conjuntos, clubes' : 'Estates, condos, clubs', b: lang === 'es' ? 'Hoteles, resorts, grupos' : 'Hotels, resorts, groups' },
                    { f: lang === 'es' ? 'Motor' : 'Motor', a: '3.5 KW', b: '3.5 KW' },
                    { f: lang === 'es' ? 'Batería' : 'Battery', a: lang === 'es' ? 'Litio 72V–100AH' : 'Lithium 72V–100AH', b: lang === 'es' ? 'Litio premium 72V–100AH' : 'Premium Lithium 72V–100AH' },
                    { f: lang === 'es' ? 'Autonomía' : 'Range', a: '80–90 km', b: '80–90 km' },
                    { f: lang === 'es' ? 'Velocidad' : 'Speed', a: '35 km/h', b: '35 km/h' },
                    { f: lang === 'es' ? 'Pantalla + cámara' : 'Screen + camera', a: '✓', b: '✓' },
                    { f: lang === 'es' ? 'Garantía' : 'Warranty', a: lang === 'es' ? '1 año' : '1 year', b: lang === 'es' ? '1 año' : '1 year' },
                    { f: lang === 'es' ? 'Precio de lanzamiento' : 'Launch price', a: '$55.900.000', b: '$59.900.000' },
                  ].map((r, i) => (
                    <tr key={i} className={i % 2 ? 'bg-softGray/40' : 'bg-white'}>
                      <td className="px-5 py-3.5 font-semibold text-gray-600 text-xs md:text-sm">{r.f}</td>
                      <td className="px-4 py-3.5 text-center font-bold">{r.a}</td>
                      <td className="px-4 py-3.5 text-center font-bold">{r.b}</td>
                    </tr>
                  ))}
                  <tr className="bg-white border-t border-gray-100">
                    <td className="px-5 py-4"></td>
                    <td className="px-4 py-4 text-center">
                      <button onClick={() => handlePersonalizeSelected('4-seat')} className="bg-navy hover:bg-luxuryGold hover:text-navy text-white text-xs font-black px-4 py-2.5 rounded-full transition-all duration-300">
                        {lang === 'es' ? 'Elegir 4 Puestos' : 'Choose 4-Seat'}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button onClick={() => handlePersonalizeSelected('6-seat')} className="bg-navy hover:bg-luxuryGold hover:text-navy text-white text-xs font-black px-4 py-2.5 rounded-full transition-all duration-300">
                        {lang === 'es' ? 'Elegir 6 Puestos' : 'Choose 6-Seat'}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <Configurator
          t={t}
          lang={lang}
          selectedModel={selectedModel}
          onSelectModel={chooseModel}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          selectedInterior={selectedInterior}
          setSelectedInterior={setSelectedInterior}
          selectedAcc={selectedAcc}
          setSelectedAcc={setSelectedAcc}
        />

        <Features t={t} lang={lang} />

        {/* Ideales para (usos) */}
        <section className="py-24 bg-softGray border-t border-gray-100">
          <div className="container mx-auto px-6">
            <div className="reveal text-center max-w-3xl mx-auto mb-14">
              <span className="text-luxuryGold font-extrabold tracking-[0.4em] uppercase text-[11px] mb-4 block">
                {t('usos_label')}
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-navy mb-5 tracking-tight leading-none uppercase">
                {t('usos_title')}
              </h2>
              <p className="text-gray-500 font-light leading-relaxed text-base md:text-lg">
                {t('usos_desc')}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {[
                { icon: 'fa-hotel', es: 'Hoteles', en: 'Hotels' },
                { icon: 'fa-umbrella-beach', es: 'Resorts', en: 'Resorts' },
                { icon: 'fa-champagne-glasses', es: 'Clubes', en: 'Clubs' },
                { icon: 'fa-building', es: 'Conjuntos', en: 'Condos' },
                { icon: 'fa-golf-ball-tee', es: 'Campos de golf', en: 'Golf courses' },
                { icon: 'fa-house-chimney', es: 'Fincas', en: 'Estates' },
                { icon: 'fa-tent', es: 'Glamping', en: 'Glamping' },
                { icon: 'fa-map-location-dot', es: 'Proyectos turísticos', en: 'Tourism projects' },
              ].map((u, i) => (
                <div key={u.es} className="reveal" style={{ transitionDelay: `${i * 60}ms` }}>
                  <div className="group h-full bg-white rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 border border-gray-100 luxury-shadow transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-luxuryGold/40 cursor-default">
                    <div className="w-12 h-12 rounded-xl bg-navy/5 flex items-center justify-center text-luxuryGold text-xl transition-all duration-300 group-hover:bg-luxuryGold group-hover:text-navy group-hover:scale-110 group-hover:-rotate-6">
                      <i className={`fas ${u.icon}`}></i>
                    </div>
                    <span className="text-navy text-xs font-bold uppercase tracking-wider leading-tight">
                      {lang === 'es' ? u.es : u.en}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cómo comprar — 3 pasos */}
        <section className="py-24 bg-white border-t border-gray-100">
          <div className="container mx-auto px-6">
            <div className="reveal text-center max-w-3xl mx-auto mb-16">
              <span className="text-luxuryGold font-extrabold tracking-[0.4em] uppercase text-[11px] mb-4 block">
                {lang === 'es' ? 'Fácil y seguro' : 'Easy & secure'}
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-navy mb-5 tracking-tight leading-none uppercase">
                {lang === 'es' ? 'Cómo comprar tu EV-GOLF' : 'How to buy your EV-GOLF'}
              </h2>
              <p className="text-gray-500 font-light leading-relaxed text-base md:text-lg">
                {lang === 'es' ? 'Tres pasos simples, sin trámites complicados.' : 'Three simple steps, no complicated paperwork.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                { n: '1', icon: 'fa-comments', es_t: 'Cotiza por WhatsApp', en_t: 'Get a quote on WhatsApp', es_d: 'Escríbenos y te enviamos fotos reales, video y ficha técnica. Resolvemos todas tus dudas al instante.', en_d: 'Message us and we send real photos, video and the tech sheet. We answer all your questions instantly.' },
                { n: '2', icon: 'fa-file-invoice-dollar', es_t: 'Confirmamos y facturamos', en_t: 'We confirm & invoice', es_d: 'Verificamos disponibilidad para entrega inmediata, acordamos el medio de pago y emitimos tu factura.', en_d: 'We verify availability for immediate delivery, agree on the payment method and issue your invoice.' },
                { n: '3', icon: 'fa-truck-ramp-box', es_t: 'Recíbelo en tu ciudad', en_t: 'Receive it in your city', es_d: 'Coordinamos el despacho a nivel nacional hasta tu hotel, club, finca o proyecto. Listo para usar.', en_d: 'We coordinate nationwide shipping to your hotel, club, estate or project. Ready to use.' },
              ].map((s, i) => (
                <div key={s.n} className="reveal relative" style={{ transitionDelay: `${i * 90}ms` }}>
                  <div className="group h-full bg-softGray rounded-3xl p-8 border border-gray-100 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-luxuryGold/40">
                    <div className="flex items-center gap-4 mb-5">
                      <span className="w-12 h-12 rounded-2xl bg-navy text-luxuryGold font-black text-lg flex items-center justify-center shrink-0 transition-all duration-300 group-hover:bg-luxuryGold group-hover:text-navy">{s.n}</span>
                      <span className="text-luxuryGold text-2xl"><i className={`fas ${s.icon}`}></i></span>
                    </div>
                    <h3 className="text-navy font-black text-lg mb-2 tracking-tight">{lang === 'es' ? s.es_t : s.en_t}</h3>
                    <p className="text-gray-500 text-sm font-light leading-relaxed">{lang === 'es' ? s.es_d : s.en_d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Confianza / prueba social */}
        <section className="py-24 bg-navy relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-luxuryGold/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="container mx-auto px-6 relative">
            <div className="reveal text-center max-w-3xl mx-auto mb-14">
              <span className="text-luxuryGold font-extrabold tracking-[0.4em] uppercase text-[11px] mb-4 block">
                {lang === 'es' ? 'Compra con confianza' : 'Buy with confidence'}
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-5 tracking-tight leading-none uppercase">
                {lang === 'es' ? 'Por qué comprarnos a nosotros' : 'Why buy from us'}
              </h2>
              <p className="text-gray-300 font-light leading-relaxed text-base md:text-lg">
                {lang === 'es'
                  ? 'Respaldo real para una compra de alto valor: unidades nuevas, garantía, factura y entrega en todo el país.'
                  : 'Real backing for a high-value purchase: new units, warranty, invoice and nationwide delivery.'}
              </p>
            </div>

            {/* Sellos de confianza */}
            <div className="reveal grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl mx-auto mb-14">
              {[
                { icon: 'fa-certificate', es: 'Carros nuevos', en: 'Brand-new carts' },
                { icon: 'fa-shield-halved', es: 'Garantía 1 año', en: '1-year warranty' },
                { icon: 'fa-file-invoice', es: 'Factura de compra', en: 'Purchase invoice' },
                { icon: 'fa-truck-fast', es: 'Entrega nacional', en: 'Nationwide delivery' },
                { icon: 'fa-bolt', es: 'Entrega inmediata', en: 'Immediate delivery' },
              ].map((b, i) => (
                <div key={b.es} className="reveal flex flex-col items-center text-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:bg-white/10 hover:border-luxuryGold/40" style={{ transitionDelay: `${i * 60}ms` }}>
                  <span className="w-12 h-12 rounded-full bg-luxuryGold/15 text-luxuryGold text-xl flex items-center justify-center">
                    <i className={`fas ${b.icon}`}></i>
                  </span>
                  <span className="text-white text-xs font-bold uppercase tracking-wider leading-tight">{lang === 'es' ? b.es : b.en}</span>
                </div>
              ))}
            </div>

            {/* Clientes ideales */}
            <div className="reveal text-center">
              <p className="text-gray-400 text-[11px] font-bold uppercase tracking-[0.3em] mb-6">
                {lang === 'es' ? 'Confían en la movilidad EV-GOLF' : 'They trust EV-GOLF mobility'}
              </p>
              <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
                {(lang === 'es'
                  ? ['Hoteles', 'Resorts', 'Clubes campestres', 'Conjuntos residenciales', 'Fincas', 'Campos de golf', 'Glamping', 'Proyectos turísticos']
                  : ['Hotels', 'Resorts', 'Country clubs', 'Residential complexes', 'Estates', 'Golf courses', 'Glamping', 'Tourism projects']
                ).map((c) => (
                  <span key={c} className="text-gray-200 text-sm font-semibold px-5 py-2.5 rounded-full border border-white/15 bg-white/5">{c}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-white">
            <div className="reveal container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-16 text-center items-start">
                <div className="group px-8">
                    <div className="text-luxuryGold text-3xl mb-6"><i className="fas fa-truck-fast"></i></div>
                    <h5 className="text-navy font-black text-xl mb-3 tracking-tight">{t('info_logistics_title')}</h5>
                    <p className="text-gray-400 text-sm font-light">{t('info_logistics_desc')}</p>
                </div>
                <div className="group px-8 border-y md:border-y-0 md:border-x border-gray-100 py-8 md:py-0">
                    <div className="text-luxuryGold text-3xl mb-6"><i className="fas fa-wallet"></i></div>
                    <h5 className="text-navy font-black text-xl mb-3 tracking-tight">{t('info_finance_title')}</h5>
                    <p className="text-gray-400 text-sm font-light mb-5">{t('info_finance_desc')}</p>
                    <div className="flex flex-wrap justify-center gap-2">
                        {[
                          { icon: 'fa-building-columns', label: lang === 'es' ? 'Transferencia' : 'Bank transfer' },
                          { icon: 'fa-globe', label: 'PSE' },
                          { icon: 'fa-money-bill-wave', label: lang === 'es' ? 'Efectivo' : 'Cash' },
                          { icon: 'fa-credit-card', label: lang === 'es' ? 'Tarjeta' : 'Card' },
                        ].map((m) => (
                          <span key={m.label} className="flex items-center gap-2 bg-softGray text-navy text-[11px] font-bold px-3 py-1.5 rounded-full border border-gray-100">
                            <i className={`fas ${m.icon} text-luxuryGold text-xs`}></i>
                            {m.label}
                          </span>
                        ))}
                    </div>
                </div>
                <div className="group px-8">
                    <div className="text-luxuryGold text-3xl mb-6"><i className="fas fa-shield-halved"></i></div>
                    <h5 className="text-navy font-black text-xl mb-3 tracking-tight">{t('info_warranty_title')}</h5>
                    <p className="text-gray-400 text-sm font-light">{t('info_warranty_desc')}</p>
                    <span className="inline-block mt-4 bg-luxuryGold/10 text-luxuryGold text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-luxuryGold/20">
                      {lang === 'es' ? '1 año de garantía' : '1-year warranty'}
                    </span>
                </div>
            </div>
        </section>

        <FAQ lang={lang} />
      </main>

      <Footer t={t} />
      
      {/* Technical Sheet Modal */}
      <TechnicalSheetModal
        isOpen={modalData.isOpen}
        onClose={closePdf}
        title={modalData.title}
        pages={modalData.pages}
        t={t}
      />

      {/* Video Modal (hero reel + videos de modelos) */}
      <VideoModal video={activeVideo} onClose={() => { setActiveVideo(null); if (window.location.pathname.startsWith('/video')) history.replaceState(null, '', '/'); }} t={t} />

      {/* Chat-asistente guiado + handoff al asesor */}
      <ChatAssistant
        lang={lang}
        onLead={leadEvent}
        onOpenReel={() => { trackEvent('video_play', { location: 'chat_reel' }); history.replaceState(null, '', '/videos'); setActiveVideo({ url: VIDEO_URL, poster: VIDEO_POSTER, title: t('video_title'), subtitle: t('video_subtitle'), vertical: true }); }}
      />

    </div>
  );
};

export default App;