import Link from 'next/link';

export default function AlbumCard({ album }) {
  return (
    <Link href={`/albums/${album.id}`} className="block group">
      <div className="glass border border-white/10 rounded-2xl p-6 card-hover hover:bg-white/10">
        <div className="flex items-start gap-4">
          <div className="p-3 glass border border-white/10 rounded-xl flex-shrink-0">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white truncate group-hover:text-blue-400 transition-colors mb-1">
              {album.name}
            </h3>
            {album.description && (
              <p className="text-white/60 text-sm line-clamp-2">{album.description}</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}