# 📝 Copy del sitio EV-GOLF — Todos los textos por sección

Este documento lista **todo el texto visible** del sitio, organizado por sección, con la *clave* donde se edita.
La mayoría de los textos viven en el objeto `translations` de [`App.tsx`](App.tsx) (versión `es` y su espejo `en`).
Los marcados como **(fijo)** están escritos directamente en el componente.

> Para editar: cambia el valor en `translations.es` (y su equivalente en `translations.en`).

---

## 1. Barra de navegación (Navbar)

| Texto actual | Clave / ubicación |
|---|---|
| EV-GOLF | **(fijo)** logo |
| Personalizar | `config_nav_btn` |
| Hablar con un Asesor | `nav_contact` |

---

## 2. Hero (portada principal)

| Texto actual | Clave |
|---|---|
| Carros de Golf Eléctricos – | `hero_title_1` |
| Modelos 2026 | `hero_title_2` |
| Descubre la tecnología del futuro hoy. Disponibilidad inmediata para nuestra flota 2026: silenciosos, potentes y ultra-exclusivos. | `hero_desc` |
| VER MODELOS 2026 | `hero_btn_models` |
| SOLICITAR CATÁLOGO | `hero_btn_catalog` |
| Ver el reel | `hero_reel_btn` |
| EV-GOLF en acción · 17s | `hero_reel_sub` |

---

## 3. Catálogo / "Explora la Línea"

| Texto actual | Clave |
|---|---|
| Nueva Colección | `cat_badge` |
| Explora la Línea | `cat_title_1` |
| Modelos 2026 *(reusa `hero_title_2`)* | `hero_title_2` |
| Presentamos la ingeniería más avanzada del mercado. Nuestros modelos 2026 combinan potencia sostenible con acabados de alta costura. | `cat_desc` |

---

## 4. Tarjetas de modelo (ProductCard)

**Comunes a ambas tarjetas:**

| Texto actual | Clave |
|---|---|
| Ver video | `prod_btn_video` |
| Video Comercial *(subtítulo del reel del modelo)* | `prod_video_tag` |
| Nueva Serie 2026 | `prod_series` |
| Innovación 2026 | `innovation_label` |
| Precio de Lanzamiento | `prod_price_label` |
| Personalizar Diseño | `prod_btn_personalize` |
| Ver ficha técnica | `prod_btn_tech` |
| Me interesa el modelo 2026 | `prod_btn_buy` |

**Modelo 4 puestos:**

| Texto actual | Clave |
|---|---|
| Nuevo 2026 *(badge)* | **(fijo)** en App.tsx |
| 4 Puestos Luxury Edition - 2026 | `prod_4_title` |
| La actualización 2026 del icónico modelo de 4 puestos. Más potente, más elegante y con software de control renovado. | `prod_4_desc` |
| $60.000.000 COP *(precio)* | **(fijo)** en App.tsx |
| Motor 2026 72V Ultra-Eficaz / Baterías de Ciclo Profundo Gen-4 / Rines de Lujo 14" Edition 2026 / Panel de Control Táctil Inteligente | `p_4_feat` (lista) |

**Modelo 6 puestos:**

| Texto actual | Clave |
|---|---|
| Serie 2026 *(badge)* | **(fijo)** en App.tsx |
| 6 Puestos Family Resort - 2026 | `prod_6_title` |
| El gigante de la familia EV-GOLF se renueva para 2026. Capacidad masiva con una suavidad de marcha inigualable. | `prod_6_desc` |
| $65.000.000 COP *(precio)* | **(fijo)** en App.tsx |
| Capacidad 6 Pax - Confort Total / Suspensión Neumática Adaptativa / Seguridad 360° con Cámara HD / Iluminación Exterior LED Diamond | `p_6_feat` (lista) |

---

## 5. Configurador ("Diseña tu EV-GOLF 2026")

**Encabezado:**

| Texto actual | Clave |
|---|---|
| Configurador Personalizado | `config_title` |
| Diseña tu EV-GOLF 2026 | `config_subtitle` |
| Modifica especificaciones en tiempo real, calcula cuotas de financiamiento y envía tu diseño directo a un asesor para una cotización formal. | `config_desc` |

**Paso 1 — Modelo:**

| Texto actual | Clave |
|---|---|
| 1. Selecciona tu Modelo | `config_model` |
| 4 Puestos / 6 Puestos | **(fijo)** |

**Paso 2 — Color (toggle Blanco/Negro):**

| Texto actual | Clave |
|---|---|
| 2. Color de Pintura Exterior | `config_color` |
| Blanco | `config_color_white` → corto: "Blanco" |
| Negro | `config_color_black` → corto: "Negro" |
| Ambos colores sin costo adicional | **(fijo)** |

**Paso 3 — Cuero (toggle Cognac/Rojo):**

| Texto actual | Clave |
|---|---|
| 3. Tono del Cuero Interior (Premium) | `config_interior` |
| Hipoalergénico, impermeable con microperforación 2026. | **(fijo)** |
| Cognac → "Cuero Cognac Imperial" | `config_interior_cognac` |
| Rojo → "Cuero Rojo Borgoña Imperial" | `config_interior_red` |

**Paso 4 — Accesorios (todos incluidos):**

