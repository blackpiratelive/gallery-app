'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';

export default function AddImagesToAlbumModal({ album, onClose }) {
  const [images, setImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const observer = useRef();

  const lastImageRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  useEffect(() => {
    fetchImages();
  }, [page]);

  const fetchImages = async () => {
    setLoading(true);
    const res = await fetch('/api/images');
    if (res.ok) {
      const data = await res.json();
      // Filter out images already in this album
      const filtered = data.filter(img => img.album_id !== album.id);
      setImages(filtered);
      setHasMore(false); // Disable infinite scroll for now, load all at once
    }
    setLoading(false);
  };

  const toggleImage = (imageId) => {
    if (selectedImages.includes(imageId)) {
      setSelectedImages(selectedImages.filter(id => id !== imageId));
    } else {
      setSelectedImages([...selectedImages, imageId]);
    }
  };

  const handleSave = async () => {
    const password = sessionStorage.getItem('admin_auth');

    for (const imageId of selectedImages) {
      const image = images.find(img => img.id === imageId);
      await fetch('/api/metadata', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify({
          ...image,
          album_id: album.id,
        }),
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col glass-dark border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Add Images to {album.name}</h2>
            <p className="text-sm text-white/60 mt-1">{selectedImages.length} selected</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {images.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/60">No available images</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((image, index) => {
                const isSelected = selectedImages.includes(image.id);
                const ref = index === images.length - 1 ? lastImageRef : null;

                return (
                  <div
                    key={image.id}
                    ref={ref}
                    onClick={() => toggleImage(image.id)}
                    className={`relative aspect-square border rounded-xl overflow-hidden cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-400 ring-4 ring-blue-400/30 scale-95'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <Image
                      src={image.thumbnail_url}
                      alt={image.title}
                      fill
                      className="object-cover"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-blue-500/30 flex items-center justify-center">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          
          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square bg-white/5 rounded-xl animate-pulse" />
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 glass border border-white/10 rounded-xl hover:bg-white/10 transition-all text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={selectedImages.length === 0}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Add {selectedImages.length} Image{selectedImages.length !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}