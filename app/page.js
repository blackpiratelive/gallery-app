import Link from 'next/link';
import Image from 'next/image';
import { turso } from '@/lib/db';

async function getFeaturedImages() {
  try {
    const result = await turso.execute({
      sql: 'SELECT * FROM images WHERE featured = 1 ORDER BY created_at DESC LIMIT ?',
      args: [4],
    });
    return result.rows;
  } catch (error) {
    return [];
  }
}

async function getAlbumsWithImages() {
  try {
    const albumsResult = await turso.execute({
      sql: 'SELECT * FROM albums ORDER BY created_at DESC LIMIT 3',
    });
    
    const albumsWithImages = await Promise.all(
      albumsResult.rows.map(async (album) => {
        const imagesResult = await turso.execute({
          sql: 'SELECT * FROM images WHERE album_id = ? ORDER BY created_at DESC LIMIT 2',
          args: [album.id],
        });
        return {
          ...album,
          images: imagesResult.rows,
        };
      })
    );
    
    return albumsWithImages;
  } catch (error) {
    return [];
  }
}

async function getRecentImages() {
  try {
    const result = await turso.execute({
      sql: 'SELECT * FROM images ORDER BY created_at DESC LIMIT 6',
    });
    return result.rows;
  } catch (error) {
    return [];
  }
}

export default async function Home() {
  const [featured, albumsWithImages, recent] = await Promise.all([
    getFeaturedImages(),
    getAlbumsWithImages(),
    getRecentImages(),
  ]);

  return (
    <main className="min-h-screen" style={{ background: '#000' }}>
      {/* Header */}
      <header className="glass-dark border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Gallery</h1>
              <p className="text-white/60 text-sm">by BlackPiratex</p>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/featured" 
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Featured
              </Link>
              <Link 
                href="/browse" 
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Browse
              </Link>
              <Link 
                href="/tags" 
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                Tags
              </Link>
              <Link 
                href="/admin" 
                className="glass border border-white/10 rounded-full px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-all"
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="py-20 text-center animate-fade-in">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            A curated collection<br />of images
          </h2>
          <p className="text-xl text-white/60 mb-8">by BlackPiratex</p>
          <div className="flex justify-center gap-4">
            <Link
              href="/browse"
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-2xl hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg"
            >
              Browse All Images
            </Link>
            <Link
              href="/albums"
              className="px-8 py-4 glass border border-white/10 text-white font-semibold rounded-2xl hover:bg-white/10 transition-all"
            >
              View Albums
            </Link>
          </div>
        </section>

        {/* Featured Section */}
        {featured.length > 0 && (
          <section className="py-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <span className="text-yellow-400">★</span> Featured
              </h2>
              <Link
                href="/featured"
                className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-1"
              >
                View All
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featured.map((image, index) => (
                <Link
                  key={image.id}
                  href={`/image/${image.id}`}
                  className="group block"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative aspect-square glass border border-white/10 rounded-2xl overflow-hidden card-hover">
                    <Image
                      src={image.thumbnail_url}
                      alt={image.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="font-semibold text-white truncate">{image.title}</h3>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Albums Section */}
        {albumsWithImages.length > 0 && (
          <section className="py-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                Albums
              </h2>
            </div>

            <div className="space-y-12">
              {albumsWithImages.map((album, albumIndex) => (
                <div key={album.id} className="animate-fade-in" style={{ animationDelay: `${albumIndex * 150}ms` }}>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white">{album.name}</h3>
                      {album.description && (
                        <p className="text-white/60 text-sm mt-1">{album.description}</p>
                      )}
                    </div>
                    <Link
                      href={`/album/${album.id}`}
                      className="glass border border-white/10 rounded-xl px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-all flex items-center gap-2"
                    >
                      View All
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>

                  {album.images.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                      {album.images.map((image) => (
                        <Link
                          key={image.id}
                          href={`/image/${image.id}`}
                          className="group block"
                        >
                          <div className="relative aspect-video glass border border-white/10 rounded-2xl overflow-hidden card-hover">
                            <Image
                              src={image.thumbnail_url}
                              alt={image.title}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="absolute bottom-0 left-0 right-0 p-4">
                                <h4 className="font-semibold text-white truncate text-sm">{image.title}</h4>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="glass border border-white/10 rounded-2xl p-8 text-center">
                      <p className="text-white/40">No images in this album yet</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/albums"
                className="inline-flex items-center gap-2 px-8 py-4 glass border border-white/10 text-white font-semibold rounded-2xl hover:bg-white/10 transition-all"
              >
                View All Albums
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </section>
        )}

        {/* Recent Section */}
        {recent.length > 0 && (
          <section className="py-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recent
              </h2>
              <Link
                href="/browse"
                className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-1"
              >
                View All
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {recent.map((image, index) => (
                <Link
                  key={image.id}
                  href={`/image/${image.id}`}
                  className="group block"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative aspect-square glass border border-white/10 rounded-2xl overflow-hidden card-hover">
                    <Image
                      src={image.thumbnail_url}
                      alt={image.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-white/60 text-sm">
            <p>© 2025 BlackPiratex. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}