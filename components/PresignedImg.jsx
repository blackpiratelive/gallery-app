'use client';

import { useEffect, useState } from 'react';

export function PresignedImg({ imageId, type = 'thumb', alt = '' }) {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const r = await fetch(`/api/presign?imageId=${imageId}&type=${type}`);
        if (!r.ok) return;
        const j = await r.json();
        if (active) setSrc(j.url);
      } catch {}
    })();
    return () => { active = false; };
  }, [imageId, type]);

  if (!src) {
    return <div style={{ width: '100%', height: '100%', background: '#111' }} aria-hidden="true" />;
  }

  return <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />;
}