| Texto actual | Clave |
|---|---|
| 4. Accesorios Premium Incorporados | `config_accessories` |
| Incluido | `config_included` |
| Audio JBL Premium — Sonido Envolvente Bluetooth JBL Premium | nombre **(fijo)** / desc `config_acc_audio` |
| Parabrisas Abatible — Vidrio Parabrisas Abatible Antifricción | nombre **(fijo)** / desc `config_acc_windshield` |
| Carpeta de Clima — Carpeta de Clima Impermeable Premium | nombre **(fijo)** / desc `config_acc_rain` |
| Rines de Lujo 14" — Rines de Lujo 14" en Negro Satinado | nombre **(fijo)** / desc `config_acc_wheels` |

**Recuadro "Resumen de tu Configuración":**

| Texto actual | Clave |
|---|---|
| Vista de Diseño *(chip vista previa)* | **(fijo)** |
| Resumen de tu Configuración | `config_summary` |
| Modelo / Color / Cuero / Accesorios *(etiquetas filas)* | **(fijo)** |
| Precio Especial Estimado | `config_total` |
| IVA e impuestos incluidos | **(fijo)** |
| Enviar Configuración por WhatsApp | `config_request_whatsapp` |
| Atención VIP • Respuesta inmediata 24/7 | **(fijo)** |

> *Nota: las claves `config_finance_calc`, `config_down_payment`, `config_months`, `config_monthly_quota`, `config_interest`, `config_base_price`, `config_extras` existen en el diccionario pero no se muestran actualmente (el simulador financiero no está renderizado).*

---

## 6. Video / Reel (hero y modelos)

| Texto actual | Clave |
|---|---|
| Visualiza su Desempeño *(subtítulo)* | `video_subtitle` |
| Experiencia en Movimiento *(título)* | `video_title` |
| Toca para activar el sonido | `reel_tap_sound` |
| (descripción, no visible actualmente) | `video_desc` |

---

## 7. Sección "Tecnología y Confort" (Features)

| Texto actual | Clave |
|---|---|
| Ingeniería 2026 | `features_engineering` |
| Tecnología y Confort | `features_title` |
| Generación 2026 | `features_subtitle` |
| Nuestra nueva línea 2026 redefine los estándares de la movilidad eléctrica. Más autonomía, motores más eficientes y un diseño interior que roza la perfección. | `features_desc` |
| 72V *(dato sobre la imagen)* | **(fijo)** |
| Smart Audio 2026 — Conectividad inalámbrica total | `feat_1_title` / `feat_1_desc` |
| OS Next-Gen — Interfaz 2026 intuitiva | `feat_2_title` / `feat_2_desc` |
| Ergonomía Plus — Cuero premium transpirable | `feat_3_title` / `feat_3_desc` |
| Ultra-Charge — Carga optimizada 2026 | `feat_4_title` / `feat_4_desc` |

---

## 8. Bloque de servicios (logística / financiación / garantía)

| Texto actual | Clave |
|---|---|
| Logística 2026 — Despacho inmediato de unidades 2026 con seguimiento satelital hasta su destino. | `info_logistics_title` / `info_logistics_desc` |
| Financiación Flexible — Planes especiales de lanzamiento para la serie 2026. Consulte con su asesor. | `info_finance_title` / `info_finance_desc` |
| Garantía Superior — Respaldo total de fábrica para todos los componentes de la nueva línea 2026. | `info_warranty_title` / `info_warranty_desc` |

---

## 9. Footer

| Texto actual | Clave |
|---|---|
| Referente nacional en movilidad eléctrica. Presentando la colección más avanzada de carros de golf modelo 2026. | `footer_desc` |
| Entrega Modelos 2026 | `footer_tag_1` |
| Garantía Extendida | `footer_tag_2` |
| Mantenimiento 2026 | `footer_tag_3` |
| Calidad Certificada | `footer_tag_4` |
| © 2024-2026 EV-GOLF COLOMBIA \| MODELOS DE NUEVA GENERACIÓN | `footer_copy` |

---

## 10. Modal de ficha técnica

| Texto actual | Clave |
|---|---|
| Especificaciones Técnicas | `modal_tech_spec` |
| Visualización Segura - No disponible para descarga | `modal_secure` |
| Cerrar Visualización | `modal_close` |
| Propiedad intelectual reservada EV-GOLF 2026 | `modal_copyright` |

---

## 11. Mensajes de WhatsApp (pre-armados)

| Texto actual | Clave |
|---|---|
| Hola, me interesa el Modelo 4 Puestos Luxury Edition 2026 | `wa_msg_4` |
| Hola, me interesa el Modelo 6 Puestos Family and Resort 2026 | `wa_msg_6` |
| Hola, quisiera hablar con un asesor sobre los carros de golf modelo 2026. | `wa_msg_nav` |

**Mensaje largo del configurador** *(armado en la función `handleWhatsappSubmit` de App.tsx)*:

> Hola EV-GOLF Colombia, acabo de diseñar mi carro de golf modelo 2026 en el personalizador online de lujo:
> **Configuración Seleccionada:** Modelo / Color Exterior / Cojinería / Accesorios
> **Cotización Directa:** Precio de Lista Total
> Por favor, me gustaría que un asesor confirme disponibilidad de entrega inmediata...

---

## ✏️ Sugerencias para mejorar el copy

- Marca dime qué **tono** quieres (más aspiracional, más técnico, más cercano) y reescribo todo en bloque.
- Puedo unificar el uso de "2026" (aparece muchas veces; quizás aligerar).
- Los precios y badges están **fijos** en `App.tsx`; si cambian seguido, los puedo centralizar como constantes igual que el WhatsApp y los videos.
