'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ images: 0, albums: 0, recent: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const password = sessionStorage.getItem('admin_auth');
      const res = await fetch('/api/stats', {
        headers: { Authorization: `Bearer ${password}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <p className="text-white/60 text-sm mb-2">Total Images</p>
          <p className="text-4xl font-bold">{stats.images}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <p className="text-white/60 text-sm mb-2">Total Albums</p>
          <p className="text-4xl font-bold">{stats.albums}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <p className="text-white/60 text-sm mb-2">Recent Uploads</p>
          <p className="text-4xl font-bold">{stats.recent.length}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/admin/upload"
          className="bg-white/5 border border-white/10 rounded-lg p-8 hover:bg-white/10 transition-colors text-center"
        >
          <h2 className="text-xl font-semibold mb-2">Upload Images</h2>
          <p className="text-white/60 text-sm">Add new images to your gallery</p>
        </Link>
        <Link
          href="/admin/albums"
          className="bg-white/5 border border-white/10 rounded-lg p-8 hover:bg-white/10 transition-colors text-center"
        >
          <h2 className="text-xl font-semibold mb-2">Manage Albums</h2>
          <p className="text-white/60 text-sm">Create and organize albums</p>
        </Link>
      </div>

      {/* Recent Uploads */}
      {stats.recent.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">Recent Uploads</h2>
          <div className="space-y-3">
            {stats.recent.map((image) => (
              <div key={image.id} className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{image.title}</p>
                  <p className="text-sm text-white/40">
                    {new Date(image.created_at * 1000).toLocaleDateString()}
                  </p>
                </div>
                <Link
                  href={`/image/${image.id}`}
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  View →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}