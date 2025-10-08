'use client';

import { Download } from 'lucide-react';
import { useState } from 'react';

export default function DownloadButton({ imageUrl, title }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download image');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="w-full mt-6 btn-glass rounded-2xl px-6 py-4 flex items-center justify-center gap-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Download className={`w-5 h-5 ${downloading ? 'animate-bounce' : ''}`} />
      {downloading ? 'Downloading...' : 'Download Full Size'}
    </button>
  );
}