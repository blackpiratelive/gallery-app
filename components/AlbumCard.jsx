import Link from 'next/link';
import { FolderOpen } from 'lucide-react';

export default function AlbumCard({ album }) {
  return (
    <Link href={`/albums/${album.id}`} className="group">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 transition-all duration-400 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl hover:bg-white/10">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/10 backdrop-blur-xl rounded-xl">
            <FolderOpen className="w-6 h-6 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold mb-1 text-white truncate group-hover:text-blue-400 transition-colors">
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