'use client';

import Image from 'next/image';

export default function HeroImageGrid({ images }) {
  if (!images || images.length === 0) {
    return (
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-5 gap-2 h-full">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="relative aspect-square bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  // Ensure we have exactly 20 images by repeating if necessary
  const gridImages = [];
  while (gridImages.length < 20) {
    gridImages.push(...images.slice(0, Math.min(20 - gridImages.length, images.length)));
  }

  return (
    <div className="absolute inset-0 opacity-20">
      <div className="grid grid-cols-5 gap-2 h-full">
        {gridImages.slice(0, 20).map((image, index) => (
          <div key={index} className="relative aspect-square">
            <Image
              src={image.thumbnail_url}
              alt=""
              fill
              className="object-cover"
              sizes="20vw"
              priority={index < 10}
            />
          </div>
        ))}
      </div>
    </div>
  );
}