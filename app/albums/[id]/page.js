import Link from 'next/link';
import ImageGrid from '@/components/ImageGrid';
import { turso } from '@/lib/db';

async function getAlbum(id) {
  try {
    const result = await turso.execute({
      sql: 'SELECT * FROM albums WHERE id = ?',
      args: [id],
    });
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching album:', error);
    return null;
  }
}

async function getAlbumImages(albumId) {
  try {
    const result = await turso.execute({
      sql: 'SELECT * FROM images WHERE album_id = ? ORDER BY created_at DESC',
      args: [albumId],
    });
    return result.rows;
  } catch (error) {
    console.error('Error fetching album images:', error);
    return [];
  }
}

export default async function AlbumPage({ params }) {
  const { id } = params;
  const [album, images] = await Promise.all([
    getAlbum(id),
    getAlbumImages(id),
  ]);

  if (!album) {
    return <div className="min-h-screen flex items-center justify-center">Album not found</div>;
  }

  return (
    <main className="min-h-screen">
      <header className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/" className="text-white/60 hover:text-white transition-colors text-sm mb-2 inline-block">
            ← Back to Gallery
          </Link>
          <h1 className="text-3xl font-bold">{album.name}</h1>
          {album.description && (
            <p className="text-white/60 mt-2">{album.description}</p>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {images.length === 0 ? (
          <p className="text-white/40 text-center py-12">No images in this album yet.</p>
        ) : (
          <ImageGrid images={images} />
        )}
      </div>
    </main>
  );
}