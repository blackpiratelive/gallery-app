'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AdminNav from '@/components/AdminNav';
import { Lock } from 'lucide-react';

export default function AdminLayout({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const savedAuth = sessionStorage.getItem('admin_auth');
    if (savedAuth) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    sessionStorage.setItem('admin_auth', password);
    setIsAuthenticated(true);
    setError('');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-md px-4 fade-in">
          <div className="glass rounded-3xl p-8 shadow-2xl">
            <div className="flex justify-center mb-6">
              <div className="p-4 glass rounded-2xl">
                <Lock className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2 text-center">Admin Access</h1>
            <p className="text-white/60 text-center mb-8 text-sm">
              Enter your password to continue
            </p>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all"
                autoFocus
              />
              {error && (
                <p className="text-red-400 text-sm bg-red-400/10 px-4 py-2 rounded-lg">
                  {error}
                </p>
              )}
              <button
                type="submit"
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-[1.02] active:scale-100 shadow-lg"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {children}
      </div>
    </div>
  );
}