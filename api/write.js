const API_KEY = 'AIzaSy8tI9k7VqskCABCwGMl6OY_PCkuXj80Nxc';
const PROJECT = 'kaapfi-pos';
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;

function toFS(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
  if (typeof val === 'string') return { stringValue: val };
  if (Array.isArray(val)) return { arrayValue: { values: val.map(toFS) } };
  if (typeof val === 'object') return { mapValue: { fields: Object.fromEntries(Object.entries(val).map(([k,v]) => [k, toFS(v)])) } };
  return { nullValue: null };
}

function fields(obj) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, toFS(v)]));
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  // op: 'add' | 'set' | 'update' | 'delete'
  // path: e.g. 'orders' (collection for add) or 'orders/docId' or 'appData/inventory'
  const { op, path, data } = req.body;

  try {
    if (op === 'add') {
      const r = await fetch(`${BASE}/${path}?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: fields(data) })
      });
      const result = await r.json();
      if (!r.ok) return res.status(r.status).json(result);
      return res.json({ id: result.name.split('/').pop(), ok: true });
    }

    if (op === 'set') {
      const r = await fetch(`${BASE}/${path}?key=${API_KEY}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: fields(data) })
      });
      const result = await r.json();
      return res.json({ ok: r.ok, result });
    }

    if (op === 'update') {
      const f = fields(data);
      const mask = Object.keys(f).map(k => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&');
      const r = await fetch(`${BASE}/${path}?key=${API_KEY}&${mask}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: f })
      });
      const result = await r.json();
      return res.json({ ok: r.ok, result });
    }

    if (op === 'delete') {
      const r = await fetch(`${BASE}/${path}?key=${API_KEY}`, { method: 'DELETE' });
      return res.json({ ok: r.ok });
    }

    res.status(400).json({ error: 'Unknown op: ' + op });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
};
