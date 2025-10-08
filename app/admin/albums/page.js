'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function AlbumsPage() {
  const [albums, setAlbums] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newAlbum, setNewAlbum] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    const res = await fetch('/api/albums');
    if (res.ok) {
      const data = await res.json();
      setAlbums(data);
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
    }
  };

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Albums</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-glass rounded-xl px-6 py-3 font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Album
        </button>
      </div>

      {showCreate && (
        <div className="glass rounded-2xl p-6 mb-8 slide-up">
          <form onSubmit={handleCreate} className="space-y-4">
            <input
              type="text"
              value={newAlbum.name}
              onChange={(e) => setNewAlbum({ ...newAlbum, name: e.target.value })}
              placeholder="Album name"
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 transition-colors"
            />
            <textarea
              value={newAlbum.description}
              onChange={(e) => setNewAlbum({ ...newAlbum, description: e.target.value })}
              placeholder="Description (optional)"
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 transition-colors resize-none"
            />
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-3 bg-white text-black font-medium rounded-xl hover:bg-white/90 transition-colors"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-6 py-3 glass rounded-xl hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {albums.map((album) => (
          <div
            key={album.id}
            className="glass rounded-2xl p-6 flex justify-between items-start hover:bg-white/10 transition-all"
          >
            <div>
              <h3 className="text-xl font-semibold mb-1">{album.name}</h3>
              {album.description && (
                <p className="text-white/60 text-sm">{album.description}</p>
              )}
            </div>
            <button
              onClick={() => handleDelete(album.id)}
              className="text-red-400 hover:text-red-300 transition-colors p-2 hover:bg-red-400/10 rounded-lg"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}