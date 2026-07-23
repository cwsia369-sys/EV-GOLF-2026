// =============================================================
//  Meta Conversions API (CAPI) — endpoint del lado del servidor
//  Recibe eventos del navegador y los reenvía a Meta desde el servidor,
//  recuperando conversiones que el Pixel pierde (iOS, bloqueadores).
//  Deduplicación con el Pixel vía `event_id`.
//
//  Requiere variable de entorno en Vercel:  META_CAPI_TOKEN
//  (opcional) META_PIXEL_ID  — por defecto usa el Pixel actual.
//
//  Si no hay token configurado, responde sin hacer nada (no rompe la web).
// =============================================================

import crypto from 'node:crypto';

const sha256 = (v) =>
  crypto.createHash('sha256').update(String(v).trim().toLowerCase()).digest('hex');

export default async function handler(req, res) {
  const TOKEN = process.env.META_CAPI_TOKEN;
  const PIXEL_ID = process.env.META_PIXEL_ID || '1742726306716531';

  // Health check por navegador (GET): dice si la CAPI ya tiene token, sin exponerlo.
  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, configured: !!TOKEN, pixel_id: PIXEL_ID });
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  // Sin token → no-op silencioso (la web sigue funcionando con el Pixel del navegador).
  if (!TOKEN) {
    return res.status(200).json({ ok: false, reason: 'capi_not_configured' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
    const ua = req.headers['user-agent'] || '';

    const user_data = {
      client_ip_address: ip,
      client_user_agent: ua,
    };
    if (body.fbp) user_data.fbp = body.fbp;
    if (body.fbc) user_data.fbc = body.fbc;
    // Datos personales (si algún día se capturan) van hasheados, como exige Meta.
    if (body.email) user_data.em = sha256(body.email);
    if (body.phone) user_data.ph = sha256(body.phone.replace(/[^0-9]/g, ''));

    const payload = {
      data: [
        {
          event_name: body.event_name || 'Lead',
          event_time: Math.floor(Date.now() / 1000),
          event_id: body.event_id,
          event_source_url: body.event_source_url,
          action_source: 'website',
          user_data,
          custom_data: body.custom_data || {},
        },
      ],
    };

    const url = `https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${encodeURIComponent(TOKEN)}`;
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await r.json().catch(() => ({}));

    return res.status(200).json({ ok: r.ok, meta: json });
  } catch (e) {
    // Nunca romper la experiencia por un fallo de tracking.
    return res.status(200).json({ ok: false, error: String(e && e.message ? e.message : e) });
  }
}
