import Link from 'next/link';
import Image from 'next/image';
import { turso } from '@/lib/db';

async function getAllImages() {
  try {
    const result = await turso.execute('SELECT * FROM images ORDER BY created_at DESC');
    return result.rows;
  } catch (error) {
    return [];
  }
}

export default async function BrowsePage() {
  const images = await getAllImages();

  return (
    <main className="min-h-screen" style={{ background: '#000' }}>
      <header className="glass-dark border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/" className="text-white/60 hover:text-white text-sm flex items-center gap-2 mb-2 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-white">Browse All Images</h1>
          <p className="text-white/60 text-sm mt-2">{images.length} {images.length === 1 ? 'image' : 'images'}</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {images.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-16 h-16 text-white/40 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-white/60">No images yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {images.map((image, index) => (
              <Link
                key={image.id}
                href={`/image/${image.id}`}
                className="group block animate-fade-in"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="relative aspect-square glass border border-white/10 rounded-2xl overflow-hidden card-hover">
                  <Image
                    src={image.thumbnail_url}
                    alt={image.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {image.featured === 1 && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-yellow-500 rounded-lg flex items-center justify-center">
                      <span className="text-xs">★</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="font-semibold text-white truncate text-sm">{image.title}</h3>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}