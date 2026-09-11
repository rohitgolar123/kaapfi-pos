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

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    // Use IST (UTC+5:30) midnight as the query boundary so orders from
    // the café's local "today" are never excluded by a UTC offset mismatch.
    const nowUTC = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const nowIST = new Date(nowUTC.getTime() + istOffset);
    const istMidnightStr = nowIST.toISOString().split('T')[0] + 'T00:00:00.000Z';
    const todayQueryStart = new Date(new Date(istMidnightStr).getTime() - istOffset).toISOString();
    const today = { toISOString: () => todayQueryStart };

    const r = await fetch(`${BASE}:runQuery?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: 'orders' }],
          where: {
            fieldFilter: {
              field: { fieldPath: 'timestamp' },
              op: 'GREATER_THAN_OR_EQUAL',
              value: { stringValue: today.toISOString() }
            }
          }
        }
      })
    });

    if (!r.ok) {
      const text = await r.text();
      let parsed;
      try { parsed = JSON.parse(text); } catch (e) { parsed = null; }
      const message = (parsed && parsed.error && parsed.error.message) || parsed?.message || text;
      const urlMatch = typeof message === 'string' && message.match(/https?:\/\/[\w\-./?=&:%#]+/);
      const firestoreIndexUrl = urlMatch ? urlMatch[0] : null;
      console.error('Firestore runQuery failed', r.status, message);
      return res.status(r.status).json({ error: message, firestoreIndexUrl });
    }

    const docs = await r.json();
    const orders = (Array.isArray(docs) ? docs : [])
      .filter(d => d.document)
      .map(d => {
        const docId = d.document.name.split('/').pop();
        const data = parseFields(d.document.fields);
        return { id: data.id || docId, firebaseDocId: docId, ...data };
      });

    orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json({ orders, ts: Date.now() });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
