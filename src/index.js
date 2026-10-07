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

root.render(
  <React.StrictMode>
    {IS_PUBLIC_MENU ? menuClosed : <App />}
  </React.StrictMode>
);

// Lets the installed app open with no internet
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => {}); });
}
