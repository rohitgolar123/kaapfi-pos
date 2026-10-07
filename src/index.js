import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { IS_PUBLIC_MENU } from './datastore';

const root = ReactDOM.createRoot(document.getElementById('root'));
// The customer QR menu has been retired: orders placed there never reached the billing device.
const menuClosed = (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FC8019', fontFamily: 'system-ui, sans-serif', padding: '24px' }}>
    <div style={{ background: '#fff', color: '#000', borderRadius: '16px', padding: '36px 28px', maxWidth: '380px', textAlign: 'center' }}>
      <div style={{ fontSize: '52px' }}>☕</div>
      <h1 style={{ fontSize: '22px', margin: '8px 0' }}>Kaapfi 90's</h1>
      <p style={{ fontSize: '15px', lineHeight: 1.5 }}>The online menu is no longer available. Please ask our staff for the menu and to place your order.</p>
    </div>
  </div>
);

// Only one POS window at a time. The first window holds a browser lock for as long as it is open (the browser
// releases it by itself when that window closes or crashes); any later window sees the lock is taken.
let holdingLock = false;
function SingleWindow() {
  const [state, setState] = React.useState(navigator.locks ? 'checking' : 'main'); // checking | main | duplicate
  React.useEffect(() => {
    if (!navigator.locks) return;
    let cancelled = false;
    // After a reload the previous page can take a moment to let go of the lock, so try for a few seconds
    // before deciding another window really has it.
    const attempt = (triesLeft) => {
      if (holdingLock) { setState('main'); return; }
      navigator.locks.request('kaapfi-pos-window', { ifAvailable: true }, (lock) => {
        if (!lock) {
          if (cancelled) return undefined;
          if (triesLeft > 0) setTimeout(() => attempt(triesLeft - 1), 400);
          else setState('duplicate');
          return undefined;
        }
        holdingLock = true;
        setState('main');
        return new Promise(() => {}); // hold until this window closes
      });
    };
    attempt(7);
    return () => { cancelled = true; };
  }, []);

  if (state === 'checking') return <div style={{ minHeight: '100vh', background: '#FC8019' }} />;
  if (state === 'main') return <App />;
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FC8019', fontFamily: 'system-ui, sans-serif', padding: '24px' }}>
      <div style={{ background: '#fff', color: '#000', borderRadius: '16px', padding: '36px 28px', maxWidth: '420px', textAlign: 'center' }}>
        <div style={{ fontSize: '52px' }}>☕</div>
        <h1 style={{ fontSize: '22px', margin: '8px 0' }}>Kaapfi POS is already open</h1>
        <p style={{ fontSize: '15px', lineHeight: 1.5, color: '#444' }}>It is running in another window on this computer. Close this one and click the Kaapfi POS icon on the taskbar to go back to it.</p>
        <button onClick={() => window.close()} style={{ width: '100%', padding: '14px', marginTop: '14px', fontSize: '15px', fontWeight: 700, background: '#FC8019', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Close this window</button>
        <button onClick={() => setState('main')} style={{ marginTop: '14px', background: 'none', border: 'none', color: '#888', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}>The other window is stuck — open the POS here</button>
      </div>
    </div>
  );
}

root.render(
  <React.StrictMode>
    {IS_PUBLIC_MENU ? menuClosed : <SingleWindow />}
  </React.StrictMode>
);

// Lets the installed app open with no internet
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => {}); });
}
