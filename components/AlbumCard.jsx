import Link from 'next/link';
import { FolderOpen } from 'lucide-react';

export default function AlbumCard({ album }) {
  return (
    <Link href={`/albums/${album.id}`} className="group">
      <div className="glass rounded-2xl p-6 card-hover">
        <div className="flex items-start gap-4">
          <div className="p-3 glass rounded-xl">
            <FolderOpen className="w-6 h-6 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold mb-1 truncate group-hover:text-blue-400 transition-colors">
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