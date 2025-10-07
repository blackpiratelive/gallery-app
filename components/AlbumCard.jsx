import Link from 'next/link';

export default function AlbumCard({ album }) {
  return (
    <Link href={`/albums/${album.id}`} className="group">
      <div className="bg-white/5 border border-white/10 rounded-lg p-6 group-hover:bg-white/10 transition-colors">
        <h3 className="text-xl font-semibold mb-2">{album.name}</h3>
        {album.description && (
          <p className="text-white/60 text-sm line-clamp-2">{album.description}</p>
        )}
      </div>
    </Link>
  );
}