'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart3, Images, FolderOpen, Upload } from 'lucide-react';

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
    <div className="fade-in">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Images className="w-5 h-5 text-blue-400" />
            <p className="text-white/60 text-sm font-medium">Total Images</p>
          </div>
          <p className="text-4xl font-bold">{stats.images}</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <FolderOpen className="w-5 h-5 text-purple-400" />
            <p className="text-white/60 text-sm font-medium">Total Albums</p>
          </div>
          <p className="text-4xl font-bold">{stats.albums}</p>
        </div>
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-5 h-5 text-green-400" />
            <p className="text-white/60 text-sm font-medium">Recent Uploads</p>
          </div>
          <p className="text-4xl font-bold">{stats.recent.length}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Link
          href="/admin/upload"
          className="glass rounded-2xl p-8 hover:bg-white/10 transition-all text-center group card-hover"
        >
          <Upload className="w-12 h-12 text-blue-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
          <h2 className="text-xl font-semibold mb-2">Upload Images</h2>
          <p className="text-white/60 text-sm">Add new images to your gallery</p>
        </Link>
        <Link
          href="/admin/albums"
          className="glass rounded-2xl p-8 hover:bg-white/10 transition-all text-center group card-hover"
        >
          <FolderOpen className="w-12 h-12 text-purple-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
          <h2 className="text-xl font-semibold mb-2">Manage Albums</h2>
          <p className="text-white/60 text-sm">Create and organize albums</p>
        </Link>
      </div>

      {/* Recent Uploads */}
      {stats.recent.length > 0 && (
        <div className="slide-up">
          <h2 className="text-2xl font-semibold mb-6">Recent Uploads</h2>
          <div className="space-y-3">
            {stats.recent.map((image) => (
              <div key={image.id} className="glass rounded-xl p-4 flex items-center justify-between hover:bg-white/10 transition-all">
                <div>
                  <p className="font-medium">{image.title}</p>
                  <p className="text-sm text-white/40">
                    {new Date(image.created_at * 1000).toLocaleDateString()}
                  </p>
                </div>
                <Link
                  href={`/image/${image.id}`}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
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