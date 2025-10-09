'use client';

import { useEffect, useState } from 'react';

export function PresignedFull({ imageId, alt = '' }) {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    let timer;
    async function load() {
      try {
        const r = await fetch(`/api/presign?imageId=${imageId}&type=full`, { cache: 'no-store' });
        if (!r.ok) return;
        const j = await r.json();
        setSrc(j.url);
        // Refresh before expiry (60s)
        timer = setTimeout(load, 55_000);
      } catch {}
    }
    load();
    return () => { if (timer) clearTimeout(timer); };
  }, [imageId]);

  if (!src) {
    return <div style={{ width: '100%', height: '60vh', background: '#111' }} aria-hidden="true" />;
  }

  return <img src={src} alt={alt} style={{ width: '100%', height: 'auto', display: 'block' }} />;
}