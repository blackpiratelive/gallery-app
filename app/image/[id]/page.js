// app/image/[id]/page.js
import Link from 'next/link';
import { headers } from 'next/headers';
import { turso } from '@/lib/db';
import { ArrowLeft, Calendar, Camera, Aperture, Zap, Sun, Clock } from 'lucide-react';
import { PresignedFull } from '@/components/PresignedFull';
import { PresignedImg } from '@/components/PresignedImg';

// Load image + album for privacy + titles
async function getImageWithAlbum(id) {
  try {
    const r = await turso.execute({
      sql: `
        SELECT i.*, a.password_hash AS album_password_hash, a.id AS a_id
        FROM images i
        LEFT JOIN albums a ON a.id = i.album_id
        WHERE i.id = ?
      `,
      args: [id],
    });
    return r.rows[0] || null;
  } catch (e) {
    return null;
  }
}

export default async function ImagePage({ params }) {
  const h = headers();
  const cookieHeader = h.get('cookie') || '';
  const image = await getImageWithAlbum(params.id);

  if (!image) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-white/60">Image not found</p>
        </div>
      </div>
    );
  }

  // Effective privacy: album password OR image.is_private unless override_public=1
  const albumProtected = !!image.album_password_hash;
  const overridePublic = image.override_public === 1;
  const isPrivate = overridePublic ? false : (albumProtected || image.is_private === 1);

  // If album is protected and cookie absent, prompt unlock
  if (albumProtected && !cookieHeader.includes(`album_${image.album_id}=ok`)) {
    return (
      <main className="min-h-screen pb-20">
        <header className="glass-dark sticky top-0 z-50 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors group">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Gallery</span>
            </Link>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="glass rounded-2xl p-8 text-center">
            <h1 className="text-2xl font-bold mb-2">{image.title}</h1>
            <p className="text-white/60">This image is in a protected album.</p>
            <Link
              href={`/album/${image.album_id}/unlock`}
              className="inline-block mt-6 px-5 py-3 bg-white text-black rounded-xl hover:bg-white/90 transition-colors"
            >
              Unlock Album
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const exif = image.exif_data ? JSON.parse(image.exif_data) : {};
  const tags = image.tags ? image.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

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
              {/* Progressive: show thumb first while full presigned loads */}
              <div className="absolute inset-0">
                <PresignedImg imageId={image.id} type="thumb" alt={image.title} />
              </div>
              <div className="absolute inset-0">
                <PresignedFull imageId={image.id} alt={image.title} />
              </div>
            </div>

            {/* Download Button via short‑lived presign */}
            <div className="w-full mt-6 btn-glass rounded-2xl px-6 py-4 flex items-center justify-center gap-3 font-medium">
              {/* A small client snippet to invoke the same presign URL and force download */}
              <DownloadClient imageId={image.id} title={image.title} />
            </div>
          </div>

          {/* Metadata Section */}
          <div className="space-y-6 slide-up">
            {/* Title & Description Card */}
            <div className="glass rounded-2xl p-6 card-hover">
              <h1 className="text-2xl font-bold mb-3">{image.title}</h1>
              {image.description && (
                <p className="text-white/70 leading-relaxed">{image.description}</p>
              )}
              {isPrivate && (
                <p className="text-xs text-yellow-400 mt-3">Private • served via short‑lived URL</p>
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
                      {tag}
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

/* Client-only download that pulls a short-lived URL and triggers save */
function DownloadClient({ imageId, title }) {
  return (
    <button
      onClick={async () => {
        try {
          const r = await fetch(`/api/presign?imageId=${imageId}&type=full`, { cache: 'no-store' });
          if (!r.ok) return;
          const { url } = await r.json();
          const resp = await fetch(url);
          const blob = await resp.blob();
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = `${title || 'image'}.jpg`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        } catch {}
      }}
      className="inline-flex items-center gap-2"
      title="Download full size"
    >
      {/* Inline icon to avoid extra imports */}
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 3v12m0 0l-4-4m4 4l4-4" />
      </svg>
      <span>Download Full Size</span>
    </button>
  );
}