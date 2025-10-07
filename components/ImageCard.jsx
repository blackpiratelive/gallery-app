import Link from 'next/link';
import Image from 'next/image';

export default function ImageCard({ image }) {
  return (
    <Link href={`/image/${image.id}`} className="group block">
      <div className="relative aspect-square bg-white/5 rounded-lg overflow-hidden">
        <Image
          src={image.thumbnail_url}
          alt={image.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <h3 className="mt-3 font-medium truncate group-hover:text-white/80 transition-colors">
        {image.title}
      </h3>
    </Link>
  );
}