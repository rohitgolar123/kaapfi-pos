// Everything that crosses between this device and the cloud:
//   1. one-time setup — copy the café's existing data down to the device
//   2. nightly report — upload the day's numbers after 10 PM so the owner can see them
//   3. owner view — read those uploaded reports
import {
  doc as cDoc, collection as cCollection, query as cQuery, where as cWhere, orderBy, limit,
  setDoc as cSetDoc, getDocFromServer, getDocFromCache, getDocsFromServer, getDocsFromCache,
} from 'firebase/firestore';
import { cloudDb } from './cloud';
import * as local from './localdb';

const APPDATA_DOCS = ['menu', 'settings', 'inventory', 'expenses', 'promos', 'categories', 'kotCounter', 'tokenCounter', 'sops', 'tableStatus', 'waitingQueue', 'upsellItems', 'upsellSettings'];
const REPORT_HOUR_IST = 22;
const CATCH_UP_DAYS = 15;

const IST_OFFSET = 330 * 60 * 1000;
export const istDate = (ts = Date.now()) => new Date(new Date(ts).getTime() + IST_OFFSET).toISOString().split('T')[0];
const istHour = () => new Date(Date.now() + IST_OFFSET).getUTCHours();

function withTimeout(promise, ms) {
  return Promise.race([promise, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);
}
const metaRef = (id) => local.doc(null, 'meta', id);
async function readMeta(id) { const s = await local.getDoc(metaRef(id)); return s.exists() ? s.data() : null; }

// ═══ 1. ONE-TIME SETUP ═══════════════════════════════════════════════════════

export async function getSetup() { return readMeta('setup'); }

// Prefer the live cloud copy; fall back to what the previous app version cached on this device.
async function readCloudDoc(name) {
  const ref = cDoc(cloudDb, 'appData', name);
  try {
    const s = await withTimeout(getDocFromServer(ref), 8000);
    return s.exists() ? { id: name, data: s.data(), source: 'cloud' } : null;
  } catch (e) {
    try {
      const s = await getDocFromCache(ref);
      return s.exists() ? { id: name, data: s.data(), source: 'cache' } : null;
    } catch (e2) { return null; }
  }
}

async function readTodaysCloudOrders() {
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const q = cQuery(cCollection(cloudDb, 'orders'), cWhere('timestamp', '>=', start.toISOString()));
  let snap;
  try { snap = await withTimeout(getDocsFromServer(q), 10000); }
  catch (e) { try { snap = await getDocsFromCache(q); } catch (e2) { return []; } }
  return snap.docs.map(d => ({ id: d.id, data: d.data() }));
}

// Throws Error('MENU_UNAVAILABLE') when no saved menu can be found and allowDefaults is false.
export async function runSetup({ allowDefaults = false } = {}) {
  const found = (await Promise.all(APPDATA_DOCS.map(readCloudDoc))).filter(Boolean);
  const menu = found.find(d => d.id === 'menu');
  const hasMenu = !!(menu && Array.isArray(menu.data.items) && menu.data.items.length > 0);
  if (!hasMenu && !allowDefaults) throw new Error('MENU_UNAVAILABLE');

  await local.bulkPut('appData', found, { overwrite: true });
  const orders = await readTodaysCloudOrders();
  await local.bulkPut('orders', orders);

  const info = {
    done: true, at: new Date().toISOString(), historyDone: false,
    menuSource: hasMenu ? menu.source : 'built-in', menuItems: hasMenu ? menu.data.items.length : 0, todaysOrders: orders.length,
  };
  await local.setDoc(metaRef('setup'), info);
  return info;
}

export async function setupFromBackup(dump) {
  const count = await local.importAll(dump);
  await local.setDoc(metaRef('setup'), { done: true, at: new Date().toISOString(), historyDone: true, menuSource: 'backup-file', restoredDocs: count });
}

// Background: bring past orders and the customer list down once. Never overwrites anything already on the device.
export async function importHistory() {
  const setup = await getSetup();
  if (!setup || setup.historyDone || !navigator.onLine) return false;
  const customers = await withTimeout(getDocsFromServer(cCollection(cloudDb, 'customers')), 30000);
  const orders = await withTimeout(getDocsFromServer(cCollection(cloudDb, 'orders')), 90000);
  await local.bulkPut('customers', customers.docs.map(d => ({ id: d.id, data: d.data() })));
  await local.bulkPut('orders', orders.docs.map(d => ({ id: d.id, data: d.data() })));
  await local.setDoc(metaRef('setup'), { ...setup, historyDone: true, historyAt: new Date().toISOString(), historyOrders: orders.size, historyCustomers: customers.size });
  return true;
}

// ═══ 2. NIGHTLY REPORT ═══════════════════════════════════════════════════════

function expenseDate(e) {
  if (e.timestamp) return istDate(e.timestamp);
  const d = e.date || '';
  if (/^\d{4}-\d{2}-\d{2}/.test(d)) return d.slice(0, 10);
  if (d.includes('/')) { const [dd, mm, yy] = d.split('/'); return `${yy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`; }
  return '';
}
const orderDate = (o) => (o.timestamp ? istDate(o.timestamp) : (o.date || ''));
const sum = (list, fn) => list.reduce((s, x) => s + (Number(fn(x)) || 0), 0);

export function buildDayReport(date, allOrders, allExpenses, cafeName = "Kaapfi 90's") {
  const dayOrders = allOrders.filter(o => orderDate(o) === date);
  const pending = dayOrders.filter(o => o.paymentStatus === 'pending');
  const paid = dayOrders.filter(o => o.paymentStatus !== 'pending');
  const expenses = allExpenses.filter(e => expenseDate(e) === date);

  const by = (m) => paid.filter(o => o.paymentMethod === m);
  const revenue = { cash: sum(by('cash'), o => o.total), upi: sum(by('upi'), o => o.total), card: sum(by('card'), o => o.total) };
  revenue.total = revenue.cash + revenue.upi + revenue.card;
  const exp = {
    cash: sum(expenses.filter(e => e.paidBy === 'cash'), e => e.amount),
    upi: sum(expenses.filter(e => e.paidBy === 'upi'), e => e.amount),
    total: sum(expenses, e => e.amount),
    list: expenses.map(e => ({ description: e.description || '', category: e.category || '', paidBy: e.paidBy || '', amount: Number(e.amount) || 0 })),
  };

  const cats = {}; const items = {};
  paid.forEach(o => (o.items || []).forEach(i => {
    const amount = (Number(i.price) || 0) * (Number(i.quantity) || 1);
    cats[i.category || 'Other'] = (cats[i.category || 'Other'] || 0) + amount;
    const it = items[i.name] || (items[i.name] = { name: i.name, qty: 0, amount: 0 });
    it.qty += Number(i.quantity) || 1; it.amount += amount;
  }));
  const times = dayOrders.map(o => o.timestamp).filter(Boolean).sort();

  const report = {
    date, cafeName,
    orders: paid.length,
    revenue,
    paymentCounts: { cash: by('cash').length, upi: by('upi').length, card: by('card').length },
    orderTypes: {
      dineIn: paid.filter(o => o.tableNumber && o.tableNumber !== 'T/A' && o.tableNumber !== 'WAIT').length,
      takeaway: paid.filter(o => o.tableNumber === 'T/A').length,
      waiting: paid.filter(o => o.tableNumber === 'WAIT').length,
    },
    pending: { count: pending.length, amount: sum(pending, o => o.total) },
    expenses: exp,
    netCash: revenue.cash - exp.cash,
    netProfit: revenue.total - exp.total,
    topCategories: Object.entries(cats).map(([name, amount]) => ({ name, amount })).sort((a, b) => b.amount - a.amount).slice(0, 8),
    topItems: Object.values(items).sort((a, b) => b.amount - a.amount).slice(0, 15),
    firstOrderAt: times[0] || null,
    lastOrderAt: times[times.length - 1] || null,
  };
  report.text = reportText(report);
  return report;
}

const rs = (n) => 'Rs.' + Math.round(n).toLocaleString('en-IN');
function reportText(r) {
  const line = '-'.repeat(30);
  const label = new Date(r.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return [
    `${r.cafeName} - Day-End Report`, label, line,
    'REVENUE',
    `  Cash  : ${rs(r.revenue.cash)} (${r.paymentCounts.cash} orders)`,
    `  UPI   : ${rs(r.revenue.upi)} (${r.paymentCounts.upi} orders)`,
    `  Card  : ${rs(r.revenue.card)} (${r.paymentCounts.card} orders)`,
    `  Total : ${rs(r.revenue.total)} (${r.orders} orders)`,
    ...(r.pending.count ? [`  Unpaid: ${rs(r.pending.amount)} (${r.pending.count} orders, not counted above)`] : []),
    line, 'ORDER TYPE',
    `  Dine-in  : ${r.orderTypes.dineIn}`, `  Takeaway : ${r.orderTypes.takeaway}`, `  Waiting  : ${r.orderTypes.waiting}`,
    line, 'EXPENSES',
    `  Cash  : ${rs(r.expenses.cash)}`, `  UPI   : ${rs(r.expenses.upi)}`, `  Total : ${rs(r.expenses.total)}`,
    line, 'CLOSING',
    `  Net cash in hand : ${rs(r.netCash)}`, `  Net profit       : ${rs(r.netProfit)}`,
    ...(r.topCategories.length ? [line, 'TOP CATEGORIES', ...r.topCategories.slice(0, 5).map(c => `  ${c.name}: ${rs(c.amount)}`)] : []),
  ].join('\n');
}

function hash(value) {
  const s = JSON.stringify(value);
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return `${s.length}:${h}`;
}

export async function getUploadStatus() { return (await readMeta('reportUploads')) || {}; }

let syncing = false;
// Uploads today's report once it is 10 PM (or immediately with force), plus any earlier day that never made it up.
// A report is re-uploaded only when its numbers changed, so late orders after 10 PM are picked up automatically.
export async function syncReports({ force = false } = {}) {
  if (syncing) return { status: 'busy' };
  if (!navigator.onLine) return { status: 'offline' };
  syncing = true;
  try {
    const today = istDate();
    const includeToday = force || istHour() >= REPORT_HOUR_IST;
    const since = new Date(Date.now() - CATCH_UP_DAYS * 86400000).toISOString();
    const orderSnap = await local.getDocs(local.query(local.collection(null, 'orders'), local.where('timestamp', '>=', since)));
    const orders = orderSnap.docs.map(d => d.data());
    const expSnap = await local.getDoc(local.doc(null, 'appData', 'expenses'));
    const expenses = (expSnap.exists() && expSnap.data().items) || [];
    const settingsSnap = await local.getDoc(local.doc(null, 'appData', 'settings'));
    const cafeName = (settingsSnap.exists() && settingsSnap.data().data && settingsSnap.data().data.cafeName) || "Kaapfi 90's";

    const uploads = await getUploadStatus();
    const floor = istDate(since);
    const dates = new Set([...orders.map(orderDate), ...expenses.map(expenseDate)].filter(d => d && d >= floor && d < today));
    if (includeToday) dates.add(today);

    const uploaded = [];
    for (const date of [...dates].sort()) {
      const report = buildDayReport(date, orders, expenses, cafeName);
      const h = hash(report);
      if (uploads[date] && uploads[date].hash === h) continue;
      await withTimeout(cSetDoc(cDoc(cloudDb, 'dailyReports', date), { ...report, uploadedAt: new Date().toISOString() }), 15000);
      uploads[date] = { hash: h, at: new Date().toISOString() };
      await local.setDoc(metaRef('reportUploads'), uploads);
      uploaded.push(date);
    }

    // Keep the customer QR menu's prices current: push the menu only when it changed.
    if (includeToday) {
      const menuSnap = await local.getDoc(local.doc(null, 'appData', 'menu'));
      if (menuSnap.exists() && Array.isArray(menuSnap.data().items) && menuSnap.data().items.length > 0) {
        const mh = hash(menuSnap.data().items);
        if (uploads._menu !== mh) {
          await withTimeout(cSetDoc(cDoc(cloudDb, 'appData', 'menu'), { items: menuSnap.data().items, updatedAt: new Date().toISOString() }), 15000);
          uploads._menu = mh;
          await local.setDoc(metaRef('reportUploads'), uploads);
        }
      }
    }
    return { status: 'ok', uploaded };
  } catch (e) {
    return { status: 'error', error: e.message || String(e) };
  } finally {
    syncing = false;
  }
}

// ═══ 3. OWNER VIEW ═══════════════════════════════════════════════════════════

export async function fetchOwnerReports(days = 31) {
  const q = cQuery(cCollection(cloudDb, 'dailyReports'), orderBy('date', 'desc'), limit(days));
  const snap = await withTimeout(getDocsFromServer(q), 15000);
  return snap.docs.map(d => d.data());
}
