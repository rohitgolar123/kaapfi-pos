import React, { useState, useEffect, useRef } from 'react';
import { runSetup, setupFromBackup, markSetupDone } from './sync';
import { backupSupported, restoreFromFolder } from './backup';

const page = { minHeight: '100vh', background: 'linear-gradient(135deg, #FC8019 0%, #E64A19 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', padding: '20px' };
const card = { background: '#fff', padding: '36px 32px', borderRadius: '16px', maxWidth: '460px', width: '100%', textAlign: 'center', color: '#000' };
const btn = (bg, color = '#fff') => ({ width: '100%', padding: '14px', fontSize: '15px', fontWeight: 700, background: bg, color, border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '10px' });
const note = { fontSize: '13px', color: '#555', lineHeight: 1.5, margin: '8px 0 0' };

// First run on a device: copies the café's data onto it once. After this the POS never needs the internet.
export default function SetupScreen({ autoStart, onDone, onOwner }) {
  const [phase, setPhase] = useState(autoStart ? 'running' : 'choose'); // choose | running | no-menu | error
  const [error, setError] = useState('');
  const fileRef = useRef(null);
  const started = useRef(false);

  const start = async (allowDefaults = false) => {
    setPhase('running'); setError('');
    try { onDone(await runSetup({ allowDefaults })); }
    catch (e) {
      if (e.message === 'MENU_UNAVAILABLE') setPhase('no-menu');
      else { setError(e.message || String(e)); setPhase('error'); }
    }
  };

  useEffect(() => {
    if (autoStart && !started.current) { started.current = true; start(); }
  }, []); // eslint-disable-line

  const restore = async (file) => {
    if (!file) return;
    setPhase('running'); setError('');
    try { await setupFromBackup(JSON.parse(await file.text())); onDone({ menuSource: 'backup-file' }); }
    catch (e) { setError(e.message || 'Could not read that file'); setPhase('error'); }
  };

  const restoreFolder = async () => {
    try {
      const { latest } = await restoreFromFolder();
      setPhase('running');
      await markSetupDone();
      alert(`✅ Restored from the backup folder. Data is as of ${new Date(latest).toLocaleString('en-IN')}.`);
      onDone({ menuSource: 'backup-folder' });
    } catch (e) {
      if (e.name === 'AbortError') return;
      setError(e.message || 'Could not restore from that folder'); setPhase('error');
    }
  };
  const restoreButtons = (<>
    {backupSupported && <button style={btn('#2E7D32')} onClick={restoreFolder}>Restore from backup folder</button>}
    <button style={btn('#eee', '#333')} onClick={() => fileRef.current.click()}>Restore from a backup file</button>
  </>);

  return (
    <div style={page}>
      <div style={card}>
        <div style={{ fontSize: '56px' }}>☕</div>
        <h1 style={{ margin: '8px 0 4px', fontSize: '24px', fontWeight: 700 }}>Kaapfi 90's</h1>

        {phase === 'choose' && (<>
          <p style={note}>Choose how this device will be used.</p>
          <button style={btn('#FC8019')} onClick={() => start()}>This is the café billing device</button>
          <p style={note}>Copies your menu, settings and customers onto this device once. After that, billing works with no internet.</p>
          <button style={btn('#1a1a2e')} onClick={onOwner}>I'm the owner — show me reports</button>
          <p style={note}>Shows the night reports uploaded by the café device. Nothing is stored here.</p>
          <p style={{ ...note, fontWeight: 700, marginTop: '16px' }}>Was the app uninstalled or reset on this computer?</p>
          {restoreButtons}
        </>)}

        {phase === 'running' && (<>
          <p style={{ ...note, fontSize: '15px' }}>Setting up this device…</p>
          <p style={note}>Copying your menu and today's orders. This takes a few seconds.</p>
        </>)}

        {phase === 'no-menu' && (<>
          <p style={{ ...note, color: '#B71C1C', fontWeight: 700 }}>Your saved menu could not be downloaded.</p>
          <p style={note}>The cloud is not reachable right now and this device has no saved copy. Check the internet and try again. Do not start billing with the built-in menu unless you are sure its prices are correct.</p>
          <button style={btn('#FC8019')} onClick={() => start()}>Try again</button>
          {restoreButtons}
          <button style={btn('#fff', '#B71C1C')} onClick={() => { if (window.confirm('Start with the built-in menu? Any menu or price changes you made earlier will NOT be included.')) start(true); }}>Start with the built-in menu</button>
        </>)}

        {phase === 'error' && (<>
          <p style={{ ...note, color: '#B71C1C', fontWeight: 700 }}>Setup did not finish.</p>
          <p style={note}>{error}</p>
          <button style={btn('#FC8019')} onClick={() => start()}>Try again</button>
          {restoreButtons}
        </>)}

        <input ref={fileRef} type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={(e) => restore(e.target.files[0])} />
      </div>
    </div>
  );
}
