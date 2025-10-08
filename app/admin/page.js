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
    return [];
  }
}

async function getAlbums() {
  try {
    const result = await turso.execute('SELECT * FROM albums ORDER BY created_at DESC');
    return result.rows;
  } catch (error) {
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
    <main className="min-h-screen" style={{ background: '#000' }}>
      {/* Header */}
      <header className="glass-dark border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">Gallery</h1>
            <Link 
              href="/admin" 
              className="glass border border-white/10 rounded-full px-6 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition-all"
            >
              Admin
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Featured */}
        {featured.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <span className="text-yellow-400">★</span> Featured
            </h2>
            <ImageGrid images={featured} />
          </section>
        )}

        {/* Albums */}
        {albums.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              Albums
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {albums.map((album) => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
          </section>
        )}

        {/* Recent */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Recent
          </h2>
          <ImageGrid images={recent} />
        </section>
      </div>
    </main>
  );
}