import Link from 'next/link';
import { headers } from 'next/headers';
import Image from 'next/image';
import { turso } from '@/lib/db';
import { PresignedImg } from '@/components/PresignedImg';

async function getAlbumAndImages(id) {
  const a = await turso.execute({ sql: 'SELECT * FROM albums WHERE id = ?', args: [id] });
  const album = a.rows[0] || null;
  const i = await turso.execute({
    sql: 'SELECT id, title, description FROM images WHERE album_id = ? ORDER BY created_at DESC',
    args: [id],
  });
  return { album, images: i.rows };
}

export default async function AlbumPage({ params }) {
  const cookieHeader = headers().get('cookie') || '';
  const { album, images } = await getAlbumAndImages(params.id);

  if (!album) {
    return (
      <main style={{ minHeight: '100vh', background: '#000', color: '#fff', padding: 24 }}>
        <p style={{ opacity: .8 }}>Album not found.</p>
        <p style={{ marginTop: 12 }}><Link href="/albums" style={{ color: '#8ab4ff' }}>← Back to Albums</Link></p>
      </main>
    );
  }

  const locked = !!album.password_hash && !cookieHeader.includes(`album_${params.id}=ok`);

  if (locked) {
    return (
      <main style={{ minHeight: '100vh', background: '#000', color: '#fff', padding: 24 }}>
        <h1 style={{ marginBottom: 8 }}>{album.name}</h1>
        {album.description && <p style={{ opacity: .7, marginBottom: 16 }}>{album.description}</p>}
        <div style={{ padding: 16, border: '1px solid #222', borderRadius: 12, background: '#0f0f0f' }}>
          <p style={{ opacity: .8 }}>This album is protected.</p>
          <p style={{ marginTop: 12 }}>
            <Link href={`/album/${params.id}/unlock`} style={{ color: '#8ab4ff' }}>Unlock album →</Link>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: '#000', color: '#fff', padding: 24 }}>
      <header style={{ marginBottom: 16 }}>
        <p><Link href="/albums" style={{ color: '#8ab4ff' }}>← Back to Albums</Link></p>
        <h1 style={{ marginTop: 8 }}>{album.name}</h1>
        {album.description && <p style={{ opacity: .7 }}>{album.description}</p>}
      </header>

      {images.length === 0 ? (
        <p style={{ opacity: .7 }}>No images in this album.</p>
      ) : (
        <div style={{
          display: 'grid',
          gap: 8,
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))'
        }}>
          {images.map((img) => (
            <Link key={img.id} href={`/image/${img.id}`} style={{ display: 'block' }}>
              <div style={{ aspectRatio: '1 / 1', background: '#111', border: '1px solid #222', borderRadius: 8, overflow: 'hidden' }}>
                <PresignedImg imageId={img.id} type="thumb" alt={img.title} />
              </div>
              <div style={{ marginTop: 6, fontSize: 13, opacity: .9 }}>{img.title}</div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}