import React, { useState, useEffect } from 'react';
import { fetchOwnerReports, istDate } from './sync';

const rupee = (n) => '₹' + Math.round(n || 0).toLocaleString('en-IN');
const dayLabel = (d) => new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
const box = { background: '#122B45', borderRadius: '12px', padding: '16px', marginBottom: '12px' };
const row = { display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '14px' };
const linkBtn = { background: 'none', border: 'none', color: '#8fb8dc', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline', padding: '8px' };

function Stat({ label, value, color = '#fff' }) {
  return (
    <div style={{ background: '#0F2236', borderRadius: '10px', padding: '12px', flex: '1 1 130px' }}>
      <div style={{ fontSize: '11px', color: '#8fb8dc', fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: '22px', fontWeight: 800, color }}>{value}</div>
    </div>
  );
}

// Owner's view of the night reports the café device uploaded. Reads the cloud; stores nothing on this phone.
export default function OwnerReports({ password, onExit, exitLabel }) {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem('kaapfi_ownerUnlocked') === '1');
  const [input, setInput] = useState('');
  const [wrong, setWrong] = useState(false);
  const [state, setState] = useState('loading'); // loading | ready | error
  const [reports, setReports] = useState([]);
  const [open, setOpen] = useState(null);

  const load = async () => {
    setState('loading');
    try { const list = await fetchOwnerReports(); setReports(list); setOpen(list[0] ? list[0].date : null); setState('ready'); }
    catch (e) { setState('error'); }
  };
  useEffect(() => { if (unlocked) load(); }, [unlocked]); // eslint-disable-line

  const unlock = () => {
    if (input === password) { sessionStorage.setItem('kaapfi_ownerUnlocked', '1'); setUnlocked(true); }
    else setWrong(true);
  };

  const shell = (children) => (
    <div style={{ minHeight: '100vh', background: '#0D1B2E', color: '#fff', fontFamily: 'system-ui, sans-serif', padding: '16px' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ fontSize: '20px', fontWeight: 800 }}>📊 Kaapfi 90's — Reports</div>
          {unlocked && <button onClick={load} style={{ background: '#FC8019', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 14px', fontWeight: 700, cursor: 'pointer' }}>Refresh</button>}
        </div>
        {children}
        <div style={{ textAlign: 'center' }}><button style={linkBtn} onClick={onExit}>{exitLabel}</button></div>
      </div>
    </div>
  );

  if (!unlocked) return shell(
    <div style={box}>
      <div style={{ fontSize: '14px', marginBottom: '10px' }}>Enter the manager password to see reports.</div>
      <input type="password" value={input} onChange={(e) => { setInput(e.target.value); setWrong(false); }} onKeyDown={(e) => e.key === 'Enter' && unlock()}
        placeholder="Manager password" style={{ width: '100%', padding: '12px', fontSize: '16px', borderRadius: '8px', border: '1px solid #345', boxSizing: 'border-box', marginBottom: '10px' }} />
      {wrong && <div style={{ color: '#EF5350', fontSize: '13px', marginBottom: '8px' }}>Wrong password</div>}
      <button onClick={unlock} style={{ width: '100%', padding: '12px', background: '#FC8019', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '15px', cursor: 'pointer' }}>Show reports</button>
    </div>
  );

  if (state === 'loading') return shell(<div style={box}>Loading reports…</div>);
  if (state === 'error') return shell(<div style={box}>Could not load reports. Check this phone's internet and tap Refresh.</div>);
  if (reports.length === 0) return shell(<div style={box}>No reports uploaded yet. The café device uploads each day's report after 10 PM when it has internet.</div>);

  const today = istDate();
  const r = reports.find(x => x.date === open) || reports[0];
  return shell(<>
    {!reports.some(x => x.date === today) && (
      <div style={{ ...box, background: '#3a2a10', fontSize: '13px' }}>Today's report is not uploaded yet. It arrives after 10 PM, once the café device has internet.</div>
    )}
    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px' }}>
      {reports.map(x => (
        <button key={x.date} onClick={() => setOpen(x.date)} style={{ flex: '0 0 auto', padding: '8px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: x.date === r.date ? '#FC8019' : '#122B45', color: '#fff', textAlign: 'left' }}>
          <div style={{ fontSize: '12px', fontWeight: 700 }}>{dayLabel(x.date)}</div>
          <div style={{ fontSize: '13px' }}>{rupee(x.revenue.total)}</div>
        </button>
      ))}
    </div>

    <div style={box}>
      <div style={{ fontSize: '13px', color: '#8fb8dc', marginBottom: '10px' }}>
        {new Date(r.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        {r.uploadedAt ? ` · uploaded ${new Date(r.uploadedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}` : ''}
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <Stat label="TOTAL SALES" value={rupee(r.revenue.total)} color="#69F0AE" />
        <Stat label="ORDERS" value={r.orders} />
        <Stat label="NET CASH IN HAND" value={rupee(r.netCash)} />
        <Stat label="NET PROFIT" value={rupee(r.netProfit)} color={r.netProfit >= 0 ? '#69F0AE' : '#EF5350'} />
      </div>
    </div>

    <div style={box}>
      <div style={{ fontWeight: 800, marginBottom: '6px' }}>Payments</div>
      <div style={row}><span>Cash ({r.paymentCounts.cash})</span><b>{rupee(r.revenue.cash)}</b></div>
      <div style={row}><span>UPI ({r.paymentCounts.upi})</span><b>{rupee(r.revenue.upi)}</b></div>
      <div style={row}><span>Card ({r.paymentCounts.card})</span><b>{rupee(r.revenue.card)}</b></div>
      {r.pending.count > 0 && <div style={{ ...row, color: '#FFD54F' }}><span>Unpaid ({r.pending.count}), not counted in sales</span><b>{rupee(r.pending.amount)}</b></div>}
    </div>

    <div style={box}>
      <div style={{ fontWeight: 800, marginBottom: '6px' }}>Order type</div>
      <div style={row}><span>Dine-in</span><b>{r.orderTypes.dineIn}</b></div>
      <div style={row}><span>Takeaway</span><b>{r.orderTypes.takeaway}</b></div>
      <div style={row}><span>Waiting</span><b>{r.orderTypes.waiting}</b></div>
    </div>

    <div style={box}>
      <div style={{ fontWeight: 800, marginBottom: '6px' }}>Expenses — {rupee(r.expenses.total)}</div>
      <div style={row}><span>Cash</span><b>{rupee(r.expenses.cash)}</b></div>
      <div style={row}><span>UPI</span><b>{rupee(r.expenses.upi)}</b></div>
      {(r.expenses.list || []).map((e, i) => (
        <div key={i} style={{ ...row, color: '#c8e0f4', fontSize: '13px' }}><span>{e.description || e.category} · {e.paidBy}</span><span>{rupee(e.amount)}</span></div>
      ))}
    </div>

    {(r.topItems || []).length > 0 && (
      <div style={box}>
        <div style={{ fontWeight: 800, marginBottom: '6px' }}>Top items</div>
        {r.topItems.map(i => <div key={i.name} style={row}><span>{i.name} × {i.qty}</span><b>{rupee(i.amount)}</b></div>)}
      </div>
    )}
    {(r.topCategories || []).length > 0 && (
      <div style={box}>
        <div style={{ fontWeight: 800, marginBottom: '6px' }}>Categories</div>
        {r.topCategories.map(c => <div key={c.name} style={row}><span>{c.name}</span><b>{rupee(c.amount)}</b></div>)}
      </div>
    )}
  </>);
}
