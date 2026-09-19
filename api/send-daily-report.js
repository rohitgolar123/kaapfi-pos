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

module.exports = async function handler(req, res) {
  // Allow manual trigger via GET, and Vercel cron via GET too
  try {
    const istDate = getISTDateStr();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const nowIST = new Date(new Date().getTime() + istOffset);
    const istMidnightStr = nowIST.toISOString().split('T')[0] + 'T00:00:00.000Z';
    const todayQueryStart = new Date(new Date(istMidnightStr).getTime() - istOffset).toISOString();

    // Fetch today's orders
    const ordersRes = await fetch(`${BASE}:runQuery?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: 'orders' }],
          where: {
            fieldFilter: {
              field: { fieldPath: 'timestamp' },
              op: 'GREATER_THAN_OR_EQUAL',
              value: { stringValue: todayQueryStart }
            }
          }
        }
      })
    });
    const ordersJson = await ordersRes.json();
    const orders = (Array.isArray(ordersJson) ? ordersJson : [])
      .filter(d => d.document)
      .map(d => parseFields(d.document.fields));

    // Fetch expenses from appData
    const expRes = await fetch(`${BASE}/appData/expenses?key=${API_KEY}`);
    const expJson = await expRes.json();
    const allExpenses = expJson.fields ? parseFields(expJson.fields) : {};
    const expenses = (allExpenses.list || []).filter(e => e.date === istDate);

    // ── Compute totals ──
    const paidOrders = orders.filter(o => o.paymentStatus === 'paid');
    const cashOrders  = paidOrders.filter(o => o.paymentMethod === 'cash');
    const upiOrders   = paidOrders.filter(o => o.paymentMethod === 'upi');
    const cardOrders  = paidOrders.filter(o => o.paymentMethod === 'card');

    const cashRev  = cashOrders.reduce((s, o) => s + (o.total || 0), 0);
    const upiRev   = upiOrders.reduce((s, o) => s + (o.total || 0), 0);
    const cardRev  = cardOrders.reduce((s, o) => s + (o.total || 0), 0);
    const totalRev = cashRev + upiRev + cardRev;

    const cashExp  = expenses.filter(e => e.paidBy === 'cash').reduce((s, e) => s + (e.amount || 0), 0);
    const upiExp   = expenses.filter(e => e.paidBy === 'upi').reduce((s, e) => s + (e.amount || 0), 0);
    const totalExp = expenses.reduce((s, e) => s + (e.amount || 0), 0);

    const netCash   = cashRev - cashExp;
    const netProfit = totalRev - totalExp;

    const dineIn   = paidOrders.filter(o => o.tableNumber && o.tableNumber !== 'T/A' && o.tableNumber !== 'WAIT').length;
    const takeaway = paidOrders.filter(o => o.tableNumber === 'T/A').length;
    const waiting  = paidOrders.filter(o => o.tableNumber === 'WAIT').length;

    // Category breakdown
    const catMap = {};
    paidOrders.forEach(o => (o.items || []).forEach(item => {
      const cat = item.category || 'Other';
      catMap[cat] = (catMap[cat] || 0) + ((item.price || 0) * (item.quantity || 1));
    }));
    const topCats = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const dateLabel = new Date(istDate).toLocaleDateString('en-IN', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });

    const report =
`Kaapfi 90's — Day-End Report
Date: ${dateLabel}
${'─'.repeat(30)}
REVENUE
  Cash   : Rs.${cashRev.toFixed(0)} (${cashOrders.length} orders)
  UPI    : Rs.${upiRev.toFixed(0)} (${upiOrders.length} orders)
  Card   : Rs.${cardRev.toFixed(0)} (${cardOrders.length} orders)
  Total  : Rs.${totalRev.toFixed(0)} (${paidOrders.length} orders)
${'─'.repeat(30)}
ORDER TYPE
  Dine-In  : ${dineIn}
  Takeaway : ${takeaway}
  Waiting  : ${waiting}
${'─'.repeat(30)}
EXPENSES
  Cash : Rs.${cashExp.toFixed(0)}
  UPI  : Rs.${upiExp.toFixed(0)}
  Total: Rs.${totalExp.toFixed(0)}
${'─'.repeat(30)}
CLOSING SUMMARY
  Net Cash in Hand : Rs.${netCash.toFixed(0)}
  Net Profit       : Rs.${netProfit.toFixed(0)}
${'─'.repeat(30)}
${topCats.length > 0 ? `TOP CATEGORIES\n${topCats.map(([c, v]) => `  ${c}: Rs.${v.toFixed(0)}`).join('\n')}\n${'─'.repeat(30)}\n` : ''}Day closed automatically at 11 PM IST`;

    // Send via EmailJS REST API
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

    return res.status(200).json({ ok: true, date: istDate, orders: paidOrders.length, revenue: totalRev });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
};
