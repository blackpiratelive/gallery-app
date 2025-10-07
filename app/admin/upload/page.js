'use client';

import { useState, useEffect } from 'react';
import exifr from 'exifr';

export default function UploadPage() {
  const [albums, setAlbums] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({});

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

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const generateWebP = async (file) => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 800;
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => resolve(blob), 'image/webp', 0.85);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const uploadToR2 = async (file, presignedUrl) => {
    await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    });
  };

  const uploadToVercelBlob = async (webpBlob, filename) => {
    const formData = new FormData();
    formData.append('file', webpBlob, filename);
    
    const res = await fetch(`/api/upload-url?type=blob&filename=${filename}`, {
      method: 'POST',
      body: formData,
    });
    
    const data = await res.json();
    return data.url;
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    const password = sessionStorage.getItem('admin_auth');

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      setProgress((prev) => ({ ...prev, [file.name]: 'Processing...' }));

      try {
        // Extract EXIF
        const exifData = await exifr.parse(file);
        
        // Generate WebP thumbnail
        const webpBlob = await generateWebP(file);
        
        // Get presigned URL for R2
        const r2Response = await fetch(
          `/api/upload-url?type=r2&filename=${encodeURIComponent(file.name)}`,
          { headers: { Authorization: `Bearer ${password}` } }
        );
        const { url: r2Url, publicUrl } = await r2Response.json();

        // Upload full image to R2
        await uploadToR2(file, r2Url);
        
        // Upload thumbnail to Vercel Blob
        const thumbnailUrl = await uploadToVercelBlob(
          webpBlob,
          `thumb_${file.name.replace(/.[^/.]+$/, '.webp')}`
        );

        // Save metadata
        const metadata = {
          title: file.name.replace(/.[^/.]+$/, '').replace(/[_-]/g, ' '),
          description: '',
          full_url: publicUrl,
          thumbnail_url: thumbnailUrl,
          album_id: null,
          featured: false,
          tags: '',
          exif_data: JSON.stringify(exifData || {}),
        };

        await fetch('/api/metadata', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${password}`,
          },
          body: JSON.stringify(metadata),
        });

        setProgress((prev) => ({ ...prev, [file.name]: 'Complete' }));
      } catch (error) {
        console.error('Upload failed:', error);
        setProgress((prev) => ({ ...prev, [file.name]: 'Failed' }));
      }
    }

    setUploading(false);
    setTimeout(() => {
      setSelectedFiles([]);
      setProgress({});
    }, 2000);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Upload Images</h1>

      <div className="max-w-2xl">
        <div className="bg-white/5 border border-white/10 rounded-lg p-8">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="w-full mb-6"
            disabled={uploading}
          />

          {selectedFiles.length > 0 && (
            <div className="mb-6">
              <p className="text-sm text-white/60 mb-4">
                {selectedFiles.length} file(s) selected
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedFiles.map((file) => (
                  <div key={file.name} className="flex justify-between items-center text-sm">
                    <span className="truncate">{file.name}</span>
                    <span className="text-white/40 ml-4">
                      {progress[file.name] || 'Ready'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={uploading || selectedFiles.length === 0}
            className="w-full px-4 py-3 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Upload Images'}
          </button>
        </div>
      </div>
    </div>
  );
}