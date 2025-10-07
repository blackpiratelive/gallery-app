import Link from 'next/link';
import Image from 'next/image';
import { turso } from '@/lib/db';

async function getImage(id) {
  try {
    const result = await turso.execute({
      sql: 'SELECT * FROM images WHERE id = ?',
      args: [id],
    });
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
}

export default async function ImagePage({ params }) {
  const { id } = params;
  const image = await getImage(id);

  if (!image) {
    return <div className="min-h-screen flex items-center justify-center">Image not found</div>;
  }

  const exif = image.exif_data ? JSON.parse(image.exif_data) : {};
  const tags = image.tags ? image.tags.split(',') : [];

  return (
    <main className="min-h-screen">
      <header className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/" className="text-white/60 hover:text-white transition-colors text-sm">
            ← Back to Gallery
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image */}
          <div className="lg:col-span-2">
            <div className="relative aspect-video w-full bg-white/5 rounded-lg overflow-hidden">
              <Image
                src={image.full_url}
                alt={image.title}
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Metadata */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">{image.title}</h1>
              {image.description && (
                <p className="text-white/60">{image.description}</p>
              )}
            </div>

            {tags.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, idx) => (
                    <span key={idx} className="px-3 py-1 bg-white/10 rounded-full text-sm">
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {Object.keys(exif).length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3">EXIF Data</h3>
                <dl className="space-y-2 text-sm">
                  {exif.Make && (
                    <>
                      <dt className="text-white/40">Camera</dt>
                      <dd className="mb-3">{exif.Make} {exif.Model}</dd>
                    </>
                  )}
                  {exif.DateTimeOriginal && (
                    <>
                      <dt className="text-white/40">Date Taken</dt>
                      <dd className="mb-3">{new Date(exif.DateTimeOriginal).toLocaleDateString()}</dd>
                    </>
                  )}
                  {exif.FocalLength && (
                    <>
                      <dt className="text-white/40">Focal Length</dt>
                      <dd className="mb-3">{exif.FocalLength}mm</dd>
                    </>
                  )}
                  {exif.FNumber && (
                    <>
                      <dt className="text-white/40">Aperture</dt>
                      <dd className="mb-3">f/{exif.FNumber}</dd>
                    </>
                  )}
                  {exif.ISO && (
                    <>
                      <dt className="text-white/40">ISO</dt>
                      <dd className="mb-3">{exif.ISO}</dd>
                    </>
                  )}
                  {exif.ExposureTime && (
                    <>
                      <dt className="text-white/40">Shutter Speed</dt>
                      <dd className="mb-3">{exif.ExposureTime}s</dd>
                    </>
                  )}
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}