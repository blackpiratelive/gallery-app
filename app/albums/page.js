import Link from 'next/link';
import Image from 'next/image';
import { turso } from '@/lib/db';

async function getAllAlbumsWithPreview() {
  try {
    const albumsResult = await turso.execute('SELECT * FROM albums ORDER BY created_at DESC');
    
    const albumsWithPreviews = await Promise.all(
      albumsResult.rows.map(async (album) => {
        const imagesResult = await turso.execute({
          sql: 'SELECT * FROM images WHERE album_id = ? ORDER BY created_at DESC LIMIT 1',
          args: [album.id],
        });
        
        const countResult = await turso.execute({
          sql: 'SELECT COUNT(*) as count FROM images WHERE album_id = ?',
          args: [album.id],
        });
        
        return {
          ...album,
          preview: imagesResult.rows[0] || null,
          imageCount: countResult.rows[0].count,
        };
      })
    );
    
    return albumsWithPreviews;
  } catch (error) {
    return [];
  }
}

export default async function AlbumsPage() {
  const albums = await getAllAlbumsWithPreview();

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
          <h1 className="text-3xl font-bold text-white">All Albums</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {albums.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-16 h-16 text-white/40 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <p className="text-white/60">No albums yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.map((album, index) => (
              <Link
                key={album.id}
                href={`/album/${album.id}`}
                className="group block animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="glass border border-white/10 rounded-2xl overflow-hidden card-hover">
                  <div className="relative aspect-video bg-white/5">
                    {album.preview ? (
                      <Image
                        src={album.preview.thumbnail_url}
                        alt={album.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-12 h-12 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                      {album.name}
                    </h3>
                    {album.description && (
                      <p className="text-white/60 text-sm mb-3 line-clamp-2">{album.description}</p>
                    )}
                    <p className="text-white/40 text-sm">
                      {album.imageCount} {album.imageCount === 1 ? 'image' : 'images'}
                    </p>
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