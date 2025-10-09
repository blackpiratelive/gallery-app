'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UnlockAlbum({ params }) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  async function submit(e) {
    e.preventDefault();
    setErr('');
    const r = await fetch('/api/albums/unlock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ albumId: params.id, password }),
    });
    if (r.ok) {
      router.replace(`/album/${params.id}`);
    } else {
      const j = await r.json().catch(() => ({}));
      setErr(j.error || 'Invalid password');
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'grid', placeItems: 'center', padding: 24 }}>
      <form onSubmit={submit} style={{ width: '100%', maxWidth: 380 }}>
        <h1 style={{ marginBottom: 12, fontSize: 24 }}>Unlock Album</h1>
        <p style={{ opacity: .7, marginBottom: 16 }}>Enter the album password to view images.</p>
        <input
          type="password"
          placeholder="Album password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: 12, background: '#111', color: '#fff', border: '1px solid #222', borderRadius: 8 }}
        />
        {err && <p style={{ color: '#ff7777', fontSize: 13, marginTop: 8 }}>{err}</p>}
        <button type="submit" style={{ marginTop: 12, width: '100%', padding: 12, borderRadius: 8, background: '#2e6bff', color: '#fff', border: 0 }}>
          Unlock
        </button>
      </form>
    </div>
  );
}