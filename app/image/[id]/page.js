import Link from 'next/link';
import Image from 'next/image';
import { turso } from '@/lib/db';
import { ArrowLeft, Download, Calendar, Camera, Aperture, Zap, Sun, Clock } from 'lucide-react';
import DownloadButton from '@/components/DownloadButton';

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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-white/60">Image not found</p>
        </div>
      </div>
    );
  }

  const exif = image.exif_data ? JSON.parse(image.exif_data) : {};
  const tags = image.tags ? image.tags.split(',') : [];

  return (
    <main className="min-h-screen pb-20">
      {/* Header */}
      <header className="glass-dark sticky top-0 z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Gallery</span>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image Section */}
          <div className="lg:col-span-2 fade-in">
            <div className="relative aspect-video w-full glass rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={image.full_url}
                alt={image.title}
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Download Button */}
            <DownloadButton imageUrl={image.full_url} title={image.title} />
          </div>

          {/* Metadata Section */}
          <div className="space-y-6 slide-up">
            {/* Title & Description Card */}
            <div className="glass rounded-2xl p-6 card-hover">
              <h1 className="text-2xl font-bold mb-3">{image.title}</h1>
              {image.description && (
                <p className="text-white/70 leading-relaxed">{image.description}</p>
              )}
            </div>

            {/* Tags Card */}
            {tags.length > 0 && (
              <div className="glass rounded-2xl p-6 card-hover">
                <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, idx) => (
                    <span 
                      key={idx} 
                      className="px-3 py-1.5 glass rounded-full text-sm font-medium hover:bg-white/10 transition-colors"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* EXIF Data Card */}
            {Object.keys(exif).length > 0 && (
              <div className="glass rounded-2xl p-6 card-hover">
                <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4">
                  Camera Details
                </h3>
                <dl className="space-y-4">
                  {exif.Make && (
                    <div className="flex items-start gap-3">
                      <Camera className="w-5 h-5 text-white/40 mt-0.5 flex-shrink-0" />
                      <div>
                        <dt className="text-xs text-white/40 mb-1">Camera</dt>
                        <dd className="text-sm font-medium">{exif.Make} {exif.Model}</dd>
                      </div>
                    </div>
                  )}
                  {exif.DateTimeOriginal && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-white/40 mt-0.5 flex-shrink-0" />
                      <div>
                        <dt className="text-xs text-white/40 mb-1">Date Taken</dt>
                        <dd className="text-sm font-medium">
                          {new Date(exif.DateTimeOriginal).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </dd>
                      </div>
                    </div>
                  )}
                  {exif.FocalLength && (
                    <div className="flex items-start gap-3">
                      <Zap className="w-5 h-5 text-white/40 mt-0.5 flex-shrink-0" />
                      <div>
                        <dt className="text-xs text-white/40 mb-1">Focal Length</dt>
                        <dd className="text-sm font-medium">{exif.FocalLength}mm</dd>
                      </div>
                    </div>
                  )}
                  {exif.FNumber && (
                    <div className="flex items-start gap-3">
                      <Aperture className="w-5 h-5 text-white/40 mt-0.5 flex-shrink-0" />
                      <div>
                        <dt className="text-xs text-white/40 mb-1">Aperture</dt>
                        <dd className="text-sm font-medium">f/{exif.FNumber}</dd>
                      </div>
                    </div>
                  )}
                  {exif.ISO && (
                    <div className="flex items-start gap-3">
                      <Sun className="w-5 h-5 text-white/40 mt-0.5 flex-shrink-0" />
                      <div>
                        <dt className="text-xs text-white/40 mb-1">ISO</dt>
                        <dd className="text-sm font-medium">{exif.ISO}</dd>
                      </div>
                    </div>
                  )}
                  {exif.ExposureTime && (
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-white/40 mt-0.5 flex-shrink-0" />
                      <div>
                        <dt className="text-xs text-white/40 mb-1">Shutter Speed</dt>
                        <dd className="text-sm font-medium">{exif.ExposureTime}s</dd>
                      </div>
                    </div>
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