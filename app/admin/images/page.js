'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import EditImageModal from '@/components/EditImageModal';

function ImageSkeleton() {
  return (
    <div className="glass border border-white/10 rounded-2xl overflow-hidden animate-pulse">
      <div className="relative aspect-square bg-white/5" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-white/10 rounded w-3/4" />
        <div className="h-3 bg-white/10 rounded w-1/2" />
      </div>
    </div>
  );
}

export default function ImagesPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingImage, setEditingImage] = useState(null);
  const [albums, setAlbums] = useState([]);

  useEffect(() => {
    fetchImages();
    fetchAlbums();
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

  const fetchAlbums = async () => {
    const res = await fetch('/api/albums');
    if (res.ok) {
      const data = await res.json();
      setAlbums(data);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this image permanently?')) return;

    const password = sessionStorage.getItem('admin_auth');
    const res = await fetch(`/api/images?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${password}` },
    });

    if (res.ok) {
      setImages(images.filter(img => img.id !== id));
    }
  };

  const toggleFeatured = async (image) => {
    const password = sessionStorage.getItem('admin_auth');
    const res = await fetch('/api/metadata', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${password}`,
      },
      body: JSON.stringify({
        ...image,
        featured: image.featured === 1 ? false : true,
      }),
    });

    if (res.ok) {
      fetchImages();
    }
  };

  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Manage Images</h1>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <ImageSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Manage Images</h1>
        <Link
          href="/admin/upload"
          className="glass border border-white/10 rounded-xl px-6 py-3 font-medium text-white hover:bg-white/10 transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Upload New
        </Link>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-20">
          <div className="glass border border-white/10 rounded-3xl p-12 inline-block">
            <svg className="w-16 h-16 text-white/40 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-white/60">No images uploaded yet</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="glass border border-white/10 rounded-2xl overflow-hidden group card-hover"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="relative aspect-square">
                <Image
                  src={image.thumbnail_url}
                  alt={image.title}
                  fill
                  className="object-cover"
                />
                {image.featured === 1 && (
                  <div className="absolute top-2 right-2 w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center shadow-lg">
                    <span className="text-sm">★</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setEditingImage(image)}
                    className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all"
                    title="Edit"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => toggleFeatured(image)}
                    className="p-2 bg-white/20 rounded-lg hover:bg-yellow-500 transition-all"
                    title="Toggle Featured"
                  >
                    <svg className="w-5 h-5" fill={image.featured === 1 ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(image.id)}
                    className="p-2 bg-red-500/80 rounded-lg hover:bg-red-500 transition-all"
                    title="Delete"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-medium text-white text-sm truncate mb-1">{image.title}</h3>
                <p className="text-xs text-white/40">
                  {new Date(image.created_at * 1000).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingImage && (
        <EditImageModal
          image={editingImage}
          albums={albums}
          onClose={() => setEditingImage(null)}
          onSave={() => {
            setEditingImage(null);
            fetchImages();
          }}
        />
      )}
    </div>
  );
}