'use client';

import { useState } from 'react';

export default function AdminAlbumPasswordForm({ albumId, initialProtected }) {
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');

  async function save(e) {
    e.preventDefault();
    setStatus('Saving...');
    const pass = sessionStorage.getItem('admin_auth');
    const r = await fetch('/api/albums/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${pass}` },
      body: JSON.stringify({ albumId, password }),
    });
    if (r.ok) setStatus('Saved'); else setStatus('Failed');
  }

  return (
    <form onSubmit={save} style={{ display: 'grid', gap: 8 }}>
      <label style={{ fontSize: 14, opacity: .8 }}>Album password (leave blank to remove)</label>
      <input
        type="password"
        value={password}
        placeholder={initialProtected ? '••••••••' : 'Set album password'}
        onChange={(e) => setPassword(e.target.value)}
        style={{ padding: 10, background: '#111', color: '#fff', border: '1px solid #222', borderRadius: 8 }}
      />
      <button type="submit" style={{ padding: 10, borderRadius: 8, background: '#2e6bff', color: '#fff', border: 0 }}>
        Save
      </button>
      {status && <div style={{ fontSize: 12, opacity: .7 }}>{status}</div>}
    </form>
  );
}