import Link from 'next/link';
import Image from 'next/image';

export default function ImageCard({ image }) {
  return (
    <Link href={`/image/${image.id}`} className="group block">
      <div className="relative aspect-square bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden transition-all duration-400 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl">
        <Image
          src={image.thumbnail_url}
          alt={image.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-semibold text-white truncate">{image.title}</h3>
          </div>
        </div>
      </div>
    </Link>
  );
}