import Link from 'next/link';
import Image from 'next/image';
import { turso } from '@/lib/db';

async function getFeaturedImages() {
  try {
    const result = await turso.execute({
      sql: 'SELECT * FROM images WHERE featured = 1 ORDER BY created_at DESC',
    });
    return result.rows;
  } catch (error) {
    return [];
  }
}

export default async function FeaturedPage() {
  const images = await getFeaturedImages();

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
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <span className="text-yellow-400">★</span> Featured Images
          </h1>
          <p className="text-white/60 text-sm mt-2">{images.length} {images.length === 1 ? 'image' : 'images'}</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {images.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-6xl mb-4 block">★</span>
            <p className="text-white/60">No featured images yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <Link
                key={image.id}
                href={`/image/${image.id}`}
                className="group block animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="relative aspect-square glass border border-white/10 rounded-2xl overflow-hidden card-hover">
                  <Image
                    src={image.thumbnail_url}
                    alt={image.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-2 right-2 w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-sm">★</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-semibold text-white truncate">{image.title}</h3>
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