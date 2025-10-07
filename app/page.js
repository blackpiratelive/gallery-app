import Link from 'next/link';
import ImageGrid from '@/components/ImageGrid';
import AlbumCard from '@/components/AlbumCard';
import { turso } from '@/lib/db';

async function getRecentImages() {
  try {
    const result = await turso.execute({
      sql: 'SELECT * FROM images ORDER BY created_at DESC LIMIT ?',
      args: [12],
    });
    return result.rows;
  } catch (error) {
    console.error('Error fetching recent images:', error);
    return [];
  }
}

async function getFeaturedImages() {
  try {
    const result = await turso.execute({
      sql: 'SELECT * FROM images WHERE featured = 1 ORDER BY created_at DESC LIMIT ?',
      args: [6],
    });
    return result.rows;
  } catch (error) {
    console.error('Error fetching featured images:', error);
    return [];
  }
}

async function getAlbums() {
  try {
    const result = await turso.execute('SELECT * FROM albums ORDER BY created_at DESC');
    return result.rows;
  } catch (error) {
    console.error('Error fetching albums:', error);
    return [];
  }
}

export default async function Home() {
  const [featured, recent, albums] = await Promise.all([
    getFeaturedImages(),
    getRecentImages(),
    getAlbums(),
  ]);

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Gallery</h1>
            <Link 
              href="/admin" 
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Section */}
        {featured.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">Featured</h2>
            <ImageGrid images={featured} />
          </section>
        )}

        {/* Albums Section */}
        {albums.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">Albums</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {albums.map((album) => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
          </section>
        )}

        {/* Recent Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Recent</h2>
          <ImageGrid images={recent} />
        </section>
      </div>
    </main>
  );
}