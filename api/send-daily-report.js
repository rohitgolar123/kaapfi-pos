const API_KEY = process.env.FIREBASE_API_KEY || 'AIzaSy8tI9k7VqskCABCwGMl6OY_PCkuXj80Nxc';
const PROJECT = 'kaapfi-pos';
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;

const EMAILJS_SERVICE  = process.env.EMAILJS_SERVICE_ID  || 'service_l3mx917';
const EMAILJS_TEMPLATE = process.env.EMAILJS_TEMPLATE_ID || 'template_qmgdklb';
const EMAILJS_KEY      = process.env.EMAILJS_PUBLIC_KEY  || '1LFth7G49s2CKxuo8';

function parseValue(val) {
  if (!val) return null;
  if ('stringValue'  in val) return val.stringValue;
  if ('integerValue' in val) return Number(val.integerValue);
  if ('doubleValue'  in val) return val.doubleValue;
  if ('booleanValue' in val) return val.booleanValue;
  if ('nullValue'    in val) return null;
  if ('timestampValue' in val) return val.timestampValue;
  if ('arrayValue'   in val) return (val.arrayValue.values || []).map(parseValue);
  if ('mapValue'     in val) return parseFields(val.mapValue.fields || {});
  return null;
}
function parseFields(fields) {
  if (!fields) return {};
  return Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, parseValue(v)]));
}

function getISTDateStr() {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  return ist.toISOString().split('T')[0];
}

// The café device works offline and uploads each day's report to `dailyReports/{date}` after 10 PM.
// This emails that uploaded report; orders themselves are no longer in the cloud.
module.exports = async function handler(req, res) {
  try {
    const istDate = getISTDateStr();
    const r = await fetch(`${BASE}/dailyReports/${istDate}?key=${API_KEY}`);
    const json = await r.json();
    if (r.status !== 404 && !r.ok) return res.status(502).json({ error: 'Could not read report', detail: json });

    const dateLabel = new Date(istDate).toLocaleDateString('en-IN', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
    const data = json.fields ? parseFields(json.fields) : null;
    const report = data
      ? data.text
      : `No report was uploaded for ${dateLabel}.\nThe cafe device uploads it after 10 PM when it has internet. It will appear in the owner reports view once the device is online.`;

    const emailRes = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE,
        template_id: EMAILJS_TEMPLATE,
        user_id: EMAILJS_KEY,
        template_params: { date: dateLabel, report }
      })
    });

    if (!emailRes.ok) {
      const txt = await emailRes.text();
      return res.status(500).json({ error: 'EmailJS failed', detail: txt });
    }
    return res.status(200).json({ ok: true, date: istDate, uploaded: !!data, revenue: data ? data.revenue.total : null });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
};
