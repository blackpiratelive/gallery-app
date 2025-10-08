'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function EditImageModal({ image, albums, onClose, onSave }) {
  const [formData, setFormData] = useState({
    id: image.id,
    title: image.title,
    description: image.description || '',
    album_id: image.album_id || '',
    featured: image.featured === 1,
    tags: image.tags || '',
  });
  const [exifData, setExifData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (image.exif_data) {
      try {
        setExifData(JSON.parse(image.exif_data));
      } catch (e) {
        setExifData({});
      }
    }
  }, [image]);

  const handleSave = async () => {
    setSaving(true);
    const password = sessionStorage.getItem('admin_auth');

    const res = await fetch('/api/metadata', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${password}`,
      },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      onSave();
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-dark border border-white/20 rounded-3xl shadow-2xl">
        <div className="sticky top-0 glass-dark border-b border-white/10 px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-white">Edit Image</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Image Preview */}
          <div className="space-y-4">
            <div className="relative aspect-video glass border border-white/10 rounded-2xl overflow-hidden">
              <Image
                src={image.full_url}
                alt={image.title}
                fill
                className="object-contain"
              />
            </div>

            {/* EXIF Data */}
            {Object.keys(exifData).length > 0 && (
              <div className="glass border border-white/10 rounded-2xl p-4">
                <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">
                  EXIF Data
                </h3>
                <dl className="space-y-2 text-sm">
                  {exifData.Make && (
                    <div className="flex justify-between">
                      <dt className="text-white/40">Camera</dt>
                      <dd className="text-white font-medium">{exifData.Make} {exifData.Model}</dd>
                    </div>
                  )}
                  {exifData.DateTimeOriginal && (
                    <div className="flex justify-between">
                      <dt className="text-white/40">Date</dt>
                      <dd className="text-white font-medium">
                        {new Date(exifData.DateTimeOriginal).toLocaleDateString()}
                      </dd>
                    </div>
                  )}
                  {exifData.FocalLength && (
                    <div className="flex justify-between">
                      <dt className="text-white/40">Focal Length</dt>
                      <dd className="text-white font-medium">{exifData.FocalLength}mm</dd>
                    </div>
                  )}
                  {exifData.FNumber && (
                    <div className="flex justify-between">
                      <dt className="text-white/40">Aperture</dt>
                      <dd className="text-white font-medium">f/{exifData.FNumber}</dd>
                    </div>
                  )}
                  {exifData.ISO && (
                    <div className="flex justify-between">
                      <dt className="text-white/40">ISO</dt>
                      <dd className="text-white font-medium">{exifData.ISO}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
          </div>

          {/* Right: Edit Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Album
              </label>
              <select
                value={formData.album_id}
                onChange={(e) => setFormData({ ...formData, album_id: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all"
              >
                <option value="">No Album</option>
                {albums.map((album) => (
                  <option key={album.id} value={album.id}>
                    {album.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="landscape, nature, sunset"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-5 h-5 bg-white/5 border-white/10 rounded"
              />
              <label htmlFor="featured" className="ml-3 text-sm text-white">
                Mark as Featured
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 glass border border-white/10 rounded-xl hover:bg-white/10 transition-all text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}