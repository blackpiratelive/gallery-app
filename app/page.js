import Link from 'next/link';
import ImageGrid from '@/components/ImageGrid';
import AlbumCard from '@/components/AlbumCard';
import { turso } from '@/lib/db';
import { Sparkles, FolderOpen, Clock } from 'lucide-react';

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
      <header className="glass-dark border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">Gallery</h1>
            <Link 
              href="/admin" 
              className="btn-glass rounded-full px-6 py-2.5 text-sm font-medium"
            >
              Admin
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Featured Section */}
        {featured.length > 0 && (
          <section className="fade-in">
            <div className="flex items-center gap-3 mb-8">
              <Sparkles className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-bold">Featured</h2>
            </div>
            <ImageGrid images={featured} />
          </section>
        )}

        {/* Albums Section */}
        {albums.length > 0 && (
          <section className="slide-up">
            <div className="flex items-center gap-3 mb-8">
              <FolderOpen className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold">Albums</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {albums.map((album) => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
          </section>
        )}

        {/* Recent Section */}
        <section className="slide-up">
          <div className="flex items-center gap-3 mb-8">
            <Clock className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold">Recent</h2>
          </div>
          <ImageGrid images={recent} />
        </section>
      </div>
    </main>
  );
}