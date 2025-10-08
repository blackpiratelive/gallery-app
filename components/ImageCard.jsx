import Link from 'next/link';
import Image from 'next/image';

export default function ImageCard({ image }) {
  return (
    <Link href={`/image/${image.id}`} className="block group">
      <div className="relative aspect-square glass border border-white/10 rounded-2xl overflow-hidden card-hover">
        <Image
          src={image.thumbnail_url}
          alt={image.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-semibold text-white truncate">{image.title}</h3>
          </div>
        </div>
      </div>
    </Link>
  );
}