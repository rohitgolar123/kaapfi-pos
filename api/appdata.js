const API_KEY = 'AIzaSy8tI9k7VqskCABCwGMl6OY_PCkuXj80Nxc';
const PROJECT = 'kaapfi-pos';
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;

function parseValue(val) {
  if (!val) return null;
  if ('stringValue' in val) return val.stringValue;
  if ('integerValue' in val) return Number(val.integerValue);
  if ('doubleValue' in val) return val.doubleValue;
  if ('booleanValue' in val) return val.booleanValue;
  if ('nullValue' in val) return null;
  if ('timestampValue' in val) return val.timestampValue;
  if ('arrayValue' in val) return (val.arrayValue.values || []).map(parseValue);
  if ('mapValue' in val) return parseFields(val.mapValue.fields || {});
  return null;
}

function parseFields(fields) {
  if (!fields) return {};
  return Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, parseValue(v)]));
}

const DOCS = ['menu','settings','inventory','expenses','promos','categories','kotCounter','sops','tableStatus','upsellItems','upsellSettings'];

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const results = await Promise.all(
      DOCS.map(async (name) => {
        const r = await fetch(`${BASE}/appData/${name}?key=${API_KEY}`);
        if (!r.ok) return [name, null];
        const data = await r.json();
        return [name, data.fields ? parseFields(data.fields) : null];
      })
    );
    res.json(Object.fromEntries(results));
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
