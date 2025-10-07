import Link from 'next/link';
import ImageGrid from '@/components/ImageGrid';

async function getAlbum(id) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/albums?id=${id}`,
    { cache: 'no-store' }
  );
  if (!res.ok) return null;
  return res.json();
}

async function getAlbumImages(albumId) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/images?album=${albumId}`,
    { cache: 'no-store' }
  );
  if (!res.ok) return [];
  return res.json();
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