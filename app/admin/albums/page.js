'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import AddImagesToAlbumModal from '@/components/AddImagesToAlbumModal';

export default function AlbumsPage() {
  const [albums, setAlbums] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newAlbum, setNewAlbum] = useState({ name: '', description: '' });
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [albumImages, setAlbumImages] = useState([]);
  const [showAddImages, setShowAddImages] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    setLoading(true);
    const res = await fetch('/api/albums');
    if (res.ok) {
      const data = await res.json();
      setAlbums(data);
    }
    setLoading(false);
  };

  const fetchAlbumImages = async (albumId) => {
    const res = await fetch(`/api/images?album=${albumId}`);
    if (res.ok) {
      const data = await res.json();
      setAlbumImages(data);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const password = sessionStorage.getItem('admin_auth');

    const res = await fetch('/api/albums', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${password}`,
      },
      body: JSON.stringify(newAlbum),
    });

    if (res.ok) {
      setNewAlbum({ name: '', description: '' });
      setShowCreate(false);
      fetchAlbums();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this album?')) return;

    const password = sessionStorage.getItem('admin_auth');
    const res = await fetch(`/api/albums?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${password}` },
    });

    if (res.ok) {
      fetchAlbums();
      if (selectedAlbum?.id === id) {
        setSelectedAlbum(null);
      }
    }
  };

  const handleSelectAlbum = async (album) => {
    setSelectedAlbum(album);
    await fetchAlbumImages(album.id);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass border border-white/10 rounded-2xl p-6 animate-pulse">
            <div className="h-6 bg-white/10 rounded w-1/3 mb-2" />
            <div className="h-4 bg-white/10 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Albums</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="glass border border-white/10 rounded-xl px-6 py-3 font-medium text-white hover:bg-white/10 transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Album
        </button>
      </div>

      {showCreate && (
        <div className="glass border border-white/10 rounded-2xl p-6 mb-8 animate-slide-down">
          <form onSubmit={handleCreate} className="space-y-4">
            <input
              type="text"
              value={newAlbum.name}
              onChange={(e) => setNewAlbum({ ...newAlbum, name: e.target.value })}
              placeholder="Album name"
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all"
            />
            <textarea
              value={newAlbum.description}
              onChange={(e) => setNewAlbum({ ...newAlbum, description: e.target.value })}
              placeholder="Description (optional)"
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all resize-none"
            />
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-6 py-3 glass border border-white/10 rounded-xl hover:bg-white/10 transition-all text-white"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Albums List */}
        <div className="lg:col-span-1 space-y-3">
          {albums.map((album, index) => (
            <div
              key={album.id}
              onClick={() => handleSelectAlbum(album)}
              className={`glass border rounded-2xl p-4 cursor-pointer transition-all card-hover ${
                selectedAlbum?.id === album.id
                  ? 'border-blue-400 bg-blue-500/10'
                  : 'border-white/10 hover:bg-white/5'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white truncate">{album.name}</h3>
                  {album.description && (
                    <p className="text-white/60 text-sm mt-1 line-clamp-2">{album.description}</p>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(album.id);
                  }}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-all ml-2"
                >
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Album Content */}
        <div className="lg:col-span-2">
          {selectedAlbum ? (
            <div className="glass border border-white/10 rounded-2xl p-6 animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">{selectedAlbum.name}</h2>
                <button
                  onClick={() => setShowAddImages(true)}
                  className="glass border border-white/10 rounded-xl px-4 py-2 text-sm font-medium text-white hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Images
                </button>
              </div>

              {albumImages.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-white/40 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-white/60 mb-4">No images in this album</p>
                  <button
                    onClick={() => setShowAddImages(true)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all"
                  >
                    Add First Image
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {albumImages.map((image, index) => (
                    <div
                      key={image.id}
                      className="relative aspect-square glass border border-white/10 rounded-xl overflow-hidden card-hover"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <Image
                        src={image.thumbnail_url}
                        alt={image.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="glass border border-white/10 rounded-2xl p-12 text-center">
              <svg className="w-16 h-16 text-white/40 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <p className="text-white/60">Select an album to view its images</p>
            </div>
          )}
        </div>
      </div>

      {showAddImages && selectedAlbum && (
        <AddImagesToAlbumModal
          album={selectedAlbum}
          onClose={() => {
            setShowAddImages(false);
            fetchAlbumImages(selectedAlbum.id);
          }}
        />
      )}
    </div>
  );
}