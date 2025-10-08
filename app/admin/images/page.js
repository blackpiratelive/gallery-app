'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function ImagesPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const res = await fetch('/api/images');
      if (res.ok) {
        const data = await res.json();
        setImages(data);
      }
    } catch (error) {
      console.error('Failed to fetch images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this image?')) return;

    const password = sessionStorage.getItem('admin_auth');
    const res = await fetch(`/api/images?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${password}` },
    });

    if (res.ok) {
      fetchImages();
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading images...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Images</h1>
        <Link
          href="/admin/upload"
          className="px-4 py-2 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition-colors"
        >
          Upload New
        </Link>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-12 text-white/40">
          No images uploaded yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="bg-white/5 border border-white/10 rounded-lg overflow-hidden group"
            >
              <div className="relative aspect-square">
                <Image
                  src={image.thumbnail_url}
                  alt={image.title}
                  fill
                  className="object-cover"
                />
                {image.featured === 1 && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-500 text-black text-xs font-bold rounded">
                    ★
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-medium truncate text-sm mb-2">{image.title}</h3>
                <div className="flex gap-2">
                  <Link
                    href={`/image/${image.id}`}
                    target="_blank"
                    className="text-xs text-white/60 hover:text-white transition-colors"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleDelete(image.id)}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